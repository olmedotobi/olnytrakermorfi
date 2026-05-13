import { NextRequest, NextResponse } from "next/server";
import { FOODS_DB } from "@/lib/foods-db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const lower = q.toLowerCase();
  const results = FOODS_DB.filter(f =>
    f.name.toLowerCase().includes(lower) || f.category.toLowerCase().includes(lower)
  ).slice(0, 40);
  return NextResponse.json(results);
}
