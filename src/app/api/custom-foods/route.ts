import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json([], { status: 401 });
  const foods = await prisma.customFood.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { name, calories, protein, carbs, fat, category } = await req.json();
  if (!name || calories == null || protein == null || carbs == null || fat == null) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }
  const food = await prisma.customFood.create({
    data: { userId, name, calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fat: Number(fat), category: category || "Personalizado" },
  });
  return NextResponse.json(food);
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuth(req);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.customFood.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
