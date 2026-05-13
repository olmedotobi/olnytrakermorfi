import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json(null, { status: 401 });

  const data = await req.json();
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: { ...data },
    create: { userId, ...data },
  });
  return NextResponse.json(profile);
}
