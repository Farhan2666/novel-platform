import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    return Response.json(tags);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return Response.json({ error: "Nama tag wajib diisi" }, { status: 400 });
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const tag = await prisma.tag.create({ data: { name, slug } });
    return Response.json(tag);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
