import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { novelId, chapterId, reason } = await request.json();

    if (!novelId || !reason) {
      return Response.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        userId: user.id,
        novelId,
        chapterId: chapterId || null,
        reason,
      },
    });

    const recentCount = await prisma.report.count({
      where: {
        novelId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentCount > 5) {
      await prisma.novel.update({
        where: { id: novelId },
        data: { underReview: true },
      });
    }

    return Response.json({ report, autoFlagged: recentCount > 5 });
  } catch (e: any) {
    if (e.message === "Unauthorized") {
      return Response.json({ error: "Login diperlukan" }, { status: 401 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
