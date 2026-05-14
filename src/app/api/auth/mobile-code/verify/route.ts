import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Código requerido" }, { status: 400 });

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: `MOBILE-${code}` },
    include: { user: true },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
  }

  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
  const token = await new SignJWT({ sub: record.user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({ token, user: { id: record.user.id, name: record.user.name, email: record.user.email } });
}
