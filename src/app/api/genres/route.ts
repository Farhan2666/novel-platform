import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });
    return Response.json(genres);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return Response.json({ error: "Nama genre wajib diisi" }, { status: 400 });
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const genre = await prisma.genre.create({ data: { name, slug } });
    return Response.json(genre);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
