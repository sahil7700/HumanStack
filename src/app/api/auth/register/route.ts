import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, age, weight } = await req.json();
    let user = await prisma.user.findFirst({
      where: { name }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          age: parseInt(age) || null,
          weight: parseFloat(weight) || null,
        }
      });
    }

    const latestPlan = await prisma.workoutPlan.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      plan: latestPlan?.roadmapData || null
    });
  } catch (error: any) {
    console.error("REGISTER API ERROR:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
