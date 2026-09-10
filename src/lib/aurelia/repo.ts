import { getSql, type Sql } from "@/lib/db";
import { asBool, asIso, asIsoRequired, asNumber, nid } from "@/lib/utils";
import type {
  ChatMessage,
  Conversation,
  Goal,
  GoalCadence,
  GoalStatus,
  Memory,
  MemoryCategory,
  MessageRole,
  ProactiveEvent,
  ProactiveFrequency,
  Reminder,
  ThemeName,
  UserSettings,
} from "./types";

export async function sql(): Promise<Sql> {
  return getSql();
}

export async function ensureSettings(db: Sql, userId: string): Promise<UserSettings> {
  await db`insert into user_settings (user_id) values (${userId}) on conflict (user_id) do nothing`;
  const rows = await db<Record<string, unknown>>`
    select * from user_settings where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("Failed to load settings");
  return mapSettings(row);
}

function mapSettings(row: Record<string, unknown>): UserSettings {
  const freq = String(row.proactive_frequency ?? "thoughtful");
  const theme = String(row.theme ?? "void");
  return {
    userId: String(row.user_id),
    notificationsEnabled: asBool(row.notifications_enabled),
    proactiveEnabled: asBool(row.proactive_enabled),
    proactiveFrequency: (["quiet", "thoughtful", "present"].includes(freq)
      ? freq
      : "thoughtful") as ProactiveFrequency,
    maxProactivePerDay: asNumber(row.max_proactive_per_day, 3),
    quietHoursStart: String(row.quiet_hours_start ?? "23:00"),
    quietHoursEnd: String(row.quiet_hours_end ?? "08:00"),
    allowImportantDuringQuiet: asBool(row.allow_important_during_quiet),
    memoryEnabled: asBool(row.memory_enabled),
    personalityIntensity: asNumber(row.personality_intensity, 70),
    notificationSound: asBool(row.notification_sound),
    theme: (theme === "dawn" ? "dawn" : "void") as ThemeName,
    model: String(row.model ?? "grok-4.5"),
    timezone: String(row.timezone ?? "UTC"),
    lastActiveAt: asIso(row.last_active_at),
    lastProactiveAt: asIso(row.last_proactive_at),
  };
}

export async function updateSettings(
  db: Sql,
  userId: string,
  patch: Partial<UserSettings>,
): Promise<UserSettings> {
  await ensureSettings(db, userId);
  const current = await ensureSettings(db, userId);
  const next: UserSettings = { ...current, ...patch, userId };
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

export async function touchActive(db: Sql, userId: string, timezone?: string): Promise<void> {
  await ensureSettings(db, userId);
  if (timezone) {
    await db`
      update user_settings
      set last_active_at = now(), timezone = ${timezone}, updated_at = now()
      where user_id = ${userId}
    `;
  } else {
    await db`
      update user_settings
      set last_active_at = now(), updated_at = now()
      where user_id = ${userId}
    `;
  }
}

export async function listConversations(db: Sql, userId: string): Promise<Conversation[]> {
  const rows = await db<Record<string, unknown>>`
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
  `;
  return rows.map(mapConversation);
}

function mapConversation(row: Record<string, unknown>): Conversation {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title ?? "Conversation"),
    createdAt: asIsoRequired(row.created_at),
    updatedAt: asIsoRequired(row.updated_at),
    archived: asBool(row.archived),
    unread: asBool(row.unread),
    lastMessage: row.last_message == null ? null : String(row.last_message),
  };
}

export async function getConversation(
  db: Sql,
  userId: string,
  id: string,
): Promise<Conversation | null> {
  const rows = await db<Record<string, unknown>>`
    select c.*, null as last_message
    from conversations c
    where c.id = ${id} and c.user_id = ${userId}
    limit 1
  `;
  return rows[0] ? mapConversation(rows[0]) : null;
}

export async function createConversation(
  db: Sql,
  userId: string,
  title = "Conversation",
): Promise<Conversation> {
  const id = nid();
  await db`
    insert into conversations (id, user_id, title)
    values (${id}, ${userId}, ${title})
  `;
  const created = await getConversation(db, userId, id);
  if (!created) throw new Error("Failed to create conversation");
  return created;
}

export async function renameConversation(
  db: Sql,
  userId: string,
  id: string,
  title: string,
): Promise<void> {
  await db`
    update conversations set title = ${title}, updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}

