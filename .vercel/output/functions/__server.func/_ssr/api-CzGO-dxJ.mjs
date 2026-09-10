import { i as asNumber, n as asIso, o as nid, r as asIsoRequired, s as truncate, t as asBool } from "./utils-CKTu_cjh.mjs";
import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CbvwpY72.mjs";
import { r as getSql } from "./db--TuF1GtY.mjs";
import { a as buildProactivePrompt, c as isInQuietHours, i as FIRST_WELCOME, l as startOfLocalDay, o as buildSystemPrompt, s as formatNow } from "./personality-C4Ba6WDC.mjs";
import { t as MEMORY_CATEGORIES } from "./types-C5FoUkPV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CzGO-dxJ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function sql() {
	return getSql();
}
async function ensureSettings(db, userId) {
	await db`insert into user_settings (user_id) values (${userId}) on conflict (user_id) do nothing`;
	const row = (await db`
    select * from user_settings where user_id = ${userId} limit 1
  `)[0];
	if (!row) throw new Error("Failed to load settings");
	return mapSettings(row);
}
function mapSettings(row) {
	const freq = String(row.proactive_frequency ?? "thoughtful");
	const theme = String(row.theme ?? "void");
	return {
		userId: String(row.user_id),
		notificationsEnabled: asBool(row.notifications_enabled),
		proactiveEnabled: asBool(row.proactive_enabled),
		proactiveFrequency: [
			"quiet",
			"thoughtful",
			"present"
		].includes(freq) ? freq : "thoughtful",
		maxProactivePerDay: asNumber(row.max_proactive_per_day, 3),
		quietHoursStart: String(row.quiet_hours_start ?? "23:00"),
		quietHoursEnd: String(row.quiet_hours_end ?? "08:00"),
		allowImportantDuringQuiet: asBool(row.allow_important_during_quiet),
		memoryEnabled: asBool(row.memory_enabled),
		personalityIntensity: asNumber(row.personality_intensity, 70),
		notificationSound: asBool(row.notification_sound),
		theme: theme === "dawn" ? "dawn" : "void",
		model: String(row.model ?? "grok-4.5"),
		timezone: String(row.timezone ?? "UTC"),
		lastActiveAt: asIso(row.last_active_at),
		lastProactiveAt: asIso(row.last_proactive_at)
	};
}
async function updateSettings(db, userId, patch) {
	await ensureSettings(db, userId);
	const next = {
		...await ensureSettings(db, userId),
		...patch,
		userId
	};
	await db`
    update user_settings set
      notifications_enabled = ${next.notificationsEnabled},
      proactive_enabled = ${next.proactiveEnabled},
      proactive_frequency = ${next.proactiveFrequency},
      max_proactive_per_day = ${next.maxProactivePerDay},
      quiet_hours_start = ${next.quietHoursStart},
      quiet_hours_end = ${next.quietHoursEnd},
      allow_important_during_quiet = ${next.allowImportantDuringQuiet},
      memory_enabled = ${next.memoryEnabled},
      personality_intensity = ${next.personalityIntensity},
      notification_sound = ${next.notificationSound},
      theme = ${next.theme},
      model = ${next.model},
      timezone = ${next.timezone},
      updated_at = now()
    where user_id = ${userId}
  `;
	return ensureSettings(db, userId);
}
async function touchActive(db, userId, timezone) {
	await ensureSettings(db, userId);
	if (timezone) await db`
      update user_settings
      set last_active_at = now(), timezone = ${timezone}, updated_at = now()
      where user_id = ${userId}
    `;
	else await db`
      update user_settings
      set last_active_at = now(), updated_at = now()
      where user_id = ${userId}
    `;
}
async function listConversations$1(db, userId) {
	return (await db`
    select
      c.id, c.user_id, c.title, c.created_at, c.updated_at, c.archived, c.unread,
      (
        select m.content from messages m
        where m.conversation_id = c.id and m.role in ('user','assistant') and m.content <> ''
        order by m.created_at desc
        limit 1
      ) as last_message
    from conversations c
    where c.user_id = ${userId} and c.archived = false
    order by c.updated_at desc
  `).map(mapConversation);
}
function mapConversation(row) {
	return {
		id: String(row.id),
		userId: String(row.user_id),
		title: String(row.title ?? "Conversation"),
		createdAt: asIsoRequired(row.created_at),
		updatedAt: asIsoRequired(row.updated_at),
		archived: asBool(row.archived),
		unread: asBool(row.unread),
		lastMessage: row.last_message == null ? null : String(row.last_message)
	};
}
async function getConversation(db, userId, id) {
	const rows = await db`
    select c.*, null as last_message
    from conversations c
    where c.id = ${id} and c.user_id = ${userId}
    limit 1
  `;
	return rows[0] ? mapConversation(rows[0]) : null;
}
async function createConversation(db, userId, title = "Conversation") {
	const id = nid();
	await db`
    insert into conversations (id, user_id, title)
    values (${id}, ${userId}, ${title})
  `;
	const created = await getConversation(db, userId, id);
	if (!created) throw new Error("Failed to create conversation");
	return created;
}
async function renameConversation(db, userId, id, title) {
	await db`
    update conversations set title = ${title}, updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}
async function markConversationRead(db, userId, id) {
	await db`
    update conversations set unread = false where id = ${id} and user_id = ${userId}
  `;
}
async function markConversationUnread(db, userId, id) {
	await db`
    update conversations set unread = true, updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}
