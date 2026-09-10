import type { Sql } from "@/lib/db";
import { getAIService } from "./ai";
import { buildProactivePrompt } from "./personality";
import * as repo from "./repo";
import { isInQuietHours, startOfLocalDay } from "./time";
import type { EvaluateProactiveResult, ProactiveDecision, ProactivePriority } from "./types";

const FREQ = {
  quiet: { max: 1, cooldownMs: 8 * 3600_000 },
  thoughtful: { max: 3, cooldownMs: 3 * 3600_000 },
  present: { max: 5, cooldownMs: 90 * 60_000 },
} as const;

function overlapScore(a: string, b: string): number {
  const tokens = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let hit = 0;
  for (const w of A) if (B.has(w)) hit += 1;
  return hit / Math.min(A.size, B.size);
}

function parseDecision(raw: string): ProactiveDecision | null {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const obj = JSON.parse(raw.slice(start, end + 1)) as Partial<ProactiveDecision>;
    const priority: ProactivePriority =
      obj.priority === "high" || obj.priority === "low" || obj.priority === "medium"
        ? obj.priority
        : "medium";
    return {
      should_contact: Boolean(obj.should_contact),
      priority,
      reason: String(obj.reason ?? "").slice(0, 400),
      message: String(obj.message ?? "").trim().slice(0, 280),
      notification_title: String(obj.notification_title ?? "Aurelia").slice(0, 40) || "Aurelia",
    };
  } catch {
    return null;
  }
}

export async function evaluateProactive(input: {
  db: Sql;
  userId: string;
  sessionMinutes?: number;
  force?: boolean;
}): Promise<EvaluateProactiveResult> {
  const settings = await repo.ensureSettings(input.db, input.userId);
  const now = Date.now();

  if (!settings.proactiveEnabled && !input.force) {
    return { contacted: false, silentReason: "proactive_disabled" };
  }

  const quiet = isInQuietHours(
    now,
    settings.timezone,
    settings.quietHoursStart,
    settings.quietHoursEnd,
  );

  const freq = FREQ[settings.proactiveFrequency] ?? FREQ.thoughtful;
  const dayStart = startOfLocalDay(now, settings.timezone);
  const todayCount = await repo.countProactiveSince(
    input.db,
    input.userId,
    dayStart.toISOString(),
  );
  const cap = Math.min(settings.maxProactivePerDay, freq.max);

  if (!input.force && todayCount >= cap) {
    return { contacted: false, silentReason: "daily_cap" };
  }

  if (!input.force && settings.lastProactiveAt) {
    const elapsed = now - Date.parse(settings.lastProactiveAt);
    if (Number.isFinite(elapsed) && elapsed < freq.cooldownMs) {
      return { contacted: false, silentReason: "cooldown" };
    }
  }

  const recentEvents = await repo.listProactiveEvents(input.db, input.userId, 8);
  let ignoredStreak = 0;
  for (const ev of recentEvents) {
    if (ev.ignored && !ev.openedAt) ignoredStreak += 1;
    else break;
  }

  const [memories, goals, reminders, userLines, times] = await Promise.all([
    settings.memoryEnabled ? repo.listMemories(input.db, input.userId) : Promise.resolve([]),
    repo.listGoals(input.db, input.userId),
    repo.listReminders(input.db, input.userId),
    repo.recentUserLines(input.db, input.userId, 10),
    repo.lastMessageTimes(input.db, input.userId),
  ]);

  const hoursSince = (iso: string | null): number | null => {
    if (!iso) return null;
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return null;
    return Math.round(((now - t) / 3600_000) * 10) / 10;
  };

  const prompt = buildProactivePrompt({
    settings,
    memories,
    goals,
    reminders,
    recentUserLines: userLines.map((l) => l.content).reverse(),
    recentProactive: recentEvents.map((e) => ({
      message: e.message,
      reason: e.reason,
      sentAt: e.sentAt,
    })),
    lastUserAt: times.lastUserAt,
    lastAssistantAt: times.lastAssistantAt,
    sessionMinutes: input.sessionMinutes ?? 0,
    hoursSinceLastContact: hoursSince(settings.lastProactiveAt),
    hoursSinceLastUser: hoursSince(times.lastUserAt),
    ignoredStreak,
  });

  let decision: ProactiveDecision | null = null;
  try {
    const ai = getAIService();
    const response = await ai.chat({
      model: settings.model || "grok-4.5",
      messages: [
        {
          role: "system",
          content:
            "You decide whether a personal companion should interrupt the user. Be conservative. Output JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      maxTokens: 280,
      responseFormat: "json_object",
    });
    decision = parseDecision(response.content ?? "");
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_error";
    return { contacted: false, silentReason: message };
  }

  if (!decision || !decision.should_contact || !decision.message) {
    return { contacted: false, silentReason: decision?.reason || "no_reason" };
  }

  if (quiet && !(settings.allowImportantDuringQuiet && decision.priority === "high")) {
    return { contacted: false, silentReason: "quiet_hours" };
  }

  if (ignoredStreak >= 3 && decision.priority !== "high" && !input.force) {
    return { contacted: false, silentReason: "ignored_streak" };
  }

  const similar = recentEvents.some(
    (ev) => overlapScore(ev.message, decision!.message) > 0.62,
  );
  if (similar && !input.force) {
    return { contacted: false, silentReason: "repetitive" };
  }

  const conversation = await repo.createConversation(
    input.db,
    input.userId,
    decision.notification_title || "Aurelia",
  );
  await repo.insertMessage(input.db, {
    userId: input.userId,
    conversationId: conversation.id,
    role: "assistant",
    content: decision.message,
  });
  await repo.markConversationUnread(input.db, input.userId, conversation.id);
  const event = await repo.insertProactiveEvent(input.db, input.userId, {
    conversationId: conversation.id,
    priority: decision.priority,
    reason: decision.reason,
    message: decision.message,
    notificationTitle: decision.notification_title,
  });

  return {
    contacted: true,
    event,
    conversationId: conversation.id,
  };
}
