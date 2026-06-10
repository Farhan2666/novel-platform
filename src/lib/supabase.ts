const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function uploadToStorage(
  bucket: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return { usedFallback: true };
  }
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": contentType,
      },
      body: new Uint8Array(buffer),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase upload error:", err);
    return { usedFallback: true };
  }
  return { usedFallback: false };
}

export function getPublicUrl(bucket: string, filename: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
}
