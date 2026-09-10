import type { Sql } from "@/lib/db";
import { truncate } from "@/lib/utils";
import type { ToolDef } from "./ai";
import * as repo from "./repo";
import { formatNow } from "./time";
import type { MemoryCategory } from "./types";
import { MEMORY_CATEGORIES } from "./types";

export type ToolContext = {
  db: Sql;
  userId: string;
  conversationId: string;
  timezone: string;
  memoryEnabled: boolean;
};

const CATEGORY_ENUM = MEMORY_CATEGORIES;

export const AURELIA_TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the user's current local date and time.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "retrieve_memory",
      description: "Search organized long-term memory. Optional category or query filters.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: CATEGORY_ENUM },
          query: { type: "string", description: "Optional substring to match against key or value" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description:
        "Store or update a durable fact about the user. Use short keys (e.g. philosophy, sleep_goal).",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: CATEGORY_ENUM },
          key: { type: "string" },
          value: { type: "string" },
        },
        required: ["category", "key", "value"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_goals",
      description: "List the user's goals and their status/cadence/last progress.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
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
          status: { type: "string", enum: ["active", "paused", "done"] },
          cadence: { type: "string", enum: ["none", "daily", "weekly"] },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
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
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_reminders",
      description: "List reminders. Defaults to open (incomplete) ones.",
      parameters: {
        type: "object",
        properties: {
          includeCompleted: { type: "boolean" },
        },
        additionalProperties: false,
      },
    },
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
          due_at: { type: "string" },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
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
          completed: { type: "boolean" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "retrieve_recent_conversations",
      description: "Get titles and last lines of recent conversations for cross-thread context.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
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
        additionalProperties: false,
      },
    },
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
        additionalProperties: false,
      },
    },
  },
];

export async function executeTool(
  name: string,
  rawArgs: string,
  ctx: ToolContext,
): Promise<string> {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  } catch {
    return JSON.stringify({ error: "Invalid tool arguments" });
  }

  try {
    const result = await runTool(name, args, ctx);
    await repo.insertToolCall(ctx.db, {
      userId: ctx.userId,
      conversationId: ctx.conversationId,
      toolName: name,
      args,
      result,
      status: "ok",
    });
    return JSON.stringify(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tool failed";
    await repo.insertToolCall(ctx.db, {
      userId: ctx.userId,
      conversationId: ctx.conversationId,
      toolName: name,
      args,
      result: { error: message },
      status: "error",
    });
    return JSON.stringify({ error: message });
  }
}

