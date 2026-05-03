import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Allow Vercel to wait up to 60 seconds for the AI

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user with Clerk
    const user = await currentUser();
    
    // For local testing without full auth, we can bypass strictly throwing
    // But in production, we MUST return 401 Unauthorized if no clerkId
    let dbUser = null;
    if (user) {
      dbUser = await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {},
        create: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || `${user.id}@clerk.local`
        }
      });
    }

    const { 
      goals, priorityNotes, age, weight, posture, postureNotes,
      pushups, pullups, equipment, equipmentNotes, injuries, daysPerWeek, 
      workoutDuration, lifestyle, motivationOptions, motivation 
    } = await req.json();

    let planData: any = null;

    // 2. Generate the Plan (Mock or Real)
    if (!process.env.GEMINI_API_KEY) {
      console.log("No Gemini key found. Using Mock Data.");
      planData = {
        planName: "Mock Foundation Plan",
        focus: goals.join(", ") || "General Fitness",
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
          sessions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                day: { type: SchemaType.STRING, description: "e.g. Monday" },
                name: { type: SchemaType.STRING, description: "e.g. Upper Body" },
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
              required: ["day", "name", "exercises"]
            }
          }
        },
        required: ["planName", "focus", "sessions"]
      };

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json", responseSchema: schema }
      });

      const prompt = `You are an elite, world-class athletic coach and physical therapist. 
You are designing a strictly formatted JSON workout plan for a user based on their holistic assessment.

USER PROFILE:
- Age: ${age}, Weight: ${weight}
- Goals: ${goals.join(", ")}
- Priority/Notes: ${priorityNotes || "None provided"}
- Posture Issues: ${posture.join(", ") || "None"}
- Additional Posture Notes: ${postureNotes || "None"}
- Injuries/Limitations: ${injuries || "None"}

CAPABILITIES (Judge their level based on this):
- Max Push-ups: ${pushups}
- Max Pull-ups: ${pullups}

EQUIPMENT ARSENAL:
- Selected: ${equipment.join(", ")}
- Additional Equipment Notes: ${equipmentNotes || "None"}

LOGISTICS & REALITY:
- Can train: ${daysPerWeek}
- Session Length: ${workoutDuration}
- Lifestyle & Energy: ${lifestyle}
- Core Motivators: ${motivationOptions.join(", ")}
- Deep Motivation (Custom): ${motivation}

INSTRUCTIONS:
1. Generate a structured 1-week plan that perfectly fits the ${daysPerWeek} limit.
2. If they have posture issues, include corrective exercises as part of the warm-up or main workout.
3. If they have low energy/high stress, do not prescribe 6-day intense splits. Focus on recovery.
4. Add specific 'Coach Notes' reminding them of their deep motivation.
5. Provide realistic Sets and Reps based on their equipment and their actual max pushups/pullups.

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
    if (dbUser && planData && planData.sessions) {
      console.log("Saving generated plan to database for user:", dbUser.id);
      
      // We use a Prisma Nested Write to save the Plan -> Sessions -> Exercises -> Sets all at once!
      await prisma.workoutPlan.create({
        data: {
          userId: dbUser.id,
          title: planData.planName || "Custom Protocol",
          focus: planData.focus || "General Fitness",
          startDate: new Date(),
          sessions: {
            create: planData.sessions.map((session: any, i: number) => ({
              userId: dbUser.id,
              name: session.name || `Day ${i + 1}`,
              scheduledFor: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // schedule 1 day apart
              exercises: {
                create: (session.exercises || []).map((ex: any, j: number) => {
                  const safeRepsString = ex.reps ? String(ex.reps) : "10";
                  return {
                    order: j,
                    notes: ex.notes || "",
                    // connectOrCreate ensures we build a global catalog of exercises
                    exercise: {
                      connectOrCreate: {
                        where: { name: ex.name || "Unknown Exercise" },
                        create: { name: ex.name || "Unknown Exercise", targetMuscle: "AI Generated" }
                      }
                    },
                    // Create the targets for the specific sets
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
