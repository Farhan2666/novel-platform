import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get("novelId");
    if (!novelId) return Response.json({ bookmarked: false });

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_novelId: { userId: user.id, novelId } },
    });
    return Response.json({ bookmarked: !!bookmark });
  } catch {
    return Response.json({ bookmarked: false });
  }
}
