import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Allow Vercel to wait up to 60 seconds for the AI

export async function POST(req: Request) {
  try {
    const { 
      goal, timeframe, experience, equipment, daysPerWeek, 
      timePreference, constraints, userProfile, userId 
    } = await req.json();

    let dbUser = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({ where: { id: userId } });
    }

    let planData: any = null;

    // 2. Generate the Plan (Mock or Real)
    if (process.env.GROQ_API_KEY) {
      console.log("Calling Free Groq API (Llama 3.3)...");
      const { OpenAI } = require("openai");
      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const prompt = `You are an elite, world-class athletic coach and physical therapist. 
You are designing a strictly formatted JSON workout plan for a user based on their holistic assessment.

USER PROFILE:
- Goal: ${goal}
- Timeframe: ${timeframe}
- Training Experience: ${experience}
- Constraints / Areas to avoid: ${constraints.join(", ")}

CALIBRATION RESULTS (Provided by AI System):
- Strength Tier: ${userProfile.strengthTier}
- Mobility Tier: ${userProfile.mobilityTier}
- Stability Tier: ${userProfile.stabilityTier}
- Avoid Exercises: ${userProfile.exercisesToAvoid.join(", ")}
- Starting Loads: ${JSON.stringify(userProfile.startingLoads)}

EQUIPMENT ARSENAL:
- Selected: ${equipment.join(", ")}

LOGISTICS & REALITY:
- Can train: ${daysPerWeek} days per week
- Time Preference: ${timePreference}

INSTRUCTIONS:
1. Generate a structured 1-week plan that perfectly fits the ${daysPerWeek} limit.
2. If they have constraints, include corrective exercises as part of the warm-up or main workout and avoid restricted exercises.
3. Incorporate their starting loads correctly.
4. Add specific 'Coach Notes' reminding them of their progression.
5. Provide realistic Sets and Reps based on their equipment and their actual tier.

OUTPUT STRICTLY VALID JSON MATCHING THIS EXACT SCHEMA AND NOTHING ELSE (DO NOT WRAP IN MARKDOWN):
{
  "planName": "string",
  "focus": "string",
  "sessions": [
    {
      "day": "Day 1",
      "name": "Upper Body",
      "exercises": [
        { "name": "Pushups", "sets": 3, "reps": "10", "notes": "Keep core tight" }
      ]
    }
  ]
}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const rawText = response.choices[0].message.content;
      planData = JSON.parse(rawText);

    } else if (!process.env.GEMINI_API_KEY) {
      console.log("No Gemini key found. Using Mock Data.");
      planData = {
        planName: "Mock Foundation Plan",
        focus: goal || "General Fitness",
        sessions: [
          {
            day: "Day 1",
            name: "Full Body Foundation",
            exercises: [
              { name: "Goblet Squat", sets: 3, reps: "10-12", notes: "Focus on depth" },
              { name: "Push-ups", sets: 3, reps: "To failure", notes: "Keep core tight" }
            ]
          }
        ]
      };
    } else {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const schema: ResponseSchema = {
        type: SchemaType.OBJECT,
        properties: {
          planName: { type: SchemaType.STRING },
          focus: { type: SchemaType.STRING },
          durationWeeks: { type: SchemaType.INTEGER },
          weeks: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                weekNumber: { type: SchemaType.INTEGER },
                days: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      dayNumber: { type: SchemaType.INTEGER, description: "1 to 7" },
                      isRestDay: { type: SchemaType.BOOLEAN },
                      focus: { type: SchemaType.STRING, description: "e.g. Upper Body or Recovery" },
                      estimatedDurationMinutes: { type: SchemaType.INTEGER },
                      exercises: {
                        type: SchemaType.ARRAY,
                        items: {
                          type: SchemaType.OBJECT,
                          properties: {
                            name: { type: SchemaType.STRING },
                            sets: { type: SchemaType.INTEGER },
                            reps: { type: SchemaType.STRING },
                            notes: { type: SchemaType.STRING }
                          },
                          required: ["name", "sets", "reps", "notes"]
                        }
                      }
                    },
                    required: ["dayNumber", "isRestDay", "exercises"]
                  }
                }
              },
              required: ["weekNumber", "days"]
            }
          }
        },
        required: ["planName", "focus", "durationWeeks", "weeks"]
      };

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json", responseSchema: schema }
      });

      const prompt = `You are an elite, world-class athletic coach and physical therapist. 
You are designing a strictly formatted JSON workout plan for a user based on their holistic assessment.

USER PROFILE:
- Goal: ${goal}
- Timeframe: ${timeframe}
- Training Experience: ${experience}
- Constraints / Areas to avoid: ${constraints.join(", ")}

CALIBRATION RESULTS (Provided by AI System):
- Strength Tier: ${userProfile.strengthTier}
- Mobility Tier: ${userProfile.mobilityTier}
- Stability Tier: ${userProfile.stabilityTier}
- Avoid Exercises: ${userProfile.exercisesToAvoid.join(", ")}
- Starting Loads: ${JSON.stringify(userProfile.startingLoads)}

EQUIPMENT ARSENAL:
- Selected: ${equipment.join(", ")}

LOGISTICS & REALITY:
- Can train: ${daysPerWeek} days per week
- Time Preference: ${timePreference}

INSTRUCTIONS:
1. Generate a structured 4-week roadmap that perfectly fits the ${daysPerWeek} limit.
2. For each week, provide exactly 7 days (dayNumber 1 to 7). If they shouldn't train on a day, set isRestDay to true and provide an empty exercises array.
3. If they have constraints, include corrective exercises and avoid restricted exercises.
4. Incorporate their starting loads correctly. Provide realistic Sets and Reps based on their equipment and their actual tier.
5. Create a progressive overload scheme across the 4 weeks (e.g., Week 4 is a deload or checkpoint).

Respond strictly in JSON matching the schema.`;

      // Call Cloud Gemini API
      console.log("Calling Gemini API...");
      const result = await model.generateContent(prompt);
      let rawText = result.response.text();
      // Sometimes the model still wraps in markdown despite the mimeType
      rawText = rawText.replace(/```json\n?|```/g, '').trim();
      planData = JSON.parse(rawText);
    }

    // 3. Save to Database (If user is authenticated)
    if (dbUser && planData && planData.weeks) {
      console.log("Saving generated plan to database for user:", dbUser.id);
      
      const allSessions = planData.weeks.flatMap((w: any) => w.days.filter((d:any) => !d.isRestDay).map((d: any) => {
          return {
              name: d.focus || `Day ${d.dayNumber}`,
              exercises: d.exercises || []
          };
      }));

      await prisma.workoutPlan.create({
        data: {
          userId: dbUser.id,
          title: planData.planName || "Custom Protocol",
          focus: planData.focus || "General Fitness",
          startDate: new Date(),
          roadmapData: planData,
          sessions: {
            create: allSessions.map((session: any, i: number) => ({
              userId: dbUser.id,
              name: session.name,
              scheduledFor: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
              exercises: {
                create: (session.exercises || []).map((ex: any, j: number) => {
                  const safeRepsString = ex.reps ? String(ex.reps) : "10";
                  return {
                    order: j,
                    notes: ex.notes || "",
                    exercise: {
                      connectOrCreate: {
                        where: { name: ex.name || "Unknown Exercise" },
                        create: { name: ex.name || "Unknown Exercise", targetMuscle: "AI Generated" }
                      }
                    },
                    sets: {
                      create: Array.from({ length: Number(ex.sets) || 3 }).map((_, setIdx) => ({
                        setNumber: setIdx + 1,
                        targetReps: parseInt(safeRepsString.split("-")[0]) || 10,
                      }))
                    }
                  };
                })
              }
            }))
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: planData,
      savedToDb: !!dbUser
    });

  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
