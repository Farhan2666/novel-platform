"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import RichEditor from "@/components/editor/RichEditor";

export default function NewChapterPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const plainText = content.replace(/<[^>]+>/g, "").trim();
    if (!title.trim() || !plainText) {
      setError("Judul dan konten wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/novels/${id}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/author/novels/${id}`);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white mb-4">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">Bab Baru</h1>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-white/60 block mb-1">Judul Bab</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Judul bab..." required />
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Konten</label>
          <RichEditor content="" onChange={setContent} placeholder="Tulis cerita kamu di sini..." />
          <p className="text-[10px] text-white/30 mt-1">
            Gunakan toolbar untuk formatting. Konten terbit secara instan (post-moderation).
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Terbitkan Bab
        </button>
      </form>
    </div>
  );
}
