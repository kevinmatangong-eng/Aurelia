/**
 * AIService — provider-agnostic chat + tool calling.
 * The first implementation talks to xAI's OpenAI-compatible API (grok-4.5).
 * Swap the class, not the rest of the app.
 */

export type ChatTurn = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolDef = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type AIResponse = {
  content: string | null;
  toolCalls: ToolCall[];
  finishReason: string;
};

export type ChatRequest = {
  model: string;
  messages: ChatTurn[];
  tools?: ToolDef[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
};

export interface AIService {
  chat(req: ChatRequest): Promise<AIResponse>;
}

const XAI_URL = "https://api.x.ai/v1/chat/completions";

export class XaiAIService implements AIService {
  async chat(req: ChatRequest): Promise<AIResponse> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not available in this environment");
    }

    const body: Record<string, unknown> = {
      model: req.model || "grok-4.5",
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 900,
    };
    if (req.tools?.length) {
      body.tools = req.tools;
      body.tool_choice = "auto";
    }
    if (req.responseFormat === "json_object") {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(XAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`xAI API error ${res.status}${text ? `: ${text.slice(0, 240)}` : ""}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{
        finish_reason?: string;
        message?: {
          content?: string | null;
          tool_calls?: ToolCall[];
        };
      }>;
    };
    const choice = json.choices?.[0];
    const message = choice?.message;
    return {
      content: message?.content ?? null,
      toolCalls: Array.isArray(message?.tool_calls) ? message.tool_calls : [],
      finishReason: choice?.finish_reason ?? "stop",
    };
  }
}

export function getAIService(): AIService {
  return new XaiAIService();
}

export function isAiUnavailableError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("AI is not available");
}
