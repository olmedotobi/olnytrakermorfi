import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const entries = await prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const { date, weight } = await req.json();

  const entry = await prisma.weightEntry.upsert({
    where: {
      userId_date: { userId: session.user.id, date },
    },
    update: { weight },
    create: { userId: session.user.id, date, weight },
  });
  return NextResponse.json(entry);
}
