import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { FIRST_WELCOME } from "./personality";
import * as repo from "./repo";
import { runAssistantTurn } from "./chat-loop";
import { evaluateProactive } from "./proactive";
import type {
  ChatMessage,
  Conversation,
  EvaluateProactiveResult,
  Goal,
  GoalCadence,
  GoalStatus,
  Memory,
  MemoryCategory,
  Reminder,
  SendMessageResult,
  UserSettings,
} from "./types";
import { MEMORY_CATEGORIES } from "./types";

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<UserSettings> => {
    const db = await repo.sql();
    return repo.ensureSettings(db, context.userId);
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((patch: Partial<UserSettings>) => patch)
  .handler(async ({ context, data }): Promise<UserSettings> => {
    const db = await repo.sql();
    const safe: Partial<UserSettings> = { ...data };
    if (typeof safe.personalityIntensity === "number") {
      safe.personalityIntensity = Math.max(0, Math.min(100, Math.round(safe.personalityIntensity)));
    }
    if (typeof safe.maxProactivePerDay === "number") {
      safe.maxProactivePerDay = Math.max(0, Math.min(8, Math.round(safe.maxProactivePerDay)));
    }
    return repo.updateSettings(db, context.userId, safe);
  });

export const pingActivity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { timezone?: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.touchActive(db, context.userId, data.timezone);
    return { ok: true as const };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Conversation[]> => {
    const db = await repo.sql();
    return repo.listConversations(db, context.userId);
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string }) => input)
  .handler(async ({ context, data }): Promise<ChatMessage[]> => {
    const db = await repo.sql();
    const convo = await repo.getConversation(db, context.userId, data.conversationId);
    if (!convo) return [];
    await repo.markConversationRead(db, context.userId, data.conversationId);
    const messages = await repo.listMessages(db, context.userId, data.conversationId);
    return messages.filter((m) => m.role === "user" || m.role === "assistant");
  });

export const startConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { withWelcome?: boolean } = {}) => input)
  .handler(async ({ context, data }): Promise<{ conversation: Conversation; messages: ChatMessage[] }> => {
    const db = await repo.sql();
    const existing = await repo.listConversations(db, context.userId);
    const conversation = await repo.createConversation(
      db,
      context.userId,
      existing.length === 0 ? "Beginning" : "New thread",
    );
    const messages: ChatMessage[] = [];
    if (data.withWelcome !== false && existing.length === 0) {
      const welcome = await repo.insertMessage(db, {
        userId: context.userId,
        conversationId: conversation.id,
        role: "assistant",
        content: FIRST_WELCOME,
      });
      messages.push(welcome);
    }
    return { conversation, messages };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId?: string; content: string }) => input)
  .handler(async ({ context, data }): Promise<SendMessageResult> => {
    const content = data.content.trim().slice(0, 8000);
    if (!content) {
      throw new Error("Message is empty");
    }
    const db = await repo.sql();
    await repo.touchActive(db, context.userId);
    let conversationId = data.conversationId;
    if (!conversationId) {
      const created = await repo.createConversation(db, context.userId);
      conversationId = created.id;
    } else {
      const exists = await repo.getConversation(db, context.userId, conversationId);
      if (!exists) {
        const created = await repo.createConversation(db, context.userId);
        conversationId = created.id;
      }
    }
    const userMessage = await repo.insertMessage(db, {
      userId: context.userId,
      conversationId,
      role: "user",
      content,
    });
    await repo.markConversationRead(db, context.userId, conversationId);
    const settings = await repo.ensureSettings(db, context.userId);
    try {
      const assistantMessage = await runAssistantTurn({
        db,
        userId: context.userId,
        conversationId,
        settings,
      });
      return { conversationId, userMessage, assistantMessage };
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes("AI is not available")
          ? "Aurelia is quiet — the thinking layer is not available in this environment yet."
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      const assistantMessage = await repo.insertMessage(db, {
        userId: context.userId,
        conversationId,
        role: "assistant",
        content: message.includes("not available")
          ? message
          : `I hit a wall thinking that through. ${message}`,
      });
      return { conversationId, userMessage, assistantMessage, error: message };
    }
  });

