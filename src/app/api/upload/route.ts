import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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

    const { error } = await supabase.storage
      .from("covers")
      .upload(filename, buffer, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from("covers")
      .getPublicUrl(filename);

    return Response.json({ url: publicUrl.publicUrl });
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
