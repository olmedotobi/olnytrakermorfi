import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json(null, { status: 400 });

  const entry = await prisma.stepEntry.findUnique({
    where: { userId_date: { userId, date } },
  });
  return NextResponse.json(entry);
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { date, steps } = await req.json();
  const entry = await prisma.stepEntry.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, steps: steps ?? 0 },
    update: { steps: steps ?? 0 },
  });
  return NextResponse.json(entry);
}
