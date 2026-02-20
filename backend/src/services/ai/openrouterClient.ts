export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  reasoning_details?: unknown;
};

type ChatCompletionOptions = {
  messages: ReadonlyArray<OpenRouterMessage>;
  model?: string;
  temperature?: number;
  enableReasoning?: boolean;
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_STEP_MODEL = "stepfun/step-3.5-flash:free";

function getOptionalClientHeaders(): Record<string, string> {
  // OpenRouter supports these optional headers for attribution; safe to omit.
  const siteUrl = process.env.OPENROUTER_SITE_URL?.trim();
  const title = process.env.OPENROUTER_APP_TITLE?.trim();

  const headers: Record<string, string> = {};
  if (siteUrl) headers["HTTP-Referer"] = siteUrl;
  if (title) headers["X-Title"] = title;
  return headers;
}

export async function createOpenRouterChatCompletion(options: ChatCompletionOptions): Promise<string> {
  const apiKey = process.env.STEP_API_KEY;
  if (!apiKey) {
    throw new Error("STEP_API_KEY is not set");
  }

  const model = options.model ?? process.env.STEP_MODEL ?? DEFAULT_STEP_MODEL;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...getOptionalClientHeaders(),
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.3,
      messages: options.messages,
      ...(options.enableReasoning ? { reasoning: { enabled: true } } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter API returned empty response");
  }

  return content.trim();
}
