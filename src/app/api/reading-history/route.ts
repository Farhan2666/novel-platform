import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { novelId, chapterId, scrollPosition, pageIndex } = await request.json();

    if (!novelId || !chapterId) {
      return Response.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const history = await prisma.readingHistory.upsert({
      where: { userId_novelId: { userId: user.id, novelId } },
      update: { chapterId, scrollPosition: scrollPosition || 0, pageIndex: pageIndex || 0 },
      create: { userId: user.id, novelId, chapterId, scrollPosition: scrollPosition || 0, pageIndex: pageIndex || 0 },
    });

    return Response.json(history);
  } catch (e: any) {
    if (e.message === "Unauthorized") {
      return Response.json({ error: "Login diperlukan" }, { status: 401 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get("novelId");

    if (novelId) {
      const history = await prisma.readingHistory.findUnique({
        where: { userId_novelId: { userId: user.id, novelId } },
        include: { chapter: { select: { id: true, chapterNumber: true, title: true } } },
      });
      return Response.json(history);
    }

    const histories = await prisma.readingHistory.findMany({
      where: { userId: user.id },
      include: {
        novel: { select: { id: true, title: true, coverUrl: true } },
        chapter: { select: { id: true, chapterNumber: true, title: true } },
      },
      orderBy: { chapter: { chapterNumber: "desc" } },
      take: 20,
    });
    return Response.json(histories);
  } catch (e: any) {
    if (e.message === "Unauthorized") {
      return Response.json({ error: "Login diperlukan" }, { status: 401 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
