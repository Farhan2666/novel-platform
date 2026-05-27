import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { chapterId } = params;
    const comments = await prisma.chapterComment.findMany({
      where: { chapterId },
      select: {
        id: true, content: true, createdAt: true,
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return Response.json(comments);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const user = await requireAuth();
    const { chapterId } = params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return Response.json({ error: "Komentar tidak boleh kosong" }, { status: 400 });
    }

    const cleanContent = sanitizeHtml(content.trim());

    const comment = await prisma.chapterComment.create({
      data: {
        userId: user.id,
        chapterId,
        content: cleanContent,
      },
      select: {
        id: true, content: true, createdAt: true,
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
    return Response.json(comment);
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
