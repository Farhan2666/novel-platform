import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET() {
  if (!supabaseUrl || !serviceKey) {
    return Response.json({
      status: "ENV MISSING",
      supabaseUrl: supabaseUrl ? "SET" : "MISSING",
      serviceKey: serviceKey ? "SET" : "MISSING",
    });
  }

  const testBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );

  try {
    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/covers/test-from-vercel.png`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "image/png",
        },
        body: new Uint8Array(testBuffer),
      },
    );

    const text = await res.text();
    return Response.json({
      status: res.ok ? "SUPABASE OK" : "SUPABASE ERROR",
      httpStatus: res.status,
      response: text,
    });
  } catch (e: any) {
    return Response.json({
      status: "FETCH ERROR",
      error: e.message,
    });
  }
}