export async function markConversationRead(db: Sql, userId: string, id: string): Promise<void> {
  await db`
    update conversations set unread = false where id = ${id} and user_id = ${userId}
  `;
}

export async function markConversationUnread(db: Sql, userId: string, id: string): Promise<void> {
  await db`
    update conversations set unread = true, updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}

export async function touchConversation(db: Sql, userId: string, id: string): Promise<void> {
  await db`
    update conversations set updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}

export async function deleteConversation(db: Sql, userId: string, id: string): Promise<void> {
  await db`delete from conversations where id = ${id} and user_id = ${userId}`;
}

export async function deleteAllConversations(db: Sql, userId: string): Promise<void> {
  await db`delete from conversations where user_id = ${userId}`;
}

export async function clearConversation(db: Sql, userId: string, id: string): Promise<void> {
  await db`delete from messages where conversation_id = ${id} and user_id = ${userId}`;
  await db`
    update conversations set updated_at = now(), unread = false
    where id = ${id} and user_id = ${userId}
  `;
}

export async function listMessages(
  db: Sql,
  userId: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  const rows = await db<Record<string, unknown>>`
    select id, conversation_id, role, content, created_at, tool_name
    from messages
    where user_id = ${userId} and conversation_id = ${conversationId}
    order by created_at asc
  `;
  return rows.map(mapMessage);
}

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    role: String(row.role) as MessageRole,
    content: String(row.content ?? ""),
    createdAt: asIsoRequired(row.created_at),
    toolName: row.tool_name == null ? null : String(row.tool_name),
  };
}

export async function insertMessage(
  db: Sql,
  input: {
    userId: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    toolName?: string | null;
    toolCallId?: string | null;
    metadata?: string | null;
  },
): Promise<ChatMessage> {
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
    createdAt: new Date().toISOString(),
    toolName: input.toolName ?? null,
  };
}

export async function deleteMessagesAfter(
  db: Sql,
  userId: string,
  conversationId: string,
  afterIso: string,
): Promise<void> {
  await db`
    delete from messages
    where user_id = ${userId}
      and conversation_id = ${conversationId}
      and created_at > ${afterIso}
  `;
}

export async function listMemories(db: Sql, userId: string): Promise<Memory[]> {
  const rows = await db<Record<string, unknown>>`
    select id, category, key, value, created_at, updated_at
    from memories
    where user_id = ${userId}
    order by category, updated_at desc
  `;
  return rows.map(mapMemory);
}

function mapMemory(row: Record<string, unknown>): Memory {
  return {
    id: String(row.id),
    category: String(row.category) as MemoryCategory,
    key: String(row.key),
    value: String(row.value),
    createdAt: asIsoRequired(row.created_at),
    updatedAt: asIsoRequired(row.updated_at),
  };
}

