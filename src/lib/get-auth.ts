import { auth } from "@/auth";
import { type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function getAuth(req: NextRequest): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
    const { payload } = await jwtVerify(authHeader.slice(7), secret);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
