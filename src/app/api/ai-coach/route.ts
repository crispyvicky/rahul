import { NextResponse } from "next/server";
import { consumeAiRateLimit, getAiClientIp } from "@/lib/ai-rate-limit";
import {
  formatAiError,
  generateAiText,
  generateAiVision,
} from "@/lib/ai-provider";

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
      const instructions = clampCustomInstructions(userData!.customInstructions);

      const locationPrompt =
        userData!.workoutLocation === "home"
          ? "They are working out at HOME with minimal equipment (bodyweight, dumbbells, bands)."
          : "They are working out at a FULL GYM with machines, barbells, and cables.";

      const customRequest = instructions
        ? `\nCRITICAL SPECIAL INSTRUCTIONS FROM USER: "${instructions}". YOU MUST ADAPT THE WORKOUT TO ACCOUNT FOR THIS EXACT REQUEST.`
        : "";

      const prompt = `You are an elite, charismatic, and slightly flirty fitness coach. Use simple, easy-to-understand English.
      The user is a ${userData!.age} year old ${userData!.gender}, weighs ${userData!.weight}kg, and is ${userData!.height}cm tall.
      Their primary goal is: ${userData!.goal}. Their current fitness level is: ${userData!.fitnessLevel}.
      They can workout ${userData!.workoutDays} days a week.
      ${locationPrompt}${customRequest}

      Generate a highly personalized ${userData!.workoutDays}-day workout split for them.
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
      return NextResponse.json(parsed);
    }

    if (type === "diet") {
      const instructions = clampCustomInstructions(userData!.customInstructions);

      const customRequest = instructions
        ? `\nCRITICAL SPECIAL INSTRUCTIONS FROM USER: "${instructions}". YOU MUST ADAPT THE DIET TO ACCOUNT FOR THIS EXACT REQUEST.`
        : "";

      const prompt = `You are a charismatic, slightly flirty sports nutritionist. Use simple, easy-to-understand English.
      The user is a ${userData!.age} year old ${userData!.gender}, weighs ${userData!.weight}kg, and is ${userData!.height}cm tall.
      Their goal is: ${userData!.goal}. Their current fitness level is: ${userData!.fitnessLevel}.${customRequest}

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
