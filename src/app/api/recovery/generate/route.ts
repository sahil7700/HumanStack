import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { lastTrainedMuscleGroups, constraints, equipment, durationMinutes, primaryGoal } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // Mock fallback
      return NextResponse.json({
        sessionType: "mobility",
        title: "Full Body Release",
        durationMinutes: durationMinutes || 15,
        activities: [
          { name: "Cat-Cow", durationSeconds: 60, instruction: "Move slowly through spinal flexion and extension.", targetArea: "Spine", breathingCue: "Inhale arch, exhale round." },
          { name: "World's Greatest Stretch", durationSeconds: 120, instruction: "Spend 60 seconds per side, opening the hips.", targetArea: "Hips & Thoracic", breathingCue: "Exhale deep into the stretch." }
        ],
        whyThisHelps: "Promotes blood flow and reduces stiffness after heavy training."
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        sessionType: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        durationMinutes: { type: SchemaType.INTEGER },
        activities: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              durationSeconds: { type: SchemaType.INTEGER },
              instruction: { type: SchemaType.STRING },
              targetArea: { type: SchemaType.STRING },
              breathingCue: { type: SchemaType.STRING }
            },
            required: ["name", "durationSeconds", "instruction", "targetArea"]
          }
        },
        whyThisHelps: { type: SchemaType.STRING }
      },
      required: ["sessionType", "title", "durationMinutes", "activities", "whyThisHelps"]
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: schema }
    });

    const prompt = `You are a recovery specialist and sports physiotherapist. Generate an active recovery session for a rest day. 
These sessions should improve mobility, reduce soreness, and keep the user engaged without adding muscular stress.
User context:
- Trained their [${lastTrainedMuscleGroups?.join(", ") || "full body"}] in the last 48 hours
- Has these constraints: [${constraints?.join(", ") || "None"}]
- Available equipment: [${equipment?.join(", ") || "Bodyweight"}]
- Session should last: [${durationMinutes || 15}] minutes
- Current focus area of their plan: [${primaryGoal || "General Fitness"}]

Return JSON only matching the exact schema.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text();
    rawText = rawText.replace(/```json\n?|```/g, '').trim();
    
    const parsedData = JSON.parse(rawText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("RECOVERY API ERROR:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
