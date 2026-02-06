export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionOptions = {
  messages: ReadonlyArray<GroqMessage>;
  model?: string;
  temperature?: number;
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model ?? process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      temperature: options.temperature ?? 0.3,
      messages: options.messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq API returned empty response");
  }

  return content.trim();
}
