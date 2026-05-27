import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { username, email, password, avatarUrl, role } = await request.json();

    if (role === "author" || role === "reader") {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role },
        select: { id: true, username: true, email: true, role: true, avatarUrl: true },
      });
      return Response.json(updated);
    }

    const data: any = {};
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== user.id) {
        return Response.json({ error: "Username sudah digunakan" }, { status: 409 });
      }
      data.username = username;
    }
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        return Response.json({ error: "Email sudah digunakan" }, { status: 409 });
      }
      data.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return Response.json({ error: "Password minimal 6 karakter" }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 10);
    }
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, username: true, email: true, role: true, avatarUrl: true },
    });
    return Response.json(updated);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return Response.json({ user: null });
    return Response.json(user);
  } catch {
    return Response.json({ user: null });
  }
}
