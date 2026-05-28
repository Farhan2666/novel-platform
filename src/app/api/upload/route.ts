import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";
import { uploadToStorage, getPublicUrl } from "@/lib/supabase";

const BUCKET = "covers";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "File diperlukan" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return Response.json({ error: "Format file harus JPG/PNG/GIF/WebP" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "File maksimal 2MB" }, { status: 400 });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = `image/${ext === "jpg" ? "jpeg" : ext}`;

    let url: string;

    const result = await uploadToStorage(BUCKET, filename, buffer, mime);

    if (result.usedFallback) {
      const uploadDir = path.join("/tmp", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      const requestUrl = new URL(request.url);
      url = `${requestUrl.origin}/api/uploads/${filename}`;
    } else {
      url = getPublicUrl(BUCKET, filename);
    }

    return Response.json({ url });
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
