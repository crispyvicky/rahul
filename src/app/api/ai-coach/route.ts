import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { type, userData, photoData } = body;

    // Use gemini-pro for text tasks (more widely available on older/standard keys)
    const modelName = type === "physique" ? "gemini-pro-vision" : "gemini-pro";
    const model = genAI.getGenerativeModel({ model: modelName });

    if (type === "workout") {
      const locationPrompt = userData.workoutLocation === "home" 
        ? "They are working out at HOME with minimal equipment (bodyweight, dumbbells, bands)."
        : "They are working out at a FULL GYM with machines, barbells, and cables.";

      const prompt = `You are an elite, no-nonsense fitness coach like David Goggins or Chris Bumstead.
      The user is ${userData.age} years old, weighs ${userData.weight}kg, and is ${userData.height}cm tall.
      Their primary goal is: ${userData.goal}. Their current fitness level is: ${userData.fitnessLevel}.
      They can workout ${userData.workoutDays} days a week.
      ${locationPrompt}

      Generate a highly personalized ${userData.workoutDays}-day workout split for them.
      Return the response in JSON format. The response must EXACTLY match this structure (no markdown tags, just the raw JSON object):
      {
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up potential markdown formatting from Gemini response
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      return NextResponse.json(JSON.parse(text));
    } 
    
    else if (type === "diet") {
      const prompt = `You are an elite sports nutritionist.
      The user is ${userData.age} years old, weighs ${userData.weight}kg, and is ${userData.height}cm tall.
      Their goal is: ${userData.goal}. Their current fitness level is: ${userData.fitnessLevel}.

      Generate a highly personalized daily meal plan for them.
      Return the response in JSON format. The response must EXACTLY match this structure (no markdown tags, just the raw JSON object):
      {
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up potential markdown formatting
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      return NextResponse.json(JSON.parse(text));
    }
    
    else if (type === "physique" && photoData) {
      // Handle base64 image
      const base64Data = photoData.split(",")[1];
      const mimeType = photoData.split(";")[0].split(":")[1];

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType
        }
      };

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

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();
      
      // Clean up potential markdown formatting
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      return NextResponse.json(JSON.parse(text));
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
