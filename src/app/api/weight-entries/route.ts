import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json([], { status: 401 });

  const entries = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { date, weight } = await req.json();
  const entry = await prisma.weightEntry.upsert({
    where: { userId_date: { userId, date } },
    update: { weight },
    create: { userId, date, weight },
  });
  return NextResponse.json(entry);
}
