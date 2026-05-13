import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json([], { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  const where = date ? { userId, date } : { userId };

  const entries = await prisma.foodEntry.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const data = await req.json();
  const entry = await prisma.foodEntry.create({
    data: { userId, ...data },
  });
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json(null, { status: 400 });

  await prisma.foodEntry.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
