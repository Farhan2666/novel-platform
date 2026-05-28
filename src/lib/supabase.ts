const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase env vars not configured");
}

export async function uploadToStorage(
  bucket: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
) {
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": contentType,
      },
      body: buffer.buffer as ArrayBuffer,
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return { filename };
}

export function getPublicUrl(bucket: string, filename: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
}
