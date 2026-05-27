import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sanitizeRichText, sanitizeHtml } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const { title, content } = await request.json();

    if (!title || !content) {
      return Response.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const cleanTitle = sanitizeHtml(title.trim());
    const cleanContent = sanitizeRichText(content);

    const novel = await prisma.novel.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!novel) return Response.json({ error: "Novel tidak ditemukan" }, { status: 404 });
    if (novel.authorId !== user.id) {
      return Response.json({ error: "Hanya penulis yang bisa menambah bab" }, { status: 403 });
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: { novelId: id },
      orderBy: { chapterNumber: "desc" },
      select: { chapterNumber: true },
    });

    const chapter = await prisma.chapter.create({
      data: {
        novelId: id,
        chapterNumber: (lastChapter?.chapterNumber || 0) + 1,
        title: cleanTitle,
        content: cleanContent,
        accessType: "free",
        coinPrice: 0,
      },
    });

    return Response.json(chapter);
  } catch (e: any) {
    if (e.message === "Unauthorized") {
      return Response.json({ error: "Login diperlukan" }, { status: 401 });
    }
    if (e.message === "Forbidden") {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    return Response.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const chapters = await prisma.chapter.findMany({
      where: { novelId: id },
      select: {
        id: true, chapterNumber: true, title: true, accessType: true,
        coinPrice: true, underReview: true, createdAt: true,
      },
      orderBy: { chapterNumber: "asc" },
    });
    return Response.json(chapters);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