export async function upsertMemory(
  db: Sql,
  userId: string,
  input: {
    category: MemoryCategory;
    key: string;
    value: string;
    sourceConversationId?: string | null;
  },
): Promise<Memory> {
  const key = input.key.trim().slice(0, 80);
  const value = input.value.trim().slice(0, 2000);
  const category = input.category;
  const existing = await db<Record<string, unknown>>`
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
    const rows = await db<Record<string, unknown>>`
      select id, category, key, value, created_at, updated_at
      from memories where id = ${id} and user_id = ${userId}
    `;
    return mapMemory(rows[0]!);
  }
  const id = nid();
  await db`
    insert into memories (id, user_id, category, key, value, source_conversation_id)
    values (${id}, ${userId}, ${category}, ${key}, ${value}, ${input.sourceConversationId ?? null})
  `;
  const rows = await db<Record<string, unknown>>`
    select id, category, key, value, created_at, updated_at
    from memories where id = ${id}
  `;
  return mapMemory(rows[0]!);
}

export async function updateMemoryRow(
  db: Sql,
  userId: string,
  id: string,
  patch: { category?: MemoryCategory; key?: string; value?: string },
): Promise<void> {
  const rows = await db<Record<string, unknown>>`
    select category, key, value from memories where id = ${id} and user_id = ${userId} limit 1
  `;
  const current = rows[0];
  if (!current) return;
  const category = patch.category ?? String(current.category);
  const key = (patch.key ?? String(current.key)).trim().slice(0, 80);
  const value = (patch.value ?? String(current.value)).trim().slice(0, 2000);
  await db`
    update memories
    set category = ${category}, key = ${key}, value = ${value}, updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}

export async function deleteMemory(db: Sql, userId: string, id: string): Promise<void> {
  await db`delete from memories where id = ${id} and user_id = ${userId}`;
}

export async function deleteAllMemories(db: Sql, userId: string): Promise<void> {
  await db`delete from memories where user_id = ${userId}`;
}

export async function listGoals(db: Sql, userId: string): Promise<Goal[]> {
  const rows = await db<Record<string, unknown>>`
    select id, title, description, status, cadence, last_progress_at, created_at
    from goals
    where user_id = ${userId}
    order by
      case status when 'active' then 0 when 'paused' then 1 else 2 end,
      created_at desc
  `;
  return rows.map(mapGoal);
}

function mapGoal(row: Record<string, unknown>): Goal {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    status: String(row.status) as GoalStatus,
    cadence: String(row.cadence ?? "none") as GoalCadence,
    lastProgressAt: asIso(row.last_progress_at),
    createdAt: asIsoRequired(row.created_at),
  };
}

export async function upsertGoal(
  db: Sql,
  userId: string,
  input: {
    id?: string;
    title: string;
    description?: string;
    status?: GoalStatus;
    cadence?: GoalCadence;
  },
): Promise<Goal> {
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
    const rows = await db<Record<string, unknown>>`
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
  const rows = await db<Record<string, unknown>>`
    select id, title, description, status, cadence, last_progress_at, created_at
    from goals where id = ${id}
  `;
  return mapGoal(rows[0]!);
}

export async function noteGoalProgress(db: Sql, userId: string, id: string): Promise<void> {
  await db`
    update goals set last_progress_at = now(), updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
}

export async function deleteGoal(db: Sql, userId: string, id: string): Promise<void> {
  await db`delete from goals where id = ${id} and user_id = ${userId}`;
}

export async function listReminders(db: Sql, userId: string): Promise<Reminder[]> {
  const rows = await db<Record<string, unknown>>`
    select id, title, notes, due_at, completed, created_at
    from reminders
    where user_id = ${userId}
    order by completed asc, due_at asc nulls last, created_at desc
  `;
  return rows.map(mapReminder);
}

function mapReminder(row: Record<string, unknown>): Reminder {
  return {
    id: String(row.id),
    title: String(row.title),
    notes: String(row.notes ?? ""),
    dueAt: asIso(row.due_at),
    completed: asBool(row.completed),
    createdAt: asIsoRequired(row.created_at),
  };
}

export async function createReminder(
  db: Sql,
  userId: string,
  input: { title: string; notes?: string; dueAt?: string | null },
): Promise<Reminder> {
  const id = nid();
  const title = input.title.trim().slice(0, 160);
  const notes = (input.notes ?? "").trim().slice(0, 800);
  const dueAt = input.dueAt ?? null;
  await db`
    insert into reminders (id, user_id, title, notes, due_at)
    values (${id}, ${userId}, ${title}, ${notes}, ${dueAt})
  `;
  const rows = await db<Record<string, unknown>>`
    select id, title, notes, due_at, completed, created_at from reminders where id = ${id}
  `;
  return mapReminder(rows[0]!);
}

