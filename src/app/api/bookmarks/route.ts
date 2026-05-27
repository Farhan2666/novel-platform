import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: {
        id: true, createdAt: true,
        novel: {
          select: {
            id: true, title: true, coverUrl: true, status: true,
            author: { select: { username: true } },
            _count: { select: { chapters: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(bookmarks);
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { novelId } = await request.json();
    if (!novelId) return Response.json({ error: "Novel ID diperlukan" }, { status: 400 });

    const existing = await prisma.bookmark.findUnique({
      where: { userId_novelId: { userId: user.id, novelId } },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return Response.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: { userId: user.id, novelId },
    });
    return Response.json({ bookmarked: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get("novelId");
    if (!novelId) return Response.json({ error: "Novel ID diperlukan" }, { status: 400 });

    await prisma.bookmark.deleteMany({
      where: { userId: user.id, novelId },
    });
    return Response.json({ bookmarked: false });
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
