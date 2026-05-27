import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { chapterId: id } = params;
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: {
        id: true, chapterNumber: true, title: true, content: true,
        accessType: true, coinPrice: true, underReview: true, createdAt: true,
        novel: {
          select: {
            id: true, title: true, underReview: true, fontFamily: true,
            chapters: {
              select: { id: true, chapterNumber: true, title: true },
              orderBy: { chapterNumber: "asc" },
            },
          },
        },
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
