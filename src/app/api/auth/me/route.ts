import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return Response.json({ user: null });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return Response.json({ user: null });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, role: true, avatarUrl: true },
    });
    return Response.json({ user });
  } catch {
    return Response.json({ user: null });
  }
}
