import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("admin");

    const [users, novels, chapters, reports] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, username: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.novel.findMany({
        select: {
          id: true, title: true, coverUrl: true, status: true, underReview: true,
          author: { select: { username: true } },
          _count: { select: { chapters: true, reviews: true, reports: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.chapter.findMany({
        where: { underReview: true },
        select: {
          id: true, chapterNumber: true, title: true,
          novel: { select: { id: true, title: true } },
        },
      }),
      prisma.report.findMany({
        select: {
          id: true, reason: true, createdAt: true,
          user: { select: { username: true } },
          novel: { select: { id: true, title: true } },
          chapter: { select: { id: true, chapterNumber: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return Response.json({ users, novels, flaggedChapters: chapters, reports });
  } catch (e: any) {
    if (e.message === "Forbidden" || e.message === "Unauthorized") {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole("admin");
    const { type, id, action } = await request.json();

    if (type === "novel") {
      if (action === "clear_flag") {
        await prisma.novel.update({ where: { id }, data: { underReview: false } });
        return Response.json({ success: true });
      }
      if (action === "delete") {
        await prisma.novel.delete({ where: { id } });
        return Response.json({ success: true });
      }
    }

    if (type === "chapter") {
      if (action === "clear_flag") {
        await prisma.chapter.update({ where: { id }, data: { underReview: false } });
        return Response.json({ success: true });
      }
    }

    if (type === "user") {
      if (action === "set_role") {
        const { role } = await request.json();
        await prisma.user.update({ where: { id }, data: { role } });
        return Response.json({ success: true });
      }
      if (action === "delete") {
        await prisma.user.delete({ where: { id } });
        return Response.json({ success: true });
      }
    }

    if (type === "genre") {
      if (action === "delete") {
        await prisma.genre.delete({ where: { id } });
        return Response.json({ success: true });
      }
    }

    if (type === "tag") {
      if (action === "delete") {
        await prisma.tag.delete({ where: { id } });
        return Response.json({ success: true });
      }
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    if (e.message === "Forbidden" || e.message === "Unauthorized") {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
