import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`login:${ip}`, 5, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: `Terlalu banyak percobaan. Coba lagi ${rl.retryAfter} detik lagi.` }, { status: 429 });
    }

    const { identifier, password } = await request.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/username dan password wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { username: identifier },
        ],
      },
      select: { id: true, username: true, email: true, role: true, avatarUrl: true, password: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const token = await createToken(user.id);
    const response = NextResponse.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
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

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