export const regenerateResponse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string }) => input)
  .handler(async ({ context, data }): Promise<SendMessageResult> => {
    const db = await repo.sql();
    const messages = await repo.listMessages(db, context.userId, data.conversationId);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw new Error("Nothing to regenerate");
    await repo.deleteMessagesAfter(db, context.userId, data.conversationId, lastUser.createdAt);
    const settings = await repo.ensureSettings(db, context.userId);
    const assistantMessage = await runAssistantTurn({
      db,
      userId: context.userId,
      conversationId: data.conversationId,
      settings,
    });
    return {
      conversationId: data.conversationId,
      userMessage: lastUser,
      assistantMessage,
    };
  });

export const removeConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.deleteConversation(db, context.userId, data.conversationId);
    return { ok: true as const };
  });

export const clearConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.clearConversation(db, context.userId, data.conversationId);
    return { ok: true as const };
  });

export const wipeConversations = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await repo.sql();
    await repo.deleteAllConversations(db, context.userId);
    return { ok: true as const };
  });

export const listMemories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Memory[]> => {
    const db = await repo.sql();
    return repo.listMemories(db, context.userId);
  });

export const saveMemory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { id?: string; category: MemoryCategory; key: string; value: string }) => input,
  )
  .handler(async ({ context, data }): Promise<Memory> => {
    const db = await repo.sql();
    const category = MEMORY_CATEGORIES.includes(data.category) ? data.category : "other";
    if (data.id) {
      await repo.updateMemoryRow(db, context.userId, data.id, {
        category,
        key: data.key,
        value: data.value,
      });
      const all = await repo.listMemories(db, context.userId);
      const found = all.find((m) => m.id === data.id);
      if (found) return found;
    }
    return repo.upsertMemory(db, context.userId, {
      category,
      key: data.key,
      value: data.value,
    });
  });

export const removeMemory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.deleteMemory(db, context.userId, data.id);
    return { ok: true as const };
  });

export const wipeMemories = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await repo.sql();
    await repo.deleteAllMemories(db, context.userId);
    return { ok: true as const };
  });

export const listGoals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Goal[]> => {
    const db = await repo.sql();
    return repo.listGoals(db, context.userId);
  });

export const saveGoal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id?: string;
      title: string;
      description?: string;
      status?: GoalStatus;
      cadence?: GoalCadence;
    }) => input,
  )
  .handler(async ({ context, data }): Promise<Goal> => {
    const db = await repo.sql();
    return repo.upsertGoal(db, context.userId, data);
  });

export const markGoalProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.noteGoalProgress(db, context.userId, data.id);
    return { ok: true as const };
  });

export const removeGoal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.deleteGoal(db, context.userId, data.id);
    return { ok: true as const };
  });

export const listReminders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Reminder[]> => {
    const db = await repo.sql();
    return repo.listReminders(db, context.userId);
  });

export const saveReminder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; notes?: string; dueAt?: string | null }) => input)
  .handler(async ({ context, data }): Promise<Reminder> => {
    const db = await repo.sql();
    return repo.createReminder(db, context.userId, data);
  });

export const toggleReminder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; completed: boolean }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.setReminderCompleted(db, context.userId, data.id, data.completed);
    return { ok: true as const };
  });

export const removeReminder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.deleteReminder(db, context.userId, data.id);
    return { ok: true as const };
  });

export const runProactiveCheck = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionMinutes?: number; force?: boolean } = {}) => input)
  .handler(async ({ context, data }): Promise<EvaluateProactiveResult> => {
    const db = await repo.sql();
    return evaluateProactive({
      db,
      userId: context.userId,
      sessionMinutes: data.sessionMinutes,
      force: data.force,
    });
  });

export const acknowledgeProactive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const db = await repo.sql();
    await repo.markProactiveOpened(db, context.userId, data.id);
    return { ok: true as const };
  });
