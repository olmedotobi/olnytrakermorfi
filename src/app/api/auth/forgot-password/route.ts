import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid user enumeration
  if (!user) return NextResponse.json({ ok: true });

  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Onlytracker Morfi <noreply@resend.dev>",
    to: email,
    subject: "Restablecer contraseña — Onlytracker Morfi",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#F9F6F1;border-radius:16px;">
        <p style="font-size:1.4rem;font-weight:800;margin:0 0 8px;color:#1C1917;">Onlytracker <em>Morfi</em></p>
        <p style="color:#9C9485;font-size:0.9rem;margin:0 0 28px;">tu tracker nutricional</p>
        <p style="color:#1C1917;margin:0 0 16px;">Hola <strong>${user.name}</strong>, recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1C1917;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;">
          Restablecer contraseña
        </a>
        <p style="color:#9C9485;font-size:0.82rem;margin-top:24px;">Este enlace expira en 1 hora. Si no pediste restablecer tu contraseña, podés ignorar este email.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
