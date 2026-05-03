import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { exerciseName, reason, availableEquipment, constraints, sessionContext } = await req.json();

    const { dayFocus, completedExercises } = sessionContext || {};

    if (!process.env.GEMINI_API_KEY) {
      // Mock fallback if no API key
      return NextResponse.json({
        alternatives: [
          {
            name: "Mock Alternative 1",
            sets: 3,
            reps: "10-12",
            muscleTarget: "Same Muscle",
            whyThisWorks: "Since you lack equipment, this bodyweight option works the same area.",
            formCue: "Keep your core tight."
          },
          {
            name: "Mock Alternative 2",
            sets: 3,
            reps: "8-10",
            muscleTarget: "Same Muscle",
            whyThisWorks: "A joint-friendly variation.",
            formCue: "Move slowly on the eccentric."
          },
          {
            name: "Mock Alternative 3",
            sets: 3,
            reps: "15",
            muscleTarget: "Same Muscle",
            whyThisWorks: "Higher rep alternative to avoid joint stress.",
            formCue: "Focus on the squeeze."
          }
        ]
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        alternatives: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              sets: { type: SchemaType.INTEGER },
              reps: { type: SchemaType.STRING },
              muscleTarget: { type: SchemaType.STRING },
              whyThisWorks: { type: SchemaType.STRING, description: "one sentence explaining the substitution" },
              formCue: { type: SchemaType.STRING }
            },
            required: ["name", "sets", "reps", "muscleTarget", "whyThisWorks", "formCue"]
          }
        }
      },
      required: ["alternatives"]
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: schema }
    });

    const prompt = `You are a sports scientist. The user is mid-session and cannot do [${exerciseName}] because [${reason}].
Their session focus is [${dayFocus || "General Fitness"}]. They have already completed [${completedExercises?.join(", ") || "None"}].
Available equipment: [${availableEquipment?.join(", ") || "Bodyweight"}]. Constraints: [${constraints?.join(", ") || "None"}].

Suggest exactly 3 alternative exercises for the same primary muscle group.
The alternatives must: train the same primary muscle, respect all constraints, use only available equipment, and not repeat any exercise already done today.

Return JSON only matching the schema.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text();
    rawText = rawText.replace(/```json\n?|```/g, '').trim();
    
    const parsedData = JSON.parse(rawText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("EXERCISE SWAP API ERROR:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
