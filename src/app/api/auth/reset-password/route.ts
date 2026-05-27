import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return Response.json({ error: "Token dan password diperlukan" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "Password minimal 6 karakter" }, { status: 400 });

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });
    if (!verification) return Response.json({ error: "Token tidak valid" }, { status: 400 });
    if (verification.used) return Response.json({ error: "Token sudah digunakan" }, { status: 400 });
    if (verification.expiresAt < new Date()) return Response.json({ error: "Token kadaluarsa" }, { status: 400 });
    if (verification.type !== "reset") return Response.json({ error: "Token tidak valid untuk reset password" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: verification.userId }, data: { password: hashed } }),
      prisma.emailVerification.update({ where: { id: verification.id }, data: { used: true } }),
    ]);

    return Response.json({ success: true, message: "Password berhasil direset!" });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
