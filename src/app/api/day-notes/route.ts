import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const note = await prisma.dayNote.findUnique({ where: { userId_date: { userId, date } } });
  return NextResponse.json({ note: note?.note ?? "" });
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, note } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  if (!note || !note.trim()) {
    await prisma.dayNote.deleteMany({ where: { userId, date } });
    return NextResponse.json({ note: "" });
  }
  const saved = await prisma.dayNote.upsert({
    where: { userId_date: { userId, date } },
    update: { note: note.trim() },
    create: { userId, date, note: note.trim() },
  });
  return NextResponse.json({ note: saved.note });
}
