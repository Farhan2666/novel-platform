import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("author", "admin");
    const { title, description, coverUrl, fontFamily, categoryId, genreIds, tagIds } = await request.json();

    if (!title || !description) {
      return Response.json({ error: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const novel = await prisma.novel.create({
      data: {
        authorId: user.id,
        title,
        description,
        coverUrl: coverUrl || "",
        fontFamily: fontFamily || "inter",
        ...(categoryId && { categoryId }),
        ...(genreIds?.length && {
          genres: {
            create: genreIds.map((genreId: string) => ({ genreId })),
          },
        }),
        ...(tagIds?.length && {
          tags: {
            create: tagIds.map((tagId: string) => ({ tagId })),
          },
        }),
      },
    });

    return Response.json(novel);
  } catch (e: any) {
    if (e.message === "Forbidden" || e.message === "Unauthorized") {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireRole("author", "admin");
    const novels = await prisma.novel.findMany({
      where: { authorId: user.id },
      select: {
        id: true, title: true, coverUrl: true, status: true, underReview: true,
        createdAt: true,
        _count: { select: { chapters: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(novels);
  } catch (e: any) {
    if (e.message === "Forbidden" || e.message === "Unauthorized") {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole("author", "admin");
    const { id, title, description, coverUrl, fontFamily, status, categoryId, genreIds, tagIds } = await request.json();

    const novel = await prisma.novel.findUnique({ where: { id }, select: { authorId: true } });
    if (!novel) return Response.json({ error: "Novel tidak ditemukan" }, { status: 404 });

    if (user.role !== "admin" && novel.authorId !== user.id) {
      return Response.json({ error: "Bukan novel kamu" }, { status: 403 });
    }

    const updateData: any = {
      ...(title && { title }),
      ...(description && { description }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(fontFamily && { fontFamily }),
      ...(status && { status }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
    };

    if (genreIds !== undefined) {
      await prisma.novelGenre.deleteMany({ where: { novelId: id } });
      if (genreIds.length > 0) {
        await prisma.novelGenre.createMany({
          data: genreIds.map((genreId: string) => ({ novelId: id, genreId })),
        });
      }
    }

    if (tagIds !== undefined) {
      await prisma.novelTag.deleteMany({ where: { novelId: id } });
      if (tagIds.length > 0) {
        await prisma.novelTag.createMany({
          data: tagIds.map((tagId: string) => ({ novelId: id, tagId })),
        });
      }
    }

    const updated = await prisma.novel.update({
      where: { id },
      data: updateData,
    });
    return Response.json(updated);
  } catch (e: any) {
    if (e.message === "Forbidden" || e.message === "Unauthorized") {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
