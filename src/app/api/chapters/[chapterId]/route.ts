import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getAuthUser } from "@/lib/auth";

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
        novel: { select: { id: true, title: true, authorId: true } },
      },
    });

    if (!chapter) {
      return Response.json({ error: "Bab tidak ditemukan" }, { status: 404 });
    }

    // Block premium content: only return content if free, user is author, or user has purchased
    if (chapter.accessType === "premium") {
      const user = await getAuthUser();
      const isAuthor = user && chapter.novel.authorId === user.id;
      const isAdmin = user?.role === "admin";

      let hasPurchased = false;
      if (user && !isAuthor && !isAdmin) {
        const purchase = await prisma.chapterPurchase.findUnique({
          where: { userId_chapterId: { userId: user.id, chapterId } },
        });
        hasPurchased = !!purchase;
      }

      if (!isAuthor && !isAdmin && !hasPurchased) {
        // Return chapter without content for unpurchased premium chapters
        return Response.json({
          id: chapter.id,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          content: "",
          accessType: chapter.accessType,
          coinPrice: chapter.coinPrice,
          underReview: chapter.underReview,
          createdAt: chapter.createdAt,
          novel: { id: chapter.novel.id, title: chapter.novel.title },
          locked: true,
          message: "Bab ini berbayar. Silakan beli untuk membuka konten.",
        });
      }
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