async function touchConversation(db, userId, id) {
	await db`
    update conversations set updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}
async function deleteConversation(db, userId, id) {
	await db`delete from conversations where id = ${id} and user_id = ${userId}`;
}
async function deleteAllConversations(db, userId) {
	await db`delete from conversations where user_id = ${userId}`;
}
async function clearConversation$1(db, userId, id) {
	await db`delete from messages where conversation_id = ${id} and user_id = ${userId}`;
	await db`
    update conversations set updated_at = now(), unread = false
    where id = ${id} and user_id = ${userId}
  `;
}
async function listMessages(db, userId, conversationId) {
	return (await db`
    select id, conversation_id, role, content, created_at, tool_name
    from messages
    where user_id = ${userId} and conversation_id = ${conversationId}
    order by created_at asc
  `).map(mapMessage);
}
function mapMessage(row) {
	return {
		id: String(row.id),
		conversationId: String(row.conversation_id),
		role: String(row.role),
		content: String(row.content ?? ""),
		createdAt: asIsoRequired(row.created_at),
		toolName: row.tool_name == null ? null : String(row.tool_name)
	};
}
async function insertMessage(db, input) {
	const id = nid();
	await db`
    insert into messages (id, user_id, conversation_id, role, content, tool_name, tool_call_id, metadata)
    values (
      ${id},
      ${input.userId},
      ${input.conversationId},
      ${input.role},
      ${input.content},
      ${input.toolName ?? null},
      ${input.toolCallId ?? null},
      ${input.metadata ?? null}
    )
  `;
	await touchConversation(db, input.userId, input.conversationId);
	return {
		id,
		conversationId: input.conversationId,
		role: input.role,
		content: input.content,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		toolName: input.toolName ?? null
	};
}
async function deleteMessagesAfter(db, userId, conversationId, afterIso) {
	await db`
    delete from messages
    where user_id = ${userId}
      and conversation_id = ${conversationId}
      and created_at > ${afterIso}
  `;
}
async function listMemories$1(db, userId) {
	return (await db`
    select id, category, key, value, created_at, updated_at
    from memories
    where user_id = ${userId}
    order by category, updated_at desc
  `).map(mapMemory);
}
function mapMemory(row) {
	return {
		id: String(row.id),
		category: String(row.category),
		key: String(row.key),
		value: String(row.value),
		createdAt: asIsoRequired(row.created_at),
		updatedAt: asIsoRequired(row.updated_at)
	};
}
async function upsertMemory(db, userId, input) {
	const key = input.key.trim().slice(0, 80);
	const value = input.value.trim().slice(0, 2e3);
	const category = input.category;
	const existing = await db`
    select id from memories
    where user_id = ${userId} and category = ${category} and key = ${key}
    limit 1
  `;
	if (existing[0]) {
		const id = String(existing[0].id);
		await db`
      update memories
      set value = ${value},
          source_conversation_id = ${input.sourceConversationId ?? null},
          updated_at = now()
      where id = ${id} and user_id = ${userId}
    `;
		return mapMemory((await db`
      select id, category, key, value, created_at, updated_at
      from memories where id = ${id} and user_id = ${userId}
    `)[0]);
	}
	const id = nid();
	await db`
    insert into memories (id, user_id, category, key, value, source_conversation_id)
    values (${id}, ${userId}, ${category}, ${key}, ${value}, ${input.sourceConversationId ?? null})
  `;
	return mapMemory((await db`
    select id, category, key, value, created_at, updated_at
    from memories where id = ${id}
  `)[0]);
}
async function updateMemoryRow(db, userId, id, patch) {
	const current = (await db`
    select category, key, value from memories where id = ${id} and user_id = ${userId} limit 1
  `)[0];
	if (!current) return;
	await db`
    update memories
    set category = ${patch.category ?? String(current.category)}, key = ${(patch.key ?? String(current.key)).trim().slice(0, 80)}, value = ${(patch.value ?? String(current.value)).trim().slice(0, 2e3)}, updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}
