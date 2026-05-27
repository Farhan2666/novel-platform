import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) return Response.json({ error: "Token diperlukan" }, { status: 400 });

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });
    if (!verification) return Response.json({ error: "Token tidak valid" }, { status: 400 });
    if (verification.used) return Response.json({ error: "Token sudah digunakan" }, { status: 400 });
    if (verification.expiresAt < new Date()) return Response.json({ error: "Token kadaluarsa" }, { status: 400 });

    await prisma.$transaction([
      prisma.user.update({ where: { id: verification.userId }, data: { emailVerified: true } }),
      prisma.emailVerification.update({ where: { id: verification.id }, data: { used: true } }),
    ]);

    return Response.json({ success: true, message: "Email berhasil diverifikasi!" });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
