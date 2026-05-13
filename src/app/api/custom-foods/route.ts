import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });
  const foods = await prisma.customFood.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { name, calories, protein, carbs, fat, category } = await req.json();
  if (!name || calories == null || protein == null || carbs == null || fat == null) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }
  const food = await prisma.customFood.create({
    data: { userId: session.user.id, name, calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fat: Number(fat), category: category || "Personalizado" },
  });
  return NextResponse.json(food);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.customFood.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
