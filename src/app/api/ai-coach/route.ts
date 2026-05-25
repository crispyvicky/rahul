import { NextResponse } from "next/server";
import { consumeAiRateLimit, getAiClientIp } from "@/lib/ai-rate-limit";
import {
  formatAiError,
  generateAiText,
  generateAiVision,
} from "@/lib/ai-provider";
import {
  buildDietPrompt,
  buildWorkoutPrompt,
  isVegetarianPreference,
} from "@/lib/ai-coach-prompts";

/** Node runtime required for AI HTTP calls. */
export const runtime = "nodejs";

const MAX_CUSTOM_INSTRUCTIONS = 2500;
const MAX_PHOTO_DATA_CHARS = 6_500_000;

function clampCustomInstructions(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  const s = String(raw);
  if (s.length <= MAX_CUSTOM_INSTRUCTIONS) return s;
  return s.slice(0, MAX_CUSTOM_INSTRUCTIONS);
}

function parseJsonResponse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    let body: { type?: string; userData?: Record<string, unknown>; photoData?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const clientIp = getAiClientIp(req);
    const { type, userData, photoData } = body;

    if ((type === "workout" || type === "diet") && (!userData || typeof userData !== "object")) {
      return NextResponse.json({ error: "Missing userData" }, { status: 400 });
    }

    if (type === "workout") {
      const prompt = buildWorkoutPrompt(userData!);

      const rl = consumeAiRateLimit(clientIp, "text");
      if (rl.ok === false) {
        return NextResponse.json(
          { error: rl.message, retryAfterSec: rl.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const { text } = await generateAiText(prompt, { jsonMode: true });
      const parsed = parseJsonResponse(text);
      if (!parsed) {
        return NextResponse.json(
          { error: "Model did not return valid JSON. Try again or shorten special instructions." },
          { status: 502 }
        );
      }
      const days = Array.isArray(parsed.days) ? parsed.days : [];
      const expected = Number(userData!.workoutDays) || days.length;
      if (days.length < 1) {
        return NextResponse.json(
          { error: "Plan was empty. Please generate again." },
          { status: 502 }
        );
      }
      if (expected > 0 && days.length !== expected) {
        parsed.days = days.slice(0, expected);
        while (parsed.days.length < expected) {
          parsed.days.push(days[parsed.days.length % days.length]);
        }
      }
      return NextResponse.json(parsed);
    }

    if (type === "diet") {
      const instructions = clampCustomInstructions(userData!.customInstructions);
      userData!.customInstructions = instructions;
      const prompt = buildDietPrompt(userData!);

      const rl = consumeAiRateLimit(clientIp, "text");
      if (rl.ok === false) {
        return NextResponse.json(
          { error: rl.message, retryAfterSec: rl.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const { text } = await generateAiText(prompt, { jsonMode: true });
      const parsed = parseJsonResponse(text);
      if (!parsed) {
        return NextResponse.json(
          { error: "Model did not return valid JSON. Try again or shorten special instructions." },
          { status: 502 }
        );
      }
      const meals = Array.isArray(parsed.meals) ? parsed.meals : [];
      if (meals.length < 1) {
        return NextResponse.json(
          { error: "Diet plan was empty. Please generate again." },
          { status: 502 }
        );
      }
      if (isVegetarianPreference(instructions)) {
        const eggMeat = /\b(egg|eggs|chicken|mutton|fish|prawn|meat)\b/i;
        parsed.meals = meals.map((m: { foods?: string[]; name?: string }) => {
          const foods = Array.isArray(m.foods) ? m.foods.filter((f) => !eggMeat.test(f)) : m.foods;
          const name = m.name && eggMeat.test(m.name) ? "Vegetarian Telugu meal" : m.name;
          return { ...m, foods, name };
        });
      }
      if (!Array.isArray(parsed.teluguTips) || parsed.teluguTips.length < 1) {
        parsed.region = parsed.region || "Telangana · Andhra";
      }
      return NextResponse.json(parsed);
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

      const rl = consumeAiRateLimit(clientIp, "vision");
      if (rl.ok === false) {
        return NextResponse.json(
          { error: rl.message, retryAfterSec: rl.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const { text } = await generateAiVision(prompt, photoData);
      const parsed = parseJsonResponse(text);
      if (!parsed) {
        return NextResponse.json(
          { error: "Model did not return valid JSON for image analysis. Try another photo." },
          { status: 502 }
        );
      }
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("AI coach error:", error);
    return NextResponse.json({ error: formatAiError(error) }, { status: 500 });
  }
}
