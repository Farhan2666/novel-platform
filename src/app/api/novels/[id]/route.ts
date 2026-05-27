import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const novel = await prisma.novel.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, coverUrl: true,
        fontFamily: true,
        status: true, underReview: true, categoryId: true,
        createdAt: true, updatedAt: true,
        author: { select: { id: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        genres: {
          select: { genre: { select: { id: true, name: true, slug: true } } },
        },
        tags: {
          select: { tag: { select: { id: true, name: true, slug: true } } },
        },
        chapters: {
          select: { id: true, chapterNumber: true, title: true, accessType: true, coinPrice: true, createdAt: true },
          orderBy: { chapterNumber: "asc" },
        },
        reviews: {
          select: {
            id: true, rating: true, comment: true, createdAt: true,
            user: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { chapters: true, reviews: true } },
      },
    });

    if (!novel) {
      return Response.json({ error: "Novel tidak ditemukan" }, { status: 404 });
    }

    const avgRating = novel.reviews.length
      ? Math.round((novel.reviews.reduce((s: number, r: any) => s + r.rating, 0) / novel.reviews.length) * 10) / 10
      : 0;

    return Response.json({ ...novel, avgRating });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const novel = await prisma.novel.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!novel) return Response.json({ error: "Novel tidak ditemukan" }, { status: 404 });
    if (user.role !== "admin" && novel.authorId !== user.id) {
      return Response.json({ error: "Bukan novel kamu" }, { status: 403 });
    }

    await prisma.novel.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    if (e.message === "Forbidden") return Response.json({ error: "Akses ditolak" }, { status: 403 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
