import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

export type AiProviderName = "mimo" | "google";

const DEFAULT_MIMO_BASE = "https://token-plan-sgp.xiaomimimo.com/v1";
const DEFAULT_GC_BASE = "https://api.generalcompute.com/v1";
const DEFAULT_MIMO_MODEL = "mimo-v2.5";
const DEFAULT_GC_MODEL = "minimax-m2.7";

function isGeneralComputeKey(apiKey: string): boolean {
  return apiKey.startsWith("gc_");
}
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

/** Brace-balanced slice — avoids trailing model chatter after JSON. */
function sliceBalancedJson(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Pull the best JSON object from model output (reasoning + JSON mixed). */
export function parseAiJsonResponse(raw: string): Record<string, unknown> | null {
  const trimmed = stripJsonFences(raw);
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === "object" && !Array.isArray(direct)) {
      return direct as Record<string, unknown>;
    }
  } catch {
    /* continue */
  }

  const candidates: Record<string, unknown>[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] !== "{") continue;
    const slice = sliceBalancedJson(trimmed, i);
    if (!slice) continue;
    try {
      const parsed = JSON.parse(slice);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        candidates.push(parsed as Record<string, unknown>);
      }
    } catch {
      /* skip invalid slice */
    }
  }

  if (candidates.length === 0) return null;

  const withPlan = candidates.find(
    (c) => Array.isArray(c.days) || Array.isArray(c.meals) || c.estimatedBodyFat
  );
  return withPlan ?? candidates[candidates.length - 1];
}

/** MiMo / MiniMax often prepends chain-of-thought before JSON. */
function normalizeModelText(raw: string): string {
  const parsed = parseAiJsonResponse(raw);
  if (parsed) return JSON.stringify(parsed);
  const trimmed = stripJsonFences(raw);
  const start = trimmed.indexOf("{");
  const slice = start >= 0 ? sliceBalancedJson(trimmed, start) : null;
  return slice ?? trimmed;
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
  const fromEnv = process.env.MIMO_API_BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const key = process.env.MIMO_API_KEY?.trim() || "";
  if (isGeneralComputeKey(key)) return DEFAULT_GC_BASE;
  return DEFAULT_MIMO_BASE;
}

function getMimoModelId(): string {
  const fromEnv = process.env.MIMO_MODEL_ID?.trim();
  if (fromEnv) return fromEnv;
  const key = process.env.MIMO_API_KEY?.trim() || "";
  if (isGeneralComputeKey(key)) return DEFAULT_GC_MODEL;
  return DEFAULT_MIMO_MODEL;
}

function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL_ID?.trim() || DEFAULT_GEMINI_MODEL;
}

/** AI Studio key — best for physique scan (vision); free tier supports images. */
function getGeminiStudioKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
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

/** Vision prefers Gemini AI Studio (not Vertex) when GEMINI_API_KEY is set. */
function createGenAIForVision(): GoogleGenAI {
  const studioKey = getGeminiStudioKey();
  if (studioKey) return new GoogleGenAI({ apiKey: studioKey });
  return createGenAI();
}

export function isVisionConfigured(): boolean {
  if (getGeminiStudioKey()) return true;
  return isGoogleConfigured();
}

