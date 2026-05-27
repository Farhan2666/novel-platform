import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`forgot:${ip}`, 3, 60000);
    if (!rl.allowed) {
      return Response.json({ error: `Terlalu banyak percobaan. Coba lagi ${rl.retryAfter} detik.` }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email) return Response.json({ error: "Email diperlukan" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return Response.json({ error: "Email tidak ditemukan" }, { status: 404 });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        type: "reset",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    console.log(`\n🔐 Password reset token for ${email}:`);
    console.log(`   ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/reset-password?token=${token}\n`);

    return Response.json({ success: true, message: "Link reset password telah dikirim ke email (cek console untuk development)." });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
