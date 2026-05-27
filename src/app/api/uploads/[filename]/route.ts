import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } },
) {
  try {
    const filePath = path.join("/tmp", "uploads", params.filename);
    const buffer = await readFile(filePath);
    const ext = params.filename.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png" ? "image/png" :
      ext === "gif" ? "image/gif" :
      ext === "webp" ? "image/webp" :
      "image/jpeg";
    return new NextResponse(buffer, {
      headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
