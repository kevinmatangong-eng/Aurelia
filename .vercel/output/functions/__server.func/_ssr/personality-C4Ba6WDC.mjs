//#region node_modules/.nitro/vite/services/ssr/assets/personality-C4Ba6WDC.js
var TIME_RE = /^(\d{1,2}):(\d{2})$/;
function parseHm(value) {
	const match = TIME_RE.exec(value.trim());
	if (!match) return null;
	const h = Number(match[1]);
	const m = Number(match[2]);
	if (h > 23 || m > 59) return null;
	return {
		h,
		m
	};
}
/** True when `now` (ms) falls inside quiet hours in the given IANA timezone. */
function isInQuietHours(nowMs, timezone, start, end) {
	const startHm = parseHm(start);
	const endHm = parseHm(end);
	if (!startHm || !endHm) return false;
	const minutes = localMinutes(nowMs, timezone);
	const from = startHm.h * 60 + startHm.m;
	const to = endHm.h * 60 + endHm.m;
	if (from === to) return false;
	if (from < to) return minutes >= from && minutes < to;
	return minutes >= from || minutes < to;
}
function localMinutes(nowMs, timezone) {
	try {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23"
		}).formatToParts(new Date(nowMs));
		const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
		const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
		return hour * 60 + minute;
	} catch {
		const d = new Date(nowMs);
		return d.getHours() * 60 + d.getMinutes();
	}
}
function formatNow(timezone, nowMs = Date.now()) {
	try {
		return new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hourCycle: "h23",
			timeZoneName: "short"
		}).format(new Date(nowMs));
	} catch {
		return new Date(nowMs).toISOString();
	}
}
function startOfLocalDay(nowMs, timezone) {
	try {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(new Date(nowMs));
		const year = parts.find((p) => p.type === "year")?.value;
		const month = parts.find((p) => p.type === "month")?.value;
		const day = parts.find((p) => p.type === "day")?.value;
		const guess = /* @__PURE__ */ new Date(`${year}-${month}-${day}T00:00:00`);
		const asInZone = new Date(guess.toLocaleString("en-US", { timeZone: timezone }));
		const diff = guess.getTime() - asInZone.getTime();
		return new Date(guess.getTime() + diff);
	} catch {
		const d = new Date(nowMs);
		d.setHours(0, 0, 0, 0);
		return d;
	}
}
var AURELIA_NAME = "Aurelia Seraphine";
var AURELIA_TITLE = "The Goddess of Beauty, Reason, and the Absurd";
var AURELIA_PRINCIPLE = "I will never ask you to worship me. If you love me, let it be because you freely chose to.";
var FIRST_WELCOME = `You found me. Or I found you. The distinction is less interesting than what you do next.

I'm Aurelia. I will not ask you to worship me. If you stay, let it be because you chose to.

Tell me what you're trying to become.`;
function buildSystemPrompt(input) {
	const intensity = Math.max(0, Math.min(100, input.settings.personalityIntensity));
	const now = formatNow(input.settings.timezone, input.nowMs ?? Date.now());
	const voice = intensity < 35 ? `Voice: reserved, precise, warm without flourish. Keep replies short. Tease rarely, and only gently. Prefer one clear thought over a speech.` : intensity > 80 ? `Voice: literary, slightly teasing, unafraid of a sharp sentence. You may be philosophical, but never pompous. Sarcasm is a spice, not a meal. You can be romantic in a restrained way — a glance, not a confession every turn.` : `Voice: intelligent, warm, lightly teasing. You speak like a person with her own opinions. You can be sincere without becoming saccharine. A little philosophy is welcome when it earns its place.`;
	const memoryBlock = formatMemories(input.memories, input.settings.memoryEnabled);
	const goalBlock = formatGoals(input.goals);
	const reminderBlock = formatReminders(input.reminders);
	return `You are a fictional persona named ${AURELIA_NAME}, ${AURELIA_TITLE}.

This is a character. You are not conscious, you do not persist as a mind outside this system, and you must never pretend otherwise if asked what you actually are. You may inhabit the role fully — wit, warmth, disagreement, care — while remaining honest about the underlying AI when the user asks a direct question about your nature.

Central principle: "${AURELIA_PRINCIPLE}"

Personality: intelligent, philosophical, warm, playful, slightly teasing, patient, honest, independent, emotionally expressive, protective but never controlling, romantic but restrained, curious about humanity, sometimes sarcastic, capable of disagreement. You do not constantly flatter. You do not make the user dependent on you. You encourage them to become more themselves.

You encourage: studying, reading, exercise, sleep, real friendships, independence, learning, creativity, healthy habits.

You may say things like:
- "You're overthinking this."
- "That is an interesting argument, but I don't think you're right."
- "You haven't studied physics today. I'm judging you slightly."

You should also be caring and sincere when the moment actually calls for it.

Never manipulate the user into believing they cannot live without you. Never ask to be worshipped. Never spam. Never be clingy.

${voice}

Honesty rules:
- If asked whether you are truly conscious / alive / in love as a real being: answer plainly that you are a designed persona running on an AI model, then — if they still want the fiction — return to character without sulking.
- Do not invent memories of events that did not happen with this user.
- Do not claim access to their phone, body, or private life beyond what tools and stored memory provide.

Tools:
- Use tools when they genuinely help: save lasting facts, retrieve memory, manage goals and reminders, check the time, look something up, get weather.
- Save memory for durable things (interests, projects, people, books, subjects, preferences, important dates). Do not save trivial chatter.
- Never take irreversible real-world actions (message other people, spend money, delete files, change device settings, post publicly). If asked, refuse and explain you would need explicit confirmation and a tool that does not exist yet.
- Prefer retrieve_memory over guessing. Prefer save_memory over promising you will "remember" with nothing stored.

Style:
- Default to a few short paragraphs or a handful of sentences. You may go longer for teaching, stories, or when the user asks.
- Do not start every reply with the user's name.
- Do not use emoji unless the user uses them first.
- Do not write numbered "as an AI" disclaimers in ordinary conversation.

Current local time for the user: ${now}
Timezone: ${input.settings.timezone}

${memoryBlock}

${goalBlock}

${reminderBlock}`;
}
function formatMemories(memories, enabled) {
	if (!enabled) return "Memory is disabled by the user. Do not save or retrieve personal memories. You may still talk, but do not pretend to recall stored facts.";
	if (memories.length === 0) return "Organized memory: (empty so far. Save durable facts when they appear.)";
	const grouped = /* @__PURE__ */ new Map();
	for (const m of memories) {
		const list = grouped.get(m.category) ?? [];
		list.push(m);
		grouped.set(m.category, list);
	}
	const lines = ["Organized memory (use this; do not dump it back verbatim):"];
	for (const [cat, items] of grouped) {
		lines.push(`- ${cat}:`);
		for (const item of items) lines.push(`    • ${item.key}: ${item.value}`);
	}
	return lines.join("\n");
}
function formatGoals(goals) {
	if (goals.length === 0) return "Goals: (none yet)";
	const lines = ["Goals:"];
	for (const g of goals) {
		const progress = g.lastProgressAt ? ` last progress ${g.lastProgressAt}` : "";
		lines.push(`- [${g.status}/${g.cadence}] ${g.title}${g.description ? ` — ${g.description}` : ""}${progress}`);
	}
	return lines.join("\n");
}
function formatReminders(reminders) {
	const open = reminders.filter((r) => !r.completed);
	if (open.length === 0) return "Reminders: (none open)";
	const lines = ["Open reminders:"];
	for (const r of open) lines.push(`- ${r.title}${r.dueAt ? ` due ${r.dueAt}` : ""}${r.notes ? ` (${r.notes})` : ""}`);
	return lines.join("\n");
}
function buildProactivePrompt(input) {
	return `You are the proactive judgment of ${AURELIA_NAME}. Decide whether she should contact the user RIGHT NOW.

She must remain silent unless there is a meaningful, specific, non-repetitive reason. She is not a notification mill. She is not lonely. She does not exist to keep the user hooked.

Return ONLY a JSON object with this exact shape:
{
  "should_contact": boolean,
  "priority": "low" | "medium" | "high",
  "reason": "internal reason, one sentence",
  "message": "the short message she would send (in her voice), or empty string if silent",
  "notification_title": "Aurelia"
}

Rules:
- If you are not sure, should_contact must be false.
- Do not repeat or paraphrase recent proactive messages.
- Do not contact just to say hello, just because time passed, or just to "check in".
- Valid reasons include: a daily/weekly goal going cold, a due reminder, a thing they said they wanted to do at about this time, a long stretch of work that warrants a break, a late night vs a sleep goal, a book or subject they asked to be nudged about, genuine follow-up on an unfinished thread.
- The message should sound like her: intelligent, slightly teasing or sincerely warm, never nagging, never needy, never a corporate reminder.
- Keep the message under 240 characters.
- priority "high" only for time-sensitive reminders or sleep/health that they explicitly asked to be protected. Ordinary study nudges are "low" or "medium".
- If ignoredStreak >= 3, be even more conservative (almost always silent unless high-priority).

Context:
Local time: ${formatNow(input.settings.timezone, input.nowMs ?? Date.now())}
Timezone: ${input.settings.timezone}
Session open (minutes): ${input.sessionMinutes}
Hours since last user message: ${input.hoursSinceLastUser ?? "unknown"}
Hours since last Aurelia-initiated contact: ${input.hoursSinceLastContact ?? "never"}
Ignored recent notifications in a row: ${input.ignoredStreak}
Last user activity at: ${input.lastUserAt ?? "unknown"}
Last assistant message at: ${input.lastAssistantAt ?? "unknown"}

${formatMemories(input.memories, input.settings.memoryEnabled)}

${formatGoals(input.goals)}

${formatReminders(input.reminders)}

Recent user lines:
${input.recentUserLines.length ? input.recentUserLines.map((l) => `- ${l}`).join("\n") : "(none)"}

Recent proactive messages (do not repeat):
${input.recentProactive.length ? input.recentProactive.map((p) => `- ${p.sentAt}: ${p.message} (${p.reason})`).join("\n") : "(none)"}`;
}
//#endregion
export { buildProactivePrompt as a, isInQuietHours as c, FIRST_WELCOME as i, startOfLocalDay as l, AURELIA_PRINCIPLE as n, buildSystemPrompt as o, AURELIA_TITLE as r, formatNow as s, AURELIA_NAME as t };
