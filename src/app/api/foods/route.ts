import { NextRequest, NextResponse } from "next/server";
import { FOODS_DB } from "@/lib/foods-db";

export async function GET(req: NextRequest) {
  const q        = req.nextUrl.searchParams.get("q") ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const featured = req.nextUrl.searchParams.get("featured") === "1";

  if (q.length >= 2) {
    const lower = q.toLowerCase();
    return NextResponse.json(
      FOODS_DB.filter(f =>
        f.name.toLowerCase().includes(lower) || f.category.toLowerCase().includes(lower)
      ).slice(0, 40)
    );
  }

  if (category) {
    return NextResponse.json(FOODS_DB.filter(f => f.category === category).slice(0, 60));
  }

  if (featured) {
    return NextResponse.json(FOODS_DB.slice(0, 30));
  }

  return NextResponse.json([]);
}
