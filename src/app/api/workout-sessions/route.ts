import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json(null, { status: 400 });

  const workout = await prisma.workoutSession.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });
  return NextResponse.json(workout);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const { date, notes, exercises } = await req.json();

  const workout = await prisma.workoutSession.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, notes: notes ?? "", exercises: exercises ?? [] },
    update: { notes: notes ?? "", exercises: exercises ?? [] },
  });
  return NextResponse.json(workout);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json(null, { status: 400 });

  await prisma.workoutSession.deleteMany({
    where: { userId: session.user.id, date },
  });
  return NextResponse.json({ ok: true });
}