export async function setReminderCompleted(
  db: Sql,
  userId: string,
  id: string,
  completed: boolean,
): Promise<void> {
  await db`
    update reminders set completed = ${completed}
    where id = ${id} and user_id = ${userId}
  `;
}

export async function deleteReminder(db: Sql, userId: string, id: string): Promise<void> {
  await db`delete from reminders where id = ${id} and user_id = ${userId}`;
}

export async function listProactiveEvents(
  db: Sql,
  userId: string,
  limit = 12,
): Promise<ProactiveEvent[]> {
  const rows = await db<Record<string, unknown>>`
    select id, conversation_id, priority, reason, message, notification_title, sent_at, opened_at, ignored
    from proactive_events
    where user_id = ${userId}
    order by sent_at desc
    limit ${limit}
  `;
  return rows.map(mapProactive);
}

function mapProactive(row: Record<string, unknown>): ProactiveEvent {
  return {
    id: String(row.id),
    conversationId: row.conversation_id == null ? null : String(row.conversation_id),
    priority: String(row.priority) as ProactiveEvent["priority"],
    reason: String(row.reason),
    message: String(row.message),
    notificationTitle: String(row.notification_title ?? "Aurelia"),
    sentAt: asIsoRequired(row.sent_at),
    openedAt: asIso(row.opened_at),
    ignored: asBool(row.ignored),
  };
}

export async function insertProactiveEvent(
  db: Sql,
  userId: string,
  input: {
    conversationId: string;
    priority: string;
    reason: string;
    message: string;
    notificationTitle: string;
  },
): Promise<ProactiveEvent> {
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
    priority: input.priority as ProactiveEvent["priority"],
    reason: input.reason,
    message: input.message,
    notificationTitle: input.notificationTitle,
    sentAt: new Date().toISOString(),
    openedAt: null,
    ignored: false,
  };
}

export async function markProactiveOpened(db: Sql, userId: string, id: string): Promise<void> {
  await db`
    update proactive_events set opened_at = now(), ignored = false
    where id = ${id} and user_id = ${userId}
  `;
}

export async function countProactiveSince(
  db: Sql,
  userId: string,
  sinceIso: string,
): Promise<number> {
  const rows = await db<{ n: number }>`
    select count(*)::int as n from proactive_events
    where user_id = ${userId} and sent_at >= ${sinceIso}
  `;
  return asNumber(rows[0]?.n, 0);
}

export async function insertToolCall(
  db: Sql,
  input: {
    userId: string;
    conversationId?: string | null;
    toolName: string;
    args: unknown;
    result: unknown;
    status: string;
  },
): Promise<void> {
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

export async function recentUserLines(
  db: Sql,
  userId: string,
  limit = 12,
): Promise<{ content: string; createdAt: string }[]> {
  const rows = await db<Record<string, unknown>>`
    select content, created_at from messages
    where user_id = ${userId} and role = 'user' and content <> ''
    order by created_at desc
    limit ${limit}
  `;
  return rows.map((r) => ({
    content: String(r.content),
    createdAt: asIsoRequired(r.created_at),
  }));
}

export async function lastMessageTimes(
  db: Sql,
  userId: string,
): Promise<{ lastUserAt: string | null; lastAssistantAt: string | null }> {
  const user = await db<Record<string, unknown>>`
    select created_at from messages
    where user_id = ${userId} and role = 'user'
    order by created_at desc limit 1
  `;
  const assistant = await db<Record<string, unknown>>`
    select created_at from messages
    where user_id = ${userId} and role = 'assistant'
    order by created_at desc limit 1
  `;
  return {
    lastUserAt: user[0] ? asIso(user[0].created_at) : null,
    lastAssistantAt: assistant[0] ? asIso(assistant[0].created_at) : null,
  };
}
