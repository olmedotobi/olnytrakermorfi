import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate previous mobile codes for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: session.user.id, token: { startsWith: "MOBILE-" }, used: false },
    data: { used: true },
  });

  await prisma.passwordResetToken.create({
    data: { userId: session.user.id, token: `MOBILE-${code}`, expiresAt },
  });

  return NextResponse.json({ code });
}
