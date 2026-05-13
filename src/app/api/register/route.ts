import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Google OAuth user without password → set password so they can use mobile
    if (!existing.password) {
      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.update({ where: { email }, data: { password: hashed } });
      return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    }
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
