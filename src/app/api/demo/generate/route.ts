import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { goal, timeframe, equipment } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // Mock fallback if no API key
      return NextResponse.json({
        sessionName: "Foundation Phase",
        focus: "Full Body Activation",
        durationMinutes: 45,
        exercises: [
          { name: "Goblet Squats", sets: 3, reps: "10-12", muscleTarget: "Quads & Glutes" },
          { name: "Push-ups", sets: 3, reps: "AMRAP", muscleTarget: "Chest & Shoulders" },
          { name: "Plank", sets: 3, reps: "45 seconds", muscleTarget: "Core" }
        ],
        coachNote: "Focus on controlling the eccentric (lowering) portion of every movement today."
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        sessionName: { type: SchemaType.STRING },
        focus: { type: SchemaType.STRING },
        durationMinutes: { type: SchemaType.INTEGER },
        exercises: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              sets: { type: SchemaType.INTEGER },
              reps: { type: SchemaType.STRING },
              muscleTarget: { type: SchemaType.STRING }
            },
            required: ["name", "sets", "reps", "muscleTarget"]
          }
        },
        coachNote: { type: SchemaType.STRING, description: "1 sentence, encouraging and specific" }
      },
      required: ["sessionName", "focus", "durationMinutes", "exercises", "coachNote"]
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: schema }
    });

    const prompt = `Generate a Day 1 workout preview for a new user. 
Goal: ${goal}. Timeframe: ${timeframe}. Equipment: ${equipment}.
Return JSON only matching the schema exactly, providing exactly 3 exercises.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text();
    rawText = rawText.replace(/```json\n?|```/g, '').trim();
    
    const parsedData = JSON.parse(rawText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("DEMO API ERROR:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
