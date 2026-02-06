export type GeminiTextOptions = {
  system?: string;
  prompt: string;
  model?: string;
  temperature?: number;
  // Kept for API compatibility with callers, but not all REST endpoints support it.
  responseMimeType?: string;
};

const GEMINI_API_BASES = [
  "https://generativelanguage.googleapis.com/v1",
  "https://generativelanguage.googleapis.com/v1beta",
] as const;

function normalizeModel(model: string): string {
  const trimmed = model.trim().replace(/^"|"$/g, "");
  if (!trimmed) return "models/gemini-1.5-flash";
  return trimmed.startsWith("models/") ? trimmed : `models/${trimmed}`;
}

function extractCandidateText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const root = data as any;
  const text =
    root?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ??
    root?.candidates?.[0]?.content?.parts?.[0]?.text ??
    null;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

async function listModels(apiBase: string, apiKey: string): Promise<string[]> {
  const url = `${apiBase}/models?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) return [];
  const data = (await response.json()) as any;
  const models = Array.isArray(data?.models) ? data.models : [];
  return models
    .map((m: any) => m?.name)
    .filter((n: any) => typeof n === "string" && n.startsWith("models/"));
}

async function postGenerateContent(
  apiBase: string,
  apiKey: string,
  model: string,
  body: unknown,
): Promise<Response> {
  const url = `${apiBase}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function generateGeminiText(options: GeminiTextOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = normalizeModel(options.model ?? process.env.GEMINI_MODEL ?? "models/gemini-1.5-flash");

  // Some REST variants reject `systemInstruction` and `responseMimeType`.
  // To maximize compatibility, we fold the system prompt into the user prompt.
  const fullPrompt = options.system
    ? `SYSTEM:\n${options.system}\n\nUSER:\n${options.prompt}`
    : options.prompt;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
    },
  };

  let lastErrorText: string | null = null;
  let lastStatus: number | null = null;

  for (const apiBase of GEMINI_API_BASES) {
    const response = await postGenerateContent(apiBase, apiKey, model, body);
    if (response.ok) {
      const data = (await response.json()) as unknown;
      const content = extractCandidateText(data);
      if (!content) {
        throw new Error("Gemini API returned empty response");
      }
      return content;
    }

    lastStatus = response.status;
    lastErrorText = await response.text();

    // If the model isn't found for this API version, try the next base.
    if (response.status === 404) continue;

    // If payload fields differ by API version, try the next base.
    if (response.status === 400 && /Unknown name/i.test(lastErrorText)) continue;

    throw new Error(`Gemini API error (${response.status}): ${lastErrorText}`);
  }

  // All bases returned 404; include available models to help configuration.
  const modelsV1 = await listModels(GEMINI_API_BASES[0], apiKey);
  const modelsV1beta = await listModels(GEMINI_API_BASES[1], apiKey);
  const available = Array.from(new Set([...modelsV1, ...modelsV1beta]));
  const hint = available.length
    ? ` Available models include: ${available.slice(0, 25).join(", ")}${available.length > 25 ? ", ..." : ""}. Ensure backend was restarted after editing backend/.env and set GEMINI_MODEL to one of these.`
    : " Ensure backend was restarted after editing backend/.env. You can call ListModels to see what your key supports.";

  throw new Error(`Gemini API error (${lastStatus ?? 404}): ${lastErrorText ?? "Model not found."}${hint}`);
}