async function runTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  switch (name) {
    case "get_current_time":
      return { now: formatNow(ctx.timezone), timezone: ctx.timezone };
    case "retrieve_memory": {
      if (!ctx.memoryEnabled) return { disabled: true, memories: [] };
      const all = await repo.listMemories(ctx.db, ctx.userId);
      const category = typeof args.category === "string" ? args.category : null;
      const query = typeof args.query === "string" ? args.query.toLowerCase() : null;
      const filtered = all.filter((m) => {
        if (category && m.category !== category) return false;
        if (!query) return true;
        return (
          m.key.toLowerCase().includes(query) || m.value.toLowerCase().includes(query)
        );
      });
      return { memories: filtered.slice(0, 24) };
    }
    case "save_memory": {
      if (!ctx.memoryEnabled) {
        return { disabled: true, error: "Memory is turned off in settings." };
      }
      const category = String(args.category ?? "other") as MemoryCategory;
      const key = String(args.key ?? "").trim();
      const value = String(args.value ?? "").trim();
      if (!key || !value) return { error: "key and value are required" };
      const saved = await repo.upsertMemory(ctx.db, ctx.userId, {
        category: MEMORY_CATEGORIES.includes(category) ? category : "other",
        key,
        value,
        sourceConversationId: ctx.conversationId,
      });
      return { saved };
    }
    case "get_goals":
      return { goals: await repo.listGoals(ctx.db, ctx.userId) };
    case "upsert_goal": {
      const title = String(args.title ?? "").trim();
      if (!title) return { error: "title is required" };
      const goal = await repo.upsertGoal(ctx.db, ctx.userId, {
        id: typeof args.id === "string" ? args.id : undefined,
        title,
        description: typeof args.description === "string" ? args.description : "",
        status:
          args.status === "paused" || args.status === "done" || args.status === "active"
            ? args.status
            : "active",
        cadence:
          args.cadence === "daily" || args.cadence === "weekly" || args.cadence === "none"
            ? args.cadence
            : "none",
      });
      return { goal };
    }
    case "note_goal_progress": {
      const id = String(args.id ?? "");
      if (!id) return { error: "id is required" };
      await repo.noteGoalProgress(ctx.db, ctx.userId, id);
      return { ok: true };
    }
    case "get_reminders": {
      const all = await repo.listReminders(ctx.db, ctx.userId);
      const includeCompleted = args.includeCompleted === true;
      return { reminders: includeCompleted ? all : all.filter((r) => !r.completed) };
    }
    case "create_reminder": {
      const title = String(args.title ?? "").trim();
      if (!title) return { error: "title is required" };
      const reminder = await repo.createReminder(ctx.db, ctx.userId, {
        title,
        notes: typeof args.notes === "string" ? args.notes : "",
        dueAt: typeof args.due_at === "string" && args.due_at ? args.due_at : null,
      });
      return { reminder };
    }
    case "complete_reminder": {
      const id = String(args.id ?? "");
      if (!id) return { error: "id is required" };
      await repo.setReminderCompleted(ctx.db, ctx.userId, id, args.completed !== false);
      return { ok: true };
    }
    case "retrieve_recent_conversations": {
      const convos = await repo.listConversations(ctx.db, ctx.userId);
      return {
        conversations: convos.slice(0, 8).map((c) => ({
          id: c.id,
          title: c.title,
          lastMessage: c.lastMessage ? truncate(c.lastMessage, 160) : null,
          updatedAt: c.updatedAt,
        })),
      };
    }
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
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function searchReference(query: string): Promise<unknown> {
  const url = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AureliaCompanion/1.0" },
  });
  if (!res.ok) return { error: `Search failed (${res.status})` };
  const data = (await res.json()) as {
    pages?: Array<{ title: string; description?: string; excerpt?: string; key?: string }>;
  };
  const pages = data.pages ?? [];
  const results: Array<{ title: string; summary: string; url: string }> = [];
  for (const page of pages.slice(0, 3)) {
    const title = page.title;
    let summary = page.description || page.excerpt || "";
    try {
      const sumRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.key || title)}`,
        { headers: { "User-Agent": "AureliaCompanion/1.0" } },
      );
      if (sumRes.ok) {
        const sum = (await sumRes.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } };
        summary = sum.extract || summary;
        results.push({
          title,
          summary: summary.slice(0, 600),
          url: sum.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        });
        continue;
      }
    } catch {
      /* fall through */
    }
    results.push({
      title,
      summary: String(summary).slice(0, 400),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    });
  }
  return { results };
}

async function getWeather(place: string): Promise<unknown> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`,
  );
  if (!geoRes.ok) return { error: "Could not look up that place" };
  const geo = (await geoRes.json()) as {
    results?: Array<{ name: string; country?: string; latitude: number; longitude: number }>;
  };
  const hit = geo.results?.[0];
  if (!hit) return { error: "Place not found" };
  const wxRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current_weather=true`,
  );
  if (!wxRes.ok) return { error: "Weather lookup failed" };
  const wx = (await wxRes.json()) as {
    current_weather?: { temperature: number; windspeed: number; weathercode: number };
  };
  const cur = wx.current_weather;
  if (!cur) return { error: "No current weather" };
  return {
    place: `${hit.name}${hit.country ? `, ${hit.country}` : ""}`,
    temperatureC: cur.temperature,
    windspeedKmh: cur.windspeed,
    condition: weatherCodeLabel(cur.weathercode),
  };
}

function weatherCodeLabel(code: number): string {
  if (code === 0) return "clear";
  if (code <= 3) return "partly cloudy";
  if (code <= 48) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "showers";
  if (code <= 99) return "storm";
  return "unknown";
}
