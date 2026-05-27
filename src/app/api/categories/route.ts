import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { novels: true } } },
    });
    return Response.json(categories);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return Response.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const category = await prisma.category.create({ data: { name, slug } });
    return Response.json(category);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
