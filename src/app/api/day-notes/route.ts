import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const note = await prisma.dayNote.findUnique({ where: { userId_date: { userId: session.user.id, date } } });
  return NextResponse.json({ note: note?.note ?? "" });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, note } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  if (!note || !note.trim()) {
    await prisma.dayNote.deleteMany({ where: { userId: session.user.id, date } });
    return NextResponse.json({ note: "" });
  }
  const saved = await prisma.dayNote.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { note: note.trim() },
    create: { userId: session.user.id, date, note: note.trim() },
  });
  return NextResponse.json({ note: saved.note });
}
