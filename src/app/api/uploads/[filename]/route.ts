import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } },
) {
  const { data } = supabase.storage
    .from("covers")
    .getPublicUrl(params.filename);

  const response = await fetch(data.publicUrl);
  if (!response.ok) return new NextResponse(null, { status: 404 });

  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = params.filename.split(".").pop()?.toLowerCase();
  const mime =
    ext === "png" ? "image/png" :
    ext === "gif" ? "image/gif" :
    ext === "webp" ? "image/webp" :
    "image/jpeg";

  return new NextResponse(buffer, {
    headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
