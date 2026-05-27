import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { rateLimit, sanitizeHtml } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`register:${ip}`, 3, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: `Terlalu banyak percobaan. Coba lagi ${rl.retryAfter} detik lagi.` }, { status: 429 });
    }

    const { username, email, password } = await request.json();
    const cleanUsername = sanitizeHtml(username?.trim() || "");
    const cleanEmail = sanitizeHtml(email?.trim().toLowerCase() || "");

    if (!cleanUsername || !cleanEmail || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { username: cleanUsername }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Email atau username sudah terdaftar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username: cleanUsername, email: cleanEmail, password: hashed, role: "reader" },
      select: { id: true, username: true, email: true, role: true, avatarUrl: true },
    });

    const token = await createToken(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