async function mimoChatCompletion(
  messages: MimoMessage[],
  options?: { maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const apiKey = process.env.MIMO_API_KEY?.trim();
  if (!apiKey) throw new Error("MIMO_API_KEY is not set");

  const url = `${getMimoBaseUrl()}/chat/completions`;
  const basePayload = {
    model: getMimoModelId(),
    messages,
    max_tokens: options?.maxTokens ?? 8192,
    temperature: options?.jsonMode ? 0.35 : 0.7,
  };

  const tryRequest = async (withJsonFormat: boolean) => {
    const body: Record<string, unknown> = { ...basePayload };
    if (withJsonFormat && options?.jsonMode) {
      body.response_format = { type: "json_object" };
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    return { res, data };
  };

  let { res, data } = await tryRequest(Boolean(options?.jsonMode));
  if (!res.ok && options?.jsonMode && res.status === 400) {
    ({ res, data } = await tryRequest(false));
  }

  if (!res.ok) {
    const msg = data.error?.message || res.statusText;
    const base = getMimoBaseUrl();
    throw new Error(`AI API ${res.status}: ${msg} (endpoint: ${base})`);
  }

  const message = data.choices?.[0]?.message;
  const parts = [
    message?.content && String(message.content).trim(),
    message?.reasoning_content && String(message.reasoning_content).trim(),
  ].filter(Boolean) as string[];
  const text = parts.join("\n\n");

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

  const genAI = createGenAIForVision();
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
    const text = await mimoChatCompletion(messages, {
      maxTokens: 8192,
      jsonMode: options?.jsonMode,
    });
    return { text: normalizeModelText(text), provider: "mimo" };
  }

  const text = stripJsonFences(await googleGenerateText(prompt));
  return { text, provider: "google" };
}

/**
 * Vision / physique scan — needs an image-capable model.
 * General Compute minimax-m2.7 is text-only; use GEMINI_API_KEY (AI Studio) for photos.
 */
export async function generateAiVision(
  prompt: string,
  photoData: string
): Promise<{ text: string; provider: AiProviderName }> {
  const mimoKey = process.env.MIMO_API_KEY?.trim() || "";

  if (isVisionConfigured()) {
    try {
      const text = stripJsonFences(await googleGenerateVision(prompt, photoData));
      return { text, provider: "google" };
    } catch (err) {
      console.warn("[ai-provider] Google vision failed:", err);
      if (!mimoKey || isGeneralComputeKey(mimoKey)) throw err;
    }
  }

  // Legacy Xiaomi MiMo only (not General Compute / minimax-m2.7)
  if (mimoKey && !isGeneralComputeKey(mimoKey)) {
    try {
      const text = normalizeModelText(await mimoGenerateVision(prompt, photoData));
      return { text, provider: "mimo" };
    } catch (err) {
      console.warn("[ai-provider] MiMo vision failed:", err);
      throw err;
    }
  }

  throw new Error(
    "PHYSIQUE_VISION_UNAVAILABLE: Physique scan needs GEMINI_API_KEY from https://aistudio.google.com/apikey. " +
      "General Compute (minimax-m2.7) handles workout/diet text only — it cannot read photos."
  );
}

export function formatAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("PHYSIQUE_VISION_UNAVAILABLE")) {
    return (
      "Physique scan needs a vision AI. Add GEMINI_API_KEY from Google AI Studio (free): " +
      "https://aistudio.google.com/apikey — then restart dev / redeploy Vercel. " +
      "Workout & diet plans still use General Compute; only photo analysis needs Gemini."
    );
  }
  if (raw.includes("BILLING") || raw.includes("billing")) {
    return (
      "Physique scan: enable Google Cloud billing, or add a free GEMINI_API_KEY from " +
      "https://aistudio.google.com/apikey (set GOOGLE_GENAI_USE_VERTEXAI=false for AI Studio)."
    );
  }
  if (raw.includes("401") && raw.includes("Invalid API Key")) {
    return (
      "Invalid API key for this provider. General Compute keys (gc_…) need " +
      "MIMO_API_BASE_URL=https://api.generalcompute.com/v1 and MIMO_MODEL_ID=minimax-m2.7. " +
      "Restart npm run dev after changing .env.local, or update all four AI vars on Vercel and redeploy."
    );
  }
  if (raw.includes("MIMO_API_KEY") || raw.includes("AI API") || raw.includes("MiMo API")) {
    return raw;
  }
  if (raw.includes("PERMISSION") || raw.includes("API key")) {
    return "AI API key missing or invalid. Check MIMO_API_KEY or GEMINI_API_KEY in .env.local.";
  }
  return "Could not generate a plan right now. Try again in a moment.";
}
