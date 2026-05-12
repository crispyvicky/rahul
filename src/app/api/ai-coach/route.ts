import { GoogleGenAI, createPartFromBase64 } from "@google/genai";
import { NextResponse } from "next/server";
import { consumeAiRateLimit, getAiClientIp } from "@/lib/ai-rate-limit";

/** @google/genai uses Node APIs; Edge runtime breaks the route → browser "Failed to fetch". */
export const runtime = "nodejs";

/** Cap user free-text in prompts (tokens + cost). */
const MAX_CUSTOM_INSTRUCTIONS = 2500;
/** Reject huge base64 images before Vertex/Gemini (cost + timeouts). ~4.5MB binary upper bound. */
const MAX_PHOTO_DATA_CHARS = 6_500_000;

/** Default model for Vertex + Gemini API (override with GEMINI_MODEL_ID). */
const DEFAULT_MODEL = "gemini-2.5-flash";

function getTextModelId() {
  return process.env.GEMINI_MODEL_ID?.trim() || DEFAULT_MODEL;
}

/**
 * Gemini via Google Cloud / Vertex (API key or ADC) or Gemini Developer API (AI Studio key).
 *
 * Vertex — Express / API key (recommended for your Cloud free-tier key):
 *   GOOGLE_GENAI_USE_VERTEXAI=true
 *   GOOGLE_API_KEY=your_cloud_api_key
 *
 * Vertex — project + Application Default Credentials (no API key in env):
 *   GOOGLE_GENAI_USE_VERTEXAI=true
 *   GOOGLE_CLOUD_PROJECT=your-project-id
 *   GOOGLE_CLOUD_LOCATION=global   (optional; default global)
 *
 * Gemini Developer API (AI Studio key, hits generativelanguage.googleapis.com):
 *   Do not set GOOGLE_GENAI_USE_VERTEXAI (or set false)
 *   GEMINI_API_KEY=...   or   GOOGLE_API_KEY=...   (GOOGLE_API_KEY wins if both set)
 */
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
      "Vertex mode (GOOGLE_GENAI_USE_VERTEXAI=true): set GOOGLE_API_KEY for express mode, or GOOGLE_CLOUD_PROJECT for ADC."
    );
  }

  if (!apiKey) {
    throw new Error(
      "Set GOOGLE_API_KEY or GEMINI_API_KEY for Gemini API, or enable Vertex with GOOGLE_GENAI_USE_VERTEXAI=true and GOOGLE_API_KEY / GOOGLE_CLOUD_PROJECT."
    );
  }

  return new GoogleGenAI({ apiKey });
}

