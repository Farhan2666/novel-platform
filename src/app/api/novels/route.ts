import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const genre = searchParams.get("genre") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.title = { contains: search };
    if (status) where.status = status;
    if (category) where.category = { slug: category };
    if (genre) where.genres = { some: { genre: { slug: genre } } };

    const [novels, total] = await Promise.all([
      prisma.novel.findMany({
        where,
        select: {
          id: true, title: true, description: true, coverUrl: true,
          status: true, underReview: true, createdAt: true,
          author: { select: { username: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { chapters: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.novel.count({ where }),
    ]);

    return Response.json({ novels, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
