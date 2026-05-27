import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { chapterId } = params;
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true, chapterNumber: true, title: true, content: true,
        accessType: true, coinPrice: true, underReview: true, createdAt: true,
        novel: { select: { id: true, title: true } },
      },
    });

    if (!chapter) {
      return Response.json({ error: "Bab tidak ditemukan" }, { status: 404 });
    }

    return Response.json(chapter);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const user = await requireAuth();
    const { chapterId } = params;
    const { title, content } = await request.json();

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { novel: { select: { authorId: true } } },
    });
    if (!chapter) return Response.json({ error: "Bab tidak ditemukan" }, { status: 404 });
    if (chapter.novel.authorId !== user.id) {
      return Response.json({ error: "Hanya penulis yang bisa mengedit bab" }, { status: 403 });
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });
    return Response.json(updated);
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    if (e.message === "Forbidden") return Response.json({ error: "Akses ditolak" }, { status: 403 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const user = await requireAuth();
    const { chapterId } = params;

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { novel: { select: { authorId: true } } },
    });
    if (!chapter) return Response.json({ error: "Bab tidak ditemukan" }, { status: 404 });
    if (chapter.novel.authorId !== user.id) {
      return Response.json({ error: "Hanya penulis yang bisa menghapus bab" }, { status: 403 });
    }

    await prisma.chapter.delete({ where: { id: chapterId } });
    return Response.json({ success: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    if (e.message === "Forbidden") return Response.json({ error: "Akses ditolak" }, { status: 403 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
