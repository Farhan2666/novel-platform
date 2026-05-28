import { NextRequest, NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/supabase";

const BUCKET = "covers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } },
) {
  const url = getPublicUrl(BUCKET, params.filename);

  const response = await fetch(url);
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
