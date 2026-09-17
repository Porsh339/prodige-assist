/**
 * Minimal streaming client for the Lovable AI Gateway Responses API.
 * Streaming is mandatory on /v1/responses; we consume the stream server-side
 * and return the final structured JSON payload.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface CallArgs {
  instructions: string;
  input: string;
  schema: { name: string; schema: unknown };
}

export async function callStructured<T>({ instructions, input, schema }: CallArgs): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiError("AI is not configured for this workspace.", 401);
  }

  let res: Response;
  try {
    res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: schema.name,
            strict: true,
            schema: schema.schema,
          },
        },
      }),
    });
  } catch {
    throw new AiError("We couldn't reach the AI service. Check your connection and try again.", 503);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AiError(messageForStatus(res.status, detail), res.status);
  }
  if (!res.body) {
    throw new AiError("The AI service returned an empty response. Please try again.", 502);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && evt.response?.output_text) {
          if (!text) text = evt.response.output_text;
        }
      } catch {
        // ignore malformed keep-alive frames
      }
    }
  }

  if (!text.trim()) {
    throw new AiError(
      "The AI finished without producing an answer. Try rephrasing or shortening your input.",
      502,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError("The AI returned an unexpected format. Please regenerate.", 502);
  }
}

function messageForStatus(status: number, detail: string) {
  switch (status) {
    case 400:
      return "That request couldn't be processed. Try shortening or simplifying your input.";
    case 401:
      return "AI access isn't configured correctly for this workspace.";
    case 402:
      return "The workspace has run out of AI credits. Add credits in Lovable to keep generating.";
    case 403:
      return "AI usage is currently blocked by a workspace policy or spending limit.";
    case 429:
      return "Too many requests right now. Wait a few seconds and try again.";
    default:
      return status >= 500
        ? "The AI service is temporarily unavailable. Please try again in a moment."
        : detail.slice(0, 160) || "Something went wrong while generating.";
  }
}