async function deleteMemory(db, userId, id) {
	await db`delete from memories where id = ${id} and user_id = ${userId}`;
}
async function deleteAllMemories(db, userId) {
	await db`delete from memories where user_id = ${userId}`;
}
async function listGoals$1(db, userId) {
	return (await db`
    select id, title, description, status, cadence, last_progress_at, created_at
    from goals
    where user_id = ${userId}
    order by
      case status when 'active' then 0 when 'paused' then 1 else 2 end,
      created_at desc
  `).map(mapGoal);
}
function mapGoal(row) {
	return {
		id: String(row.id),
		title: String(row.title),
		description: String(row.description ?? ""),
		status: String(row.status),
		cadence: String(row.cadence ?? "none"),
		lastProgressAt: asIso(row.last_progress_at),
		createdAt: asIsoRequired(row.created_at)
	};
}
async function upsertGoal(db, userId, input) {
	const title = input.title.trim().slice(0, 160);
	const description = (input.description ?? "").trim().slice(0, 800);
	const status = input.status ?? "active";
	const cadence = input.cadence ?? "none";
	if (input.id) {
		await db`
      update goals
      set title = ${title},
          description = ${description},
          status = ${status},
          cadence = ${cadence},
          updated_at = now()
      where id = ${input.id} and user_id = ${userId}
    `;
		const rows = await db`
      select id, title, description, status, cadence, last_progress_at, created_at
      from goals where id = ${input.id} and user_id = ${userId}
    `;
		if (!rows[0]) throw new Error("Goal not found");
		return mapGoal(rows[0]);
	}
	const id = nid();
	await db`
    insert into goals (id, user_id, title, description, status, cadence)
    values (${id}, ${userId}, ${title}, ${description}, ${status}, ${cadence})
  `;
	return mapGoal((await db`
    select id, title, description, status, cadence, last_progress_at, created_at
    from goals where id = ${id}
  `)[0]);
}
async function noteGoalProgress(db, userId, id) {
	await db`
    update goals set last_progress_at = now(), updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}
async function deleteGoal(db, userId, id) {
	await db`delete from goals where id = ${id} and user_id = ${userId}`;
}
async function listReminders$1(db, userId) {
	return (await db`
    select id, title, notes, due_at, completed, created_at
    from reminders
    where user_id = ${userId}
    order by completed asc, due_at asc nulls last, created_at desc
  `).map(mapReminder);
}
function mapReminder(row) {
	return {
		id: String(row.id),
		title: String(row.title),
		notes: String(row.notes ?? ""),
		dueAt: asIso(row.due_at),
		completed: asBool(row.completed),
		createdAt: asIsoRequired(row.created_at)
	};
}
async function createReminder(db, userId, input) {
	const id = nid();
	await db`
    insert into reminders (id, user_id, title, notes, due_at)
    values (${id}, ${userId}, ${input.title.trim().slice(0, 160)}, ${(input.notes ?? "").trim().slice(0, 800)}, ${input.dueAt ?? null})
  `;
	return mapReminder((await db`
    select id, title, notes, due_at, completed, created_at from reminders where id = ${id}
  `)[0]);
}
async function setReminderCompleted(db, userId, id, completed) {
	await db`
    update reminders set completed = ${completed}
    where id = ${id} and user_id = ${userId}
  `;
}
async function deleteReminder(db, userId, id) {
	await db`delete from reminders where id = ${id} and user_id = ${userId}`;
}
async function listProactiveEvents(db, userId, limit = 12) {
	return (await db`
    select id, conversation_id, priority, reason, message, notification_title, sent_at, opened_at, ignored
    from proactive_events
    where user_id = ${userId}
    order by sent_at desc
    limit ${limit}
  `).map(mapProactive);
}
function mapProactive(row) {
	return {
		id: String(row.id),
		conversationId: row.conversation_id == null ? null : String(row.conversation_id),
		priority: String(row.priority),
		reason: String(row.reason),
		message: String(row.message),
		notificationTitle: String(row.notification_title ?? "Aurelia"),
		sentAt: asIsoRequired(row.sent_at),
		openedAt: asIso(row.opened_at),
		ignored: asBool(row.ignored)
	};
}
async function insertProactiveEvent(db, userId, input) {
	const id = nid();
	await db`
    insert into proactive_events
      (id, user_id, conversation_id, priority, reason, message, notification_title)
    values (
      ${id}, ${userId}, ${input.conversationId}, ${input.priority},
      ${input.reason}, ${input.message}, ${input.notificationTitle}
    )
  `;
	await db`
    update user_settings set last_proactive_at = now(), updated_at = now()
    where user_id = ${userId}
  `;
	return {
		id,
		conversationId: input.conversationId,
		priority: input.priority,
		reason: input.reason,
		message: input.message,
		notificationTitle: input.notificationTitle,
		sentAt: (/* @__PURE__ */ new Date()).toISOString(),
		openedAt: null,
		ignored: false
	};
}
async function markProactiveOpened(db, userId, id) {
	await db`
    update proactive_events set opened_at = now(), ignored = false
    where id = ${id} and user_id = ${userId}
  `;
}
async function countProactiveSince(db, userId, sinceIso) {
	const rows = await db`
    select count(*)::int as n from proactive_events
    where user_id = ${userId} and sent_at >= ${sinceIso}
  `;
	return asNumber(rows[0]?.n, 0);
}
async function insertToolCall(db, input) {
	await db`
    insert into tool_calls (id, user_id, conversation_id, tool_name, arguments, result, status)
    values (
      ${nid()},
      ${input.userId},
      ${input.conversationId ?? null},
      ${input.toolName},
      ${JSON.stringify(input.args ?? {})},
      ${JSON.stringify(input.result ?? {})},
      ${input.status}
    )
  `;
}
async function recentUserLines(db, userId, limit = 12) {
	return (await db`
    select content, created_at from messages
    where user_id = ${userId} and role = 'user' and content <> ''
    order by created_at desc
    limit ${limit}
  `).map((r) => ({
		content: String(r.content),
		createdAt: asIsoRequired(r.created_at)
	}));
}
async function lastMessageTimes(db, userId) {
	const user = await db`
    select created_at from messages
    where user_id = ${userId} and role = 'user'
    order by created_at desc limit 1
  `;
	const assistant = await db`
    select created_at from messages
    where user_id = ${userId} and role = 'assistant'
    order by created_at desc limit 1
  `;
	return {
		lastUserAt: user[0] ? asIso(user[0].created_at) : null,
		lastAssistantAt: assistant[0] ? asIso(assistant[0].created_at) : null
	};
}
var XAI_URL = "https://api.x.ai/v1/chat/completions";
var XaiAIService = class {
	async chat(req) {
		const apiKey = process.env.XAI_API_KEY;
		if (!apiKey) throw new Error("AI is not available in this environment");
		const body = {
			model: req.model || "grok-4.5",
			messages: req.messages,
			temperature: req.temperature ?? .8,
			max_tokens: req.maxTokens ?? 900
		};
		if (req.tools?.length) {
			body.tools = req.tools;
			body.tool_choice = "auto";
		}
		if (req.responseFormat === "json_object") body.response_format = { type: "json_object" };
		const res = await fetch(XAI_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(`xAI API error ${res.status}${text ? `: ${text.slice(0, 240)}` : ""}`);
		}
		const choice = (await res.json()).choices?.[0];
		const message = choice?.message;
		return {
			content: message?.content ?? null,
			toolCalls: Array.isArray(message?.tool_calls) ? message.tool_calls : [],
			finishReason: choice?.finish_reason ?? "stop"
		};
	}
};
function getAIService() {
	return new XaiAIService();
}
var CATEGORY_ENUM = MEMORY_CATEGORIES;
var AURELIA_TOOLS = [
	{
		type: "function",
		function: {
			name: "get_current_time",
			description: "Get the user's current local date and time.",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "retrieve_memory",
			description: "Search organized long-term memory. Optional category or query filters.",
			parameters: {
				type: "object",
				properties: {
					category: {
						type: "string",
						enum: CATEGORY_ENUM
					},
					query: {
						type: "string",
						description: "Optional substring to match against key or value"
					}
				},
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "save_memory",
			description: "Store or update a durable fact about the user. Use short keys (e.g. philosophy, sleep_goal).",
			parameters: {
				type: "object",
				properties: {
					category: {
						type: "string",
						enum: CATEGORY_ENUM
					},
					key: { type: "string" },
					value: { type: "string" }
				},
				required: [
					"category",
					"key",
					"value"
				],
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "get_goals",
			description: "List the user's goals and their status/cadence/last progress.",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "upsert_goal",
			description: "Create or update a goal. Pass id to update an existing one.",
			parameters: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					description: { type: "string" },
					status: {
						type: "string",
						enum: [
							"active",
							"paused",
							"done"
						]
					},
					cadence: {
						type: "string",
						enum: [
							"none",
							"daily",
							"weekly"
						]
					}
				},
				required: ["title"],
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "note_goal_progress",
			description: "Mark that the user made progress on a goal today.",
			parameters: {
				type: "object",
				properties: { id: { type: "string" } },
				required: ["id"],
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "get_reminders",
			description: "List reminders. Defaults to open (incomplete) ones.",
			parameters: {
				type: "object",
				properties: { includeCompleted: { type: "boolean" } },
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "create_reminder",
			description: "Create a reminder. due_at should be an ISO-8601 timestamp if known.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					notes: { type: "string" },
					due_at: { type: "string" }
				},
				required: ["title"],
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "complete_reminder",
			description: "Mark a reminder complete or incomplete.",
			parameters: {
				type: "object",
				properties: {
					id: { type: "string" },
					completed: { type: "boolean" }
				},
				required: ["id"],
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "retrieve_recent_conversations",
			description: "Get titles and last lines of recent conversations for cross-thread context.",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "search_web",
			description: "Look up a topic (encyclopedia-style). Use for books, ideas, science the user asked about.",
			parameters: {
				type: "object",
				properties: { query: { type: "string" } },
				required: ["query"],
				additionalProperties: false
			}
		}
	},
	{
		type: "function",
		function: {
			name: "get_weather",
			description: "Current weather for a city or place name.",
			parameters: {
				type: "object",
				properties: { place: { type: "string" } },
				required: ["place"],
				additionalProperties: false
			}
		}
	}
];
async function executeTool(name, rawArgs, ctx) {
	let args = {};
	try {
		args = rawArgs ? JSON.parse(rawArgs) : {};
	} catch {
		return JSON.stringify({ error: "Invalid tool arguments" });
	}
	try {
		const result = await runTool(name, args, ctx);
		await insertToolCall(ctx.db, {
			userId: ctx.userId,
			conversationId: ctx.conversationId,
			toolName: name,
			args,
			result,
			status: "ok"
		});
		return JSON.stringify(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Tool failed";
		await insertToolCall(ctx.db, {
			userId: ctx.userId,
			conversationId: ctx.conversationId,
			toolName: name,
			args,
			result: { error: message },
			status: "error"
		});
		return JSON.stringify({ error: message });
	}
}
async function runTool(name, args, ctx) {
	switch (name) {
		case "get_current_time": return {
			now: formatNow(ctx.timezone),
			timezone: ctx.timezone
		};
		case "retrieve_memory": {
			if (!ctx.memoryEnabled) return {
				disabled: true,
				memories: []
			};
			const all = await listMemories$1(ctx.db, ctx.userId);
			const category = typeof args.category === "string" ? args.category : null;
			const query = typeof args.query === "string" ? args.query.toLowerCase() : null;
			return { memories: all.filter((m) => {
				if (category && m.category !== category) return false;
				if (!query) return true;
				return m.key.toLowerCase().includes(query) || m.value.toLowerCase().includes(query);
			}).slice(0, 24) };
		}
		case "save_memory": {
			if (!ctx.memoryEnabled) return {
				disabled: true,
				error: "Memory is turned off in settings."
			};
			const category = String(args.category ?? "other");
			const key = String(args.key ?? "").trim();
			const value = String(args.value ?? "").trim();
			if (!key || !value) return { error: "key and value are required" };
			return { saved: await upsertMemory(ctx.db, ctx.userId, {
				category: MEMORY_CATEGORIES.includes(category) ? category : "other",
				key,
				value,
				sourceConversationId: ctx.conversationId
			}) };
		}
		case "get_goals": return { goals: await listGoals$1(ctx.db, ctx.userId) };
		case "upsert_goal": {
			const title = String(args.title ?? "").trim();
			if (!title) return { error: "title is required" };
			return { goal: await upsertGoal(ctx.db, ctx.userId, {
				id: typeof args.id === "string" ? args.id : void 0,
				title,
				description: typeof args.description === "string" ? args.description : "",
				status: args.status === "paused" || args.status === "done" || args.status === "active" ? args.status : "active",
				cadence: args.cadence === "daily" || args.cadence === "weekly" || args.cadence === "none" ? args.cadence : "none"
			}) };
		}
		case "note_goal_progress": {
			const id = String(args.id ?? "");
			if (!id) return { error: "id is required" };
			await noteGoalProgress(ctx.db, ctx.userId, id);
			return { ok: true };
		}
		case "get_reminders": {
			const all = await listReminders$1(ctx.db, ctx.userId);
			return { reminders: args.includeCompleted === true ? all : all.filter((r) => !r.completed) };
		}
		case "create_reminder": {
			const title = String(args.title ?? "").trim();
			if (!title) return { error: "title is required" };
			return { reminder: await createReminder(ctx.db, ctx.userId, {
				title,
				notes: typeof args.notes === "string" ? args.notes : "",
				dueAt: typeof args.due_at === "string" && args.due_at ? args.due_at : null
			}) };
		}
		case "complete_reminder": {
			const id = String(args.id ?? "");
			if (!id) return { error: "id is required" };
			await setReminderCompleted(ctx.db, ctx.userId, id, args.completed !== false);
			return { ok: true };
		}
		case "retrieve_recent_conversations": return { conversations: (await listConversations$1(ctx.db, ctx.userId)).slice(0, 8).map((c) => ({
			id: c.id,
			title: c.title,
			lastMessage: c.lastMessage ? truncate(c.lastMessage, 160) : null,
			updatedAt: c.updatedAt
		})) };
		case "search_web": {
			const query = String(args.query ?? "").trim();
			if (!query) return { error: "query is required" };
			return await searchReference(query);
		}
		case "get_weather": {
			const place = String(args.place ?? "").trim();
			if (!place) return { error: "place is required" };
			return await getWeather(place);
		}
		default: return { error: `Unknown tool: ${name}` };
	}
}
async function searchReference(query) {
	const url = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(query)}&limit=5`;
	const res = await fetch(url, { headers: { "User-Agent": "AureliaCompanion/1.0" } });
	if (!res.ok) return { error: `Search failed (${res.status})` };
	const pages = (await res.json()).pages ?? [];
	const results = [];
	for (const page of pages.slice(0, 3)) {
		const title = page.title;
		let summary = page.description || page.excerpt || "";
		try {
			const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.key || title)}`, { headers: { "User-Agent": "AureliaCompanion/1.0" } });
			if (sumRes.ok) {
				const sum = await sumRes.json();
				summary = sum.extract || summary;
				results.push({
					title,
					summary: summary.slice(0, 600),
					url: sum.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
				});
				continue;
			}
		} catch {}
		results.push({
			title,
			summary: String(summary).slice(0, 400),
			url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
		});
	}
	return { results };
}
async function getWeather(place) {
	const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`);
	if (!geoRes.ok) return { error: "Could not look up that place" };
	const hit = (await geoRes.json()).results?.[0];
	if (!hit) return { error: "Place not found" };
	const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current_weather=true`);
	if (!wxRes.ok) return { error: "Weather lookup failed" };
	const cur = (await wxRes.json()).current_weather;
	if (!cur) return { error: "No current weather" };
	return {
		place: `${hit.name}${hit.country ? `, ${hit.country}` : ""}`,
		temperatureC: cur.temperature,
		windspeedKmh: cur.windspeed,
		condition: weatherCodeLabel(cur.weathercode)
	};
}
function weatherCodeLabel(code) {
	if (code === 0) return "clear";
	if (code <= 3) return "partly cloudy";
	if (code <= 48) return "fog";
	if (code <= 67) return "rain";
	if (code <= 77) return "snow";
	if (code <= 82) return "showers";
	if (code <= 99) return "storm";
	return "unknown";
}
var MAX_TOOL_ROUNDS = 5;
async function runAssistantTurn(input) {
	const [messages, memories, goals, reminders] = await Promise.all([
		listMessages(input.db, input.userId, input.conversationId),
		input.settings.memoryEnabled ? listMemories$1(input.db, input.userId) : Promise.resolve([]),
		listGoals$1(input.db, input.userId),
		listReminders$1(input.db, input.userId)
	]);
	const system = buildSystemPrompt({
		settings: input.settings,
		memories,
		goals,
		reminders
	});
	const sliced = messages.filter((m) => (m.role === "user" || m.role === "assistant" || m.role === "tool") && (m.content || m.toolName)).slice(-28);
	const turns = [{
		role: "system",
		content: system
	}, ...sliced.map((m) => {
		if (m.role === "tool") return {
			role: "tool",
			content: m.content,
			tool_call_id: m.toolName ? m.id : void 0
		};
		return {
			role: m.role === "assistant" ? "assistant" : "user",
			content: m.content
		};
	})];
	const ai = getAIService();
	const ctx = {
		db: input.db,
		userId: input.userId,
		conversationId: input.conversationId,
		timezone: input.settings.timezone,
		memoryEnabled: input.settings.memoryEnabled
	};
	let finalText = "";
	for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
		const response = await ai.chat({
			model: input.settings.model || "grok-4.5",
			messages: turns,
			tools: AURELIA_TOOLS,
			temperature: .85,
			maxTokens: 900
		});
		if (response.toolCalls.length > 0) {
			turns.push({
				role: "assistant",
				content: response.content,
				tool_calls: response.toolCalls
			});
			for (const call of response.toolCalls) {
				const result = await executeTool(call.function.name, call.function.arguments, ctx);
				turns.push({
					role: "tool",
					content: result,
					tool_call_id: call.id
				});
			}
			continue;
		}
		finalText = (response.content ?? "").trim();
		break;
	}
	if (!finalText) finalText = "I started to answer and then thought better of a hollow reply. Say that again, a little more plainly.";
	const saved = await insertMessage(input.db, {
		userId: input.userId,
		conversationId: input.conversationId,
		role: "assistant",
		content: finalText
	});
	const convo = await getConversation(input.db, input.userId, input.conversationId);
	if (convo && (convo.title === "Conversation" || convo.title === "New thread")) {
		const firstUser = messages.find((m) => m.role === "user" && m.content.trim());
		if (firstUser) await renameConversation(input.db, input.userId, input.conversationId, truncate(firstUser.content, 42));
	}
	return saved;
}
var FREQ = {
	quiet: {
		max: 1,
		cooldownMs: 288e5
	},
	thoughtful: {
		max: 3,
		cooldownMs: 108e5
	},
	present: {
		max: 5,
		cooldownMs: 54e5
	}
};
function overlapScore(a, b) {
	const tokens = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
	const A = tokens(a);
	const B = tokens(b);
	if (A.size === 0 || B.size === 0) return 0;
	let hit = 0;
	for (const w of A) if (B.has(w)) hit += 1;
	return hit / Math.min(A.size, B.size);
}
function parseDecision(raw) {
	try {
		const start = raw.indexOf("{");
		const end = raw.lastIndexOf("}");
		if (start < 0 || end <= start) return null;
		const obj = JSON.parse(raw.slice(start, end + 1));
		const priority = obj.priority === "high" || obj.priority === "low" || obj.priority === "medium" ? obj.priority : "medium";
		return {
			should_contact: Boolean(obj.should_contact),
			priority,
			reason: String(obj.reason ?? "").slice(0, 400),
			message: String(obj.message ?? "").trim().slice(0, 280),
			notification_title: String(obj.notification_title ?? "Aurelia").slice(0, 40) || "Aurelia"
		};
	} catch {
		return null;
	}
}
async function evaluateProactive(input) {
	const settings = await ensureSettings(input.db, input.userId);
	const now = Date.now();
	if (!settings.proactiveEnabled && !input.force) return {
		contacted: false,
		silentReason: "proactive_disabled"
	};
	const quiet = isInQuietHours(now, settings.timezone, settings.quietHoursStart, settings.quietHoursEnd);
	const freq = FREQ[settings.proactiveFrequency] ?? FREQ.thoughtful;
	const dayStart = startOfLocalDay(now, settings.timezone);
	const todayCount = await countProactiveSince(input.db, input.userId, dayStart.toISOString());
	const cap = Math.min(settings.maxProactivePerDay, freq.max);
	if (!input.force && todayCount >= cap) return {
		contacted: false,
		silentReason: "daily_cap"
	};
	if (!input.force && settings.lastProactiveAt) {
		const elapsed = now - Date.parse(settings.lastProactiveAt);
		if (Number.isFinite(elapsed) && elapsed < freq.cooldownMs) return {
			contacted: false,
			silentReason: "cooldown"
		};
	}
	const recentEvents = await listProactiveEvents(input.db, input.userId, 8);
	let ignoredStreak = 0;
	for (const ev of recentEvents) if (ev.ignored && !ev.openedAt) ignoredStreak += 1;
	else break;
	const [memories, goals, reminders, userLines, times] = await Promise.all([
		settings.memoryEnabled ? listMemories$1(input.db, input.userId) : Promise.resolve([]),
		listGoals$1(input.db, input.userId),
		listReminders$1(input.db, input.userId),
		recentUserLines(input.db, input.userId, 10),
		lastMessageTimes(input.db, input.userId)
	]);
	const hoursSince = (iso) => {
		if (!iso) return null;
		const t = Date.parse(iso);
		if (!Number.isFinite(t)) return null;
		return Math.round((now - t) / 36e5 * 10) / 10;
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
			sentAt: e.sentAt
		})),
		lastUserAt: times.lastUserAt,
		lastAssistantAt: times.lastAssistantAt,
		sessionMinutes: input.sessionMinutes ?? 0,
		hoursSinceLastContact: hoursSince(settings.lastProactiveAt),
		hoursSinceLastUser: hoursSince(times.lastUserAt),
		ignoredStreak
	});
	let decision = null;
	try {
		decision = parseDecision((await getAIService().chat({
			model: settings.model || "grok-4.5",
			messages: [{
				role: "system",
				content: "You decide whether a personal companion should interrupt the user. Be conservative. Output JSON only."
			}, {
				role: "user",
				content: prompt
			}],
			temperature: .4,
			maxTokens: 280,
			responseFormat: "json_object"
		})).content ?? "");
	} catch (err) {
		return {
			contacted: false,
			silentReason: err instanceof Error ? err.message : "ai_error"
		};
	}
	if (!decision || !decision.should_contact || !decision.message) return {
		contacted: false,
		silentReason: decision?.reason || "no_reason"
	};
	if (quiet && !(settings.allowImportantDuringQuiet && decision.priority === "high")) return {
		contacted: false,
		silentReason: "quiet_hours"
	};
	if (ignoredStreak >= 3 && decision.priority !== "high" && !input.force) return {
		contacted: false,
		silentReason: "ignored_streak"
	};
	if (recentEvents.some((ev) => overlapScore(ev.message, decision.message) > .62) && !input.force) return {
		contacted: false,
		silentReason: "repetitive"
	};
	const conversation = await createConversation(input.db, input.userId, decision.notification_title || "Aurelia");
	await insertMessage(input.db, {
		userId: input.userId,
		conversationId: conversation.id,
		role: "assistant",
		content: decision.message
	});
	await markConversationUnread(input.db, input.userId, conversation.id);
	return {
		contacted: true,
		event: await insertProactiveEvent(input.db, input.userId, {
			conversationId: conversation.id,
			priority: decision.priority,
			reason: decision.reason,
			message: decision.message,
			notificationTitle: decision.notification_title
		}),
		conversationId: conversation.id
	};
}
var getSettings_createServerFn_handler = createServerRpc({
	id: "3c42619e7f61b24127e39d331b8cd15d4a59380d0c57c9cce863d058bff9abef",
	name: "getSettings",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => getSettings.__executeServer(opts));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSettings_createServerFn_handler, async ({ context }) => {
	return ensureSettings(await sql(), context.userId);
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "9b8018cd75a01b1b58b3e4ee70e62dfa43babbd47fe306e5f29ab788bd176e08",
	name: "saveSettings",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((patch) => patch).handler(saveSettings_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const safe = { ...data };
	if (typeof safe.personalityIntensity === "number") safe.personalityIntensity = Math.max(0, Math.min(100, Math.round(safe.personalityIntensity)));
	if (typeof safe.maxProactivePerDay === "number") safe.maxProactivePerDay = Math.max(0, Math.min(8, Math.round(safe.maxProactivePerDay)));
	return updateSettings(db, context.userId, safe);
});
var pingActivity_createServerFn_handler = createServerRpc({
	id: "689d27954c269ef84427d335399da3d0695f1254539db8318bfa7625e462348f",
	name: "pingActivity",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => pingActivity.__executeServer(opts));
var pingActivity = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(pingActivity_createServerFn_handler, async ({ context, data }) => {
	await touchActive(await sql(), context.userId, data.timezone);
	return { ok: true };
});
var listConversations_createServerFn_handler = createServerRpc({
	id: "fbbf6d1b06252e436a7c426dce6d51d6de63d7befe51dd426722ddc560bbb94d",
	name: "listConversations",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => listConversations.__executeServer(opts));
var listConversations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listConversations_createServerFn_handler, async ({ context }) => {
	return listConversations$1(await sql(), context.userId);
});
var getMessages_createServerFn_handler = createServerRpc({
	id: "9066a366fe799aa9736d6fb8aff088fd09bc77a426254b750b8c1e3820a17c8d",
	name: "getMessages",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => getMessages.__executeServer(opts));
var getMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(getMessages_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	if (!await getConversation(db, context.userId, data.conversationId)) return [];
	await markConversationRead(db, context.userId, data.conversationId);
	return (await listMessages(db, context.userId, data.conversationId)).filter((m) => m.role === "user" || m.role === "assistant");
});
var startConversation_createServerFn_handler = createServerRpc({
	id: "b18c93fb2ad95d8a05e91eee82887840dbc42b7b604ed55e1249885062933683",
	name: "startConversation",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => startConversation.__executeServer(opts));
var startConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input = {}) => input).handler(startConversation_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const existing = await listConversations$1(db, context.userId);
	const conversation = await createConversation(db, context.userId, existing.length === 0 ? "Beginning" : "New thread");
	const messages = [];
	if (data.withWelcome !== false && existing.length === 0) {
		const welcome = await insertMessage(db, {
			userId: context.userId,
			conversationId: conversation.id,
			role: "assistant",
			content: FIRST_WELCOME
		});
		messages.push(welcome);
	}
	return {
		conversation,
		messages
	};
});
var sendMessage_createServerFn_handler = createServerRpc({
	id: "d48ec2cbf40447f47d4af53e2f10c32f263978fd097a0bed8eac5fa911f40c5c",
	name: "sendMessage",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => sendMessage.__executeServer(opts));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(sendMessage_createServerFn_handler, async ({ context, data }) => {
	const content = data.content.trim().slice(0, 8e3);
	if (!content) throw new Error("Message is empty");
	const db = await sql();
	await touchActive(db, context.userId);
	let conversationId = data.conversationId;
	if (!conversationId) conversationId = (await createConversation(db, context.userId)).id;
	else if (!await getConversation(db, context.userId, conversationId)) conversationId = (await createConversation(db, context.userId)).id;
	const userMessage = await insertMessage(db, {
		userId: context.userId,
		conversationId,
		role: "user",
		content
	});
	await markConversationRead(db, context.userId, conversationId);
	const settings = await ensureSettings(db, context.userId);
	try {
		const assistantMessage = await runAssistantTurn({
			db,
			userId: context.userId,
			conversationId,
			settings
		});
		return {
			conversationId,
			userMessage,
			assistantMessage
		};
	} catch (err) {
		const message = err instanceof Error && err.message.includes("AI is not available") ? "Aurelia is quiet — the thinking layer is not available in this environment yet." : err instanceof Error ? err.message : "Something went wrong.";
		const assistantMessage = await insertMessage(db, {
			userId: context.userId,
			conversationId,
			role: "assistant",
			content: message.includes("not available") ? message : `I hit a wall thinking that through. ${message}`
		});
		return {
			conversationId,
			userMessage,
			assistantMessage,
			error: message
		};
	}
});
var regenerateResponse_createServerFn_handler = createServerRpc({
	id: "478760265483ffd1fdcdc55a2288c244024221c0e1ea2761eec2be8f7c7fad76",
	name: "regenerateResponse",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => regenerateResponse.__executeServer(opts));
var regenerateResponse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(regenerateResponse_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const lastUser = [...await listMessages(db, context.userId, data.conversationId)].reverse().find((m) => m.role === "user");
	if (!lastUser) throw new Error("Nothing to regenerate");
	await deleteMessagesAfter(db, context.userId, data.conversationId, lastUser.createdAt);
	const settings = await ensureSettings(db, context.userId);
	const assistantMessage = await runAssistantTurn({
		db,
		userId: context.userId,
		conversationId: data.conversationId,
		settings
	});
	return {
		conversationId: data.conversationId,
		userMessage: lastUser,
		assistantMessage
	};
});
var removeConversation_createServerFn_handler = createServerRpc({
	id: "31e2f18bc4a48f39a15fd396a04ea4ae0c621ab70b3efd64acbc8fa45172e566",
	name: "removeConversation",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => removeConversation.__executeServer(opts));
var removeConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(removeConversation_createServerFn_handler, async ({ context, data }) => {
	await deleteConversation(await sql(), context.userId, data.conversationId);
	return { ok: true };
});
var clearConversation_createServerFn_handler = createServerRpc({
	id: "5fc43eb797cca8b0b63ebad3688968aff487130ddca751b0f67ad66f56d6a6f6",
	name: "clearConversation",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => clearConversation.__executeServer(opts));
var clearConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(clearConversation_createServerFn_handler, async ({ context, data }) => {
	await clearConversation$1(await sql(), context.userId, data.conversationId);
	return { ok: true };
});
var wipeConversations_createServerFn_handler = createServerRpc({
	id: "86e20693e45d95d28d2db7df5b4f5a0b2ba699eb748431f5fcb701956a4eace9",
	name: "wipeConversations",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => wipeConversations.__executeServer(opts));
var wipeConversations = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(wipeConversations_createServerFn_handler, async ({ context }) => {
	await deleteAllConversations(await sql(), context.userId);
	return { ok: true };
});
var listMemories_createServerFn_handler = createServerRpc({
	id: "67be160eecac7cd75e9cb0cd140526a8527e84c85007cd5964cc03edbc22bde2",
	name: "listMemories",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => listMemories.__executeServer(opts));
var listMemories = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMemories_createServerFn_handler, async ({ context }) => {
	return listMemories$1(await sql(), context.userId);
});
var saveMemory_createServerFn_handler = createServerRpc({
	id: "2281a176eae8daacf1f98371944f7df9948dcde459c14aa887a7d71fc15ef533",
	name: "saveMemory",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => saveMemory.__executeServer(opts));
var saveMemory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveMemory_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const category = MEMORY_CATEGORIES.includes(data.category) ? data.category : "other";
	if (data.id) {
		await updateMemoryRow(db, context.userId, data.id, {
			category,
			key: data.key,
			value: data.value
		});
		const found = (await listMemories$1(db, context.userId)).find((m) => m.id === data.id);
		if (found) return found;
	}
	return upsertMemory(db, context.userId, {
		category,
		key: data.key,
		value: data.value
	});
});
var removeMemory_createServerFn_handler = createServerRpc({
	id: "a3f3fd54e60a10b171b9625c0cfc3cc8597b3b2790d64bacc4fc9135e7187021",
	name: "removeMemory",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => removeMemory.__executeServer(opts));
var removeMemory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(removeMemory_createServerFn_handler, async ({ context, data }) => {
	await deleteMemory(await sql(), context.userId, data.id);
	return { ok: true };
});
var wipeMemories_createServerFn_handler = createServerRpc({
	id: "02bce1f0dc552be1e3d1e137d2fabd71c30596e03cec19de9ae1edd93c188da2",
	name: "wipeMemories",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => wipeMemories.__executeServer(opts));
var wipeMemories = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(wipeMemories_createServerFn_handler, async ({ context }) => {
	await deleteAllMemories(await sql(), context.userId);
	return { ok: true };
});
var listGoals_createServerFn_handler = createServerRpc({
	id: "7b636e07928324f71382dacbda600e927e46276fcf07a2d6fb4ad9c487090321",
	name: "listGoals",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => listGoals.__executeServer(opts));
var listGoals = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listGoals_createServerFn_handler, async ({ context }) => {
	return listGoals$1(await sql(), context.userId);
});
var saveGoal_createServerFn_handler = createServerRpc({
	id: "30ec1dee937277db4c7fa02d5ad863892a44f0d28bab99c0382913855d4d2b5c",
	name: "saveGoal",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => saveGoal.__executeServer(opts));
var saveGoal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveGoal_createServerFn_handler, async ({ context, data }) => {
	return upsertGoal(await sql(), context.userId, data);
});
var markGoalProgress_createServerFn_handler = createServerRpc({
	id: "2e5964a18abd521ad56f72bbbfd262bfaeac7c53810e7b896bc1f97bc952514e",
	name: "markGoalProgress",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => markGoalProgress.__executeServer(opts));
var markGoalProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(markGoalProgress_createServerFn_handler, async ({ context, data }) => {
	await noteGoalProgress(await sql(), context.userId, data.id);
	return { ok: true };
});
var removeGoal_createServerFn_handler = createServerRpc({
	id: "7c3da342ca22003569e97092de7313c6a8e25cce303639c7011b67e25550bc54",
	name: "removeGoal",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => removeGoal.__executeServer(opts));
var removeGoal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(removeGoal_createServerFn_handler, async ({ context, data }) => {
	await deleteGoal(await sql(), context.userId, data.id);
	return { ok: true };
});
var listReminders_createServerFn_handler = createServerRpc({
	id: "cea90bb622ebc5434ff4af5e1151bd9f1c6ef4057d5a1b0615d5d145d3d06b5e",
	name: "listReminders",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => listReminders.__executeServer(opts));
var listReminders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listReminders_createServerFn_handler, async ({ context }) => {
	return listReminders$1(await sql(), context.userId);
});
var saveReminder_createServerFn_handler = createServerRpc({
	id: "7e3cbf2c2b384bffe707cfcb7200ff8f320f86bb9583a004c2589aec1f72ce7c",
	name: "saveReminder",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => saveReminder.__executeServer(opts));
var saveReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveReminder_createServerFn_handler, async ({ context, data }) => {
	return createReminder(await sql(), context.userId, data);
});
var toggleReminder_createServerFn_handler = createServerRpc({
	id: "e53c4aa819de0623a3febdcf560da84eede567c6873fe2780f280ea289a8a69b",
	name: "toggleReminder",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => toggleReminder.__executeServer(opts));
var toggleReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(toggleReminder_createServerFn_handler, async ({ context, data }) => {
	await setReminderCompleted(await sql(), context.userId, data.id, data.completed);
	return { ok: true };
});
var removeReminder_createServerFn_handler = createServerRpc({
	id: "20f5f4d195cdbae75d31888347c3622e7107260f7cd9200079ee19b0542baf6a",
	name: "removeReminder",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => removeReminder.__executeServer(opts));
var removeReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(removeReminder_createServerFn_handler, async ({ context, data }) => {
	await deleteReminder(await sql(), context.userId, data.id);
	return { ok: true };
});
var runProactiveCheck_createServerFn_handler = createServerRpc({
	id: "a6131e57ff3f1922a81d4cbb48adbb6db8827ee6a247a224579122b1ba33b3dc",
	name: "runProactiveCheck",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => runProactiveCheck.__executeServer(opts));
var runProactiveCheck = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input = {}) => input).handler(runProactiveCheck_createServerFn_handler, async ({ context, data }) => {
	return evaluateProactive({
		db: await sql(),
		userId: context.userId,
		sessionMinutes: data.sessionMinutes,
		force: data.force
	});
});
var acknowledgeProactive_createServerFn_handler = createServerRpc({
	id: "0e8285d74f6dad58d997b4627c5cc2d5820e13bd57aee026b8c080ec67eba390",
	name: "acknowledgeProactive",
	filename: "src/lib/aurelia/api.ts"
}, (opts) => acknowledgeProactive.__executeServer(opts));
var acknowledgeProactive = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(acknowledgeProactive_createServerFn_handler, async ({ context, data }) => {
	await markProactiveOpened(await sql(), context.userId, data.id);
	return { ok: true };
});
//#endregion
export { acknowledgeProactive_createServerFn_handler, clearConversation_createServerFn_handler, getMessages_createServerFn_handler, getSettings_createServerFn_handler, listConversations_createServerFn_handler, listGoals_createServerFn_handler, listMemories_createServerFn_handler, listReminders_createServerFn_handler, markGoalProgress_createServerFn_handler, pingActivity_createServerFn_handler, regenerateResponse_createServerFn_handler, removeConversation_createServerFn_handler, removeGoal_createServerFn_handler, removeMemory_createServerFn_handler, removeReminder_createServerFn_handler, runProactiveCheck_createServerFn_handler, saveGoal_createServerFn_handler, saveMemory_createServerFn_handler, saveReminder_createServerFn_handler, saveSettings_createServerFn_handler, sendMessage_createServerFn_handler, startConversation_createServerFn_handler, toggleReminder_createServerFn_handler, wipeConversations_createServerFn_handler, wipeMemories_createServerFn_handler };
