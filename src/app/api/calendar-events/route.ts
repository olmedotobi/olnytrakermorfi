import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json([], { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  const month = req.nextUrl.searchParams.get("month");

  if (date) {
    const events = await prisma.calendarEvent.findMany({
      where: { userId, date },
      orderBy: { time: "asc" },
    });
    return NextResponse.json(events);
  }

  if (month) {
    const events = await prisma.calendarEvent.findMany({
      where: { userId, date: { startsWith: month } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return NextResponse.json(events);
  }

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { date, time, title, description } = await req.json();
  if (!date || !title) return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });

  const event = await prisma.calendarEvent.create({
    data: { userId, date, time: time ?? "", title, description: description ?? "" },
  });
  return NextResponse.json(event);
}

export async function PUT(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { id, date, time, title, description } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const event = await prisma.calendarEvent.updateMany({
    where: { id, userId },
    data: { date, time: time ?? "", title, description: description ?? "" },
  });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.calendarEvent.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
