import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const { rating, comment } = await request.json();
    const cleanComment = sanitizeHtml((comment || "").trim());

    if (!rating || rating < 1 || rating > 5) {
      return Response.json({ error: "Rating harus 1-5" }, { status: 400 });
    }

    const novel = await prisma.novel.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!novel) return Response.json({ error: "Novel tidak ditemukan" }, { status: 404 });

    const existing = await prisma.review.findUnique({
      where: { userId_novelId: { userId: user.id, novelId: id } },
    });
    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: cleanComment },
        select: {
          id: true, rating: true, comment: true, createdAt: true,
          user: { select: { id: true, username: true } },
        },
      });
      return Response.json(updated);
    }

    const review = await prisma.review.create({
      data: { userId: user.id, novelId: id, rating, comment: cleanComment },
      select: {
        id: true, rating: true, comment: true, createdAt: true,
        user: { select: { id: true, username: true } },
      },
    });
    return Response.json(review);
  } catch (e: any) {
    if (e.message === "Unauthorized") {
      return Response.json({ error: "Login diperlukan" }, { status: 401 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
