import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  // Verify token with Google and get user info
  const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!googleRes.ok) return NextResponse.json({ error: "Token de Google inválido" }, { status: 401 });

  const googleUser = await googleRes.json() as { id: string; email: string; name: string; picture?: string };

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: googleUser.email, name: googleUser.name ?? "Usuario", password: "" },
    });
  }

  // Sign our JWT
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}