function stripJsonFences(text: string) {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function clampCustomInstructions(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  const s = String(raw);
  if (s.length <= MAX_CUSTOM_INSTRUCTIONS) return s;
  return s.slice(0, MAX_CUSTOM_INSTRUCTIONS);
}

export async function POST(req: Request) {
  try {
    let body: { type?: string; userData?: any; photoData?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const clientIp = getAiClientIp(req);
    const modelId = getTextModelId();

    const { type, userData, photoData } = body;

    if ((type === "workout" || type === "diet") && (!userData || typeof userData !== "object")) {
      return NextResponse.json({ error: "Missing userData" }, { status: 400 });
    }

    if (type === "workout") {
      const instructions = clampCustomInstructions(userData.customInstructions);

      const locationPrompt =
        userData.workoutLocation === "home"
          ? "They are working out at HOME with minimal equipment (bodyweight, dumbbells, bands)."
          : "They are working out at a FULL GYM with machines, barbells, and cables.";

      const customRequest = instructions
        ? `\nCRITICAL SPECIAL INSTRUCTIONS FROM USER: "${instructions}". YOU MUST ADAPT THE WORKOUT TO ACCOUNT FOR THIS EXACT REQUEST.`
        : "";

      const prompt = `You are an elite, charismatic, and slightly flirty fitness coach. Use simple, easy-to-understand English.
      The user is a ${userData.age} year old ${userData.gender}, weighs ${userData.weight}kg, and is ${userData.height}cm tall.
      Their primary goal is: ${userData.goal}. Their current fitness level is: ${userData.fitnessLevel}.
      They can workout ${userData.workoutDays} days a week.
      ${locationPrompt}${customRequest}

      Generate a highly personalized ${userData.workoutDays}-day workout split for them.
      Return the response in JSON format. The response must EXACTLY match this structure (no markdown tags, just the raw JSON object):
      {
        "message": "Hey gorgeous! Ready to sweat? I made this special workout just for you...",
        "planName": "Name of the Plan",
        "focus": "Main focus/philosophy of this plan",
        "days": [
          {
            "day": "Day 1",
            "title": "Push Day / Legs / etc",
            "exercises": [
              { "name": "Bench Press", "sets": "4", "reps": "8-10", "notes": "Control the negative" }
            ]
          }
        ]
      }`;

      const genAI = createGenAI();

      const rl = consumeAiRateLimit(clientIp, "text");
      if (rl.ok === false) {
        return NextResponse.json(
          { error: rl.message, retryAfterSec: rl.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const result = await genAI.models.generateContent({
        model: modelId,
        contents: prompt,
      });
      const text = stripJsonFences(result.text || "");
      try {
        return NextResponse.json(JSON.parse(text));
      } catch {
        return NextResponse.json(
          { error: "Model did not return valid JSON. Try again or shorten special instructions." },
          { status: 502 }
        );
      }
    }

    if (type === "diet") {
      const instructions = clampCustomInstructions(userData.customInstructions);

      const customRequest = instructions
        ? `\nCRITICAL SPECIAL INSTRUCTIONS FROM USER: "${instructions}". YOU MUST ADAPT THE DIET TO ACCOUNT FOR THIS EXACT REQUEST.`
        : "";

      const prompt = `You are a charismatic, slightly flirty sports nutritionist. Use simple, easy-to-understand English.
      The user is a ${userData.age} year old ${userData.gender}, weighs ${userData.weight}kg, and is ${userData.height}cm tall.
      Their goal is: ${userData.goal}. Their current fitness level is: ${userData.fitnessLevel}.${customRequest}

      Generate a highly personalized daily meal plan for them.
      Return the response in JSON format. The response must EXACTLY match this structure (no markdown tags, just the raw JSON object):
      {
        "message": "Hey cutie, abs are made in the kitchen! I've put together a delicious menu to help you reach your goals...",
        "dailyCalories": "2500",
        "macros": { "protein": "180g", "carbs": "250g", "fats": "70g" },
        "meals": [
          {
            "time": "Breakfast",
            "name": "Oatmeal & Eggs",
            "foods": ["1 cup oats", "3 whole eggs", "1 banana"],
            "calories": "550"
          }
        ],
        "hydration": "Drink 3.5L of water daily",
        "supplements": ["Whey Protein", "Creatine Monohydrate"]
      }`;

      const genAI = createGenAI();

      const rl = consumeAiRateLimit(clientIp, "text");
      if (rl.ok === false) {
        return NextResponse.json(
          { error: rl.message, retryAfterSec: rl.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const result = await genAI.models.generateContent({
        model: modelId,
        contents: prompt,
      });
      const text = stripJsonFences(result.text || "");
      try {
        return NextResponse.json(JSON.parse(text));
      } catch {
        return NextResponse.json(
          { error: "Model did not return valid JSON. Try again or shorten special instructions." },
          { status: 502 }
        );
      }
    }

    if (type === "physique") {
      if (!photoData || typeof photoData !== "string") {
        return NextResponse.json({ error: "Missing photoData (base64 image)" }, { status: 400 });
      }
      if (photoData.length > MAX_PHOTO_DATA_CHARS) {
        return NextResponse.json(
          {
            error: "Image is too large. Use a smaller photo or lower resolution (max ~4–5 MB).",
          },
          { status: 413 }
        );
      }

      const base64Data = photoData.split(",")[1];
      const mimeType = photoData.split(";")[0].split(":")[1];
      if (!base64Data || !mimeType) {
        return NextResponse.json({ error: "Invalid image data URL format" }, { status: 400 });
      }

      const prompt = `You are an elite bodybuilding coach and physique analyst.
      Analyze this user's physique photo.
      
      Return the response in JSON format. The response must EXACTLY match this structure (no markdown tags, just the raw JSON object):
      {
        "estimatedBodyFat": "14-16%",
        "strongAreas": ["Chest", "Shoulders"],
        "weakAreas": ["Lats", "Calves"],
        "feedback": "Overall good structure. Focus on back width to create a stronger V-taper. Chest development is impressive.",
        "actionPlan": [
          "Add 2 extra sets of pull-ups on back day",
          "Train calves 3x a week with heavy weight"
        ]
      }`;

      const imagePart = createPartFromBase64(base64Data, mimeType);

      const genAI = createGenAI();

      const rl = consumeAiRateLimit(clientIp, "vision");
      if (rl.ok === false) {
        return NextResponse.json(
          { error: rl.message, retryAfterSec: rl.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const result = await genAI.models.generateContent({
        model: modelId,
        contents: [imagePart, prompt],
      });
      const text = stripJsonFences(result.text || "");
      try {
        return NextResponse.json(JSON.parse(text));
      } catch {
        return NextResponse.json(
          { error: "Model did not return valid JSON for image analysis. Try another photo." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate AI response";
    console.error("Gemini / Vertex API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
