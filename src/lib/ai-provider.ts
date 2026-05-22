import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

export type AiProviderName = "mimo" | "google";

const DEFAULT_MIMO_BASE = "https://token-plan-sgp.xiaomimimo.com/v1";
const DEFAULT_MIMO_MODEL = "mimo-v2.5";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

type MimoMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "user";
      content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
    };

function stripJsonFences(text: string) {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

/** MiMo sometimes puts output in reasoning_content; extract first JSON object if needed. */
function normalizeModelText(raw: string): string {
  const trimmed = stripJsonFences(raw);
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export function isMimoConfigured(): boolean {
  return Boolean(process.env.MIMO_API_KEY?.trim());
}

export function isGoogleConfigured(): boolean {
  const useVertex =
    process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" ||
    process.env.GOOGLE_GENAI_USE_VERTEXAI === "1";
  const apiKey =
    process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  return useVertex ? Boolean(apiKey || project) : Boolean(apiKey);
}

/** auto = MiMo when MIMO_API_KEY is set, else Google */
export function resolveAiProvider(): AiProviderName {
  const pref = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (pref === "google") return "google";
  if (pref === "mimo") return "mimo";
  if (isMimoConfigured()) return "mimo";
  return "google";
}

function getMimoBaseUrl(): string {
  return (
    process.env.MIMO_API_BASE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_MIMO_BASE
  );
}

function getMimoModelId(): string {
  return process.env.MIMO_MODEL_ID?.trim() || DEFAULT_MIMO_MODEL;
}

function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL_ID?.trim() || DEFAULT_GEMINI_MODEL;
}

function createGenAI(): GoogleGenAI {
  const useVertex =
    process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" ||
    process.env.GOOGLE_GENAI_USE_VERTEXAI === "1";

  const apiKey =
    process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.GOOGLE_CLOUD_LOCATION?.trim() || "global";

  if (useVertex) {
    if (apiKey) {
      return new GoogleGenAI({
        vertexai: true,
        apiKey,
        apiVersion: "v1",
      });
    }
    if (project) {
      return new GoogleGenAI({
        vertexai: true,
        project,
        location,
        apiVersion: "v1",
      });
    }
    throw new Error(
      "Vertex mode: set GOOGLE_API_KEY or GOOGLE_CLOUD_PROJECT."
    );
  }

  if (!apiKey) {
    throw new Error("Set GEMINI_API_KEY or GOOGLE_API_KEY for Google AI.");
  }

  return new GoogleGenAI({ apiKey });
}

async function mimoChatCompletion(
  messages: MimoMessage[],
  options?: { maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.MIMO_API_KEY?.trim();
  if (!apiKey) throw new Error("MIMO_API_KEY is not set");

  const url = `${getMimoBaseUrl()}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getMimoModelId(),
      messages,
      max_tokens: options?.maxTokens ?? 8192,
      temperature: 0.7,
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string; code?: string };
    choices?: Array<{
      message?: {
        content?: string | null;
        reasoning_content?: string | null;
      };
    }>;
  };

  if (!res.ok) {
    const msg = data.error?.message || res.statusText;
    throw new Error(`MiMo API ${res.status}: ${msg}`);
  }

  const message = data.choices?.[0]?.message;
  const text =
    (message?.content && String(message.content).trim()) ||
    (message?.reasoning_content && String(message.reasoning_content).trim()) ||
    "";

  if (!text) {
    throw new Error("MiMo returned an empty response. Try again or increase max_tokens.");
  }

  return text;
}

async function googleGenerateText(prompt: string): Promise<string> {
  const genAI = createGenAI();
  const result = await genAI.models.generateContent({
    model: getGeminiModelId(),
    contents: prompt,
  });
  return result.text || "";
}

async function googleGenerateVision(
  prompt: string,
  photoData: string
): Promise<string> {
  const base64Data = photoData.split(",")[1];
  const mimeType = photoData.split(";")[0].split(":")[1];
  if (!base64Data || !mimeType) {
    throw new Error("Invalid image data URL format");
  }

  const genAI = createGenAI();
  const imagePart = createPartFromBase64(base64Data, mimeType);
  const result = await genAI.models.generateContent({
    model: getGeminiModelId(),
    contents: [imagePart, prompt],
  });
  return result.text || "";
}

async function mimoGenerateVision(
  prompt: string,
  photoData: string
): Promise<string> {
  const system =
    "You are a fitness coach. Respond with valid JSON only, no markdown fences.";
  return mimoChatCompletion(
    [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: photoData } },
        ],
      },
    ],
    { maxTokens: 4096 }
  );
}

/** Text generation: MiMo first when configured (AI_PROVIDER=auto|mimo), else Google. */
export async function generateAiText(
  prompt: string,
  options?: { jsonMode?: boolean }
): Promise<{ text: string; provider: AiProviderName }> {
  const provider = resolveAiProvider();
  const system = options?.jsonMode
    ? "You must respond with valid JSON only. No markdown code fences."
    : undefined;

  if (provider === "mimo") {
    const messages: MimoMessage[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });
    const text = await mimoChatCompletion(messages, { maxTokens: 8192 });
    return { text: normalizeModelText(text), provider: "mimo" };
  }

  const text = stripJsonFences(await googleGenerateText(prompt));
  return { text, provider: "google" };
}

/** Vision: try MiMo if active provider is mimo; fall back to Google when available. */
export async function generateAiVision(
  prompt: string,
  photoData: string
): Promise<{ text: string; provider: AiProviderName }> {
  const primary = resolveAiProvider();

  if (primary === "mimo") {
    try {
      const text = normalizeModelText(await mimoGenerateVision(prompt, photoData));
      return { text, provider: "mimo" };
    } catch (err) {
      console.warn("[ai-provider] MiMo vision failed, trying Google:", err);
      if (!isGoogleConfigured()) throw err;
    }
  }

  const text = stripJsonFences(await googleGenerateVision(prompt, photoData));
  return { text, provider: "google" };
}

export function formatAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("BILLING") || raw.includes("billing")) {
    return "Google Vertex needs billing, or set MIMO_API_KEY to use Xiaomi MiMo instead.";
  }
  if (raw.includes("MIMO_API_KEY") || raw.includes("MiMo API")) {
    return raw;
  }
  if (raw.includes("PERMISSION") || raw.includes("API key")) {
    return "AI API key missing or invalid. Check MIMO_API_KEY or GEMINI_API_KEY in .env.local.";
  }
  return "Could not generate a plan right now. Try again in a moment.";
}
