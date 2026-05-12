import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
  if (!month) return NextResponse.json({});

  const entries = await prisma.foodEntry.findMany({
    where: {
      userId: session.user.id,
      date: { startsWith: month },
    },
  });

  const byDay: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
  for (const e of entries) {
    if (!byDay[e.date]) byDay[e.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    byDay[e.date].calories += e.calories;
    byDay[e.date].protein += e.protein;
    byDay[e.date].carbs += e.carbs;
    byDay[e.date].fat += e.fat;
  }

  return NextResponse.json(byDay);
}
