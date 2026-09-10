import { truncate } from "@/lib/utils";
import type { Sql } from "@/lib/db";
import { getAIService, type ChatTurn } from "./ai";
import { buildSystemPrompt } from "./personality";
import * as repo from "./repo";
import { AURELIA_TOOLS, executeTool } from "./tools";
import type { ChatMessage, UserSettings } from "./types";

const MAX_TOOL_ROUNDS = 5;
const HISTORY_LIMIT = 28;

export async function runAssistantTurn(input: {
  db: Sql;
  userId: string;
  conversationId: string;
  settings: UserSettings;
}): Promise<ChatMessage> {
  const [messages, memories, goals, reminders] = await Promise.all([
    repo.listMessages(input.db, input.userId, input.conversationId),
    input.settings.memoryEnabled
      ? repo.listMemories(input.db, input.userId)
      : Promise.resolve([]),
    repo.listGoals(input.db, input.userId),
    repo.listReminders(input.db, input.userId),
  ]);

  const system = buildSystemPrompt({
    settings: input.settings,
    memories,
    goals,
    reminders,
  });

  const history = messages.filter(
    (m) =>
      (m.role === "user" || m.role === "assistant" || m.role === "tool") &&
      (m.content || m.toolName),
  );
  const sliced = history.slice(-HISTORY_LIMIT);

  const turns: ChatTurn[] = [
    { role: "system", content: system },
    ...sliced.map((m): ChatTurn => {
      if (m.role === "tool") {
        return {
          role: "tool",
          content: m.content,
          tool_call_id: m.toolName ? m.id : undefined,
        };
      }
      return { role: m.role === "assistant" ? "assistant" : "user", content: m.content };
    }),
  ];

  const ai = getAIService();
  const ctx = {
    db: input.db,
    userId: input.userId,
    conversationId: input.conversationId,
    timezone: input.settings.timezone,
    memoryEnabled: input.settings.memoryEnabled,
  };

  let finalText = "";
  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const response = await ai.chat({
      model: input.settings.model || "grok-4.5",
      messages: turns,
      tools: AURELIA_TOOLS,
      temperature: 0.85,
      maxTokens: 900,
    });

    if (response.toolCalls.length > 0) {
      turns.push({
        role: "assistant",
        content: response.content,
        tool_calls: response.toolCalls,
      });
      for (const call of response.toolCalls) {
        const result = await executeTool(call.function.name, call.function.arguments, ctx);
        turns.push({
          role: "tool",
          content: result,
          tool_call_id: call.id,
        });
      }
      continue;
    }

    finalText = (response.content ?? "").trim();
    break;
  }

  if (!finalText) {
    finalText = "I started to answer and then thought better of a hollow reply. Say that again, a little more plainly.";
  }

  const saved = await repo.insertMessage(input.db, {
    userId: input.userId,
    conversationId: input.conversationId,
    role: "assistant",
    content: finalText,
  });

  const convo = await repo.getConversation(input.db, input.userId, input.conversationId);
  if (convo && (convo.title === "Conversation" || convo.title === "New thread")) {
    const firstUser = messages.find((m) => m.role === "user" && m.content.trim());
    if (firstUser) {
      await repo.renameConversation(
        input.db,
        input.userId,
        input.conversationId,
        truncate(firstUser.content, 42),
      );
    }
  }

  return saved;
}
