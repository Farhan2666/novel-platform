"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft, Plus, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AuthorNovelDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [novelRes, chaptersRes] = await Promise.all([
        fetch(`/api/novels/${id}`),
        fetch(`/api/novels/${id}/chapters`),
      ]);
      if (novelRes.ok) setNovel(await novelRes.json());
      if (chaptersRes.ok) setChapters(await chaptersRes.json());
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  const handleDeleteNovel = async () => {
    if (!confirm("Yakin ingin menghapus novel ini? Semua bab akan ikut terhapus.")) return;
    const res = await fetch(`/api/novels/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/author");
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Yakin ingin menghapus bab ini?")) return;
    setDeleting(chapterId);
    const res = await fetch(`/api/chapters/${chapterId}`, { method: "DELETE" });
    if (res.ok) {
      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
    }
    setDeleting(null);
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  if (!novel) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-white/40">Novel tidak ditemukan</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{novel.title}</h1>
          <p className="text-sm text-white/40">{chapters.length} bab</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/author/novels/${id}/edit`} className="btn-outline flex items-center gap-1.5 text-sm">
            <Edit3 className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handleDeleteNovel} className="text-xs px-3 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Hapus
          </button>
          <Link href={`/author/novels/${id}/chapters/new`} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> Bab Baru
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {chapters.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">Belum ada bab. Buat bab pertama!</p>
        ) : (
          chapters.map((ch: any) => (
            <div key={ch.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Bab {ch.chapterNumber}: {ch.title}</p>
                <p className="text-[10px] text-white/40">{new Date(ch.createdAt).toLocaleDateString("id-ID")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30">{ch.accessType}</span>
                <Link
                  href={`/author/novels/${id}/chapters/${ch.id}/edit`}
                  className="text-[10px] px-2 py-1 border border-white/10 text-white/60 rounded-lg hover:bg-white/10"
                >
                  <Edit3 className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => handleDeleteChapter(ch.id)}
                  disabled={deleting === ch.id}
                  className="text-[10px] px-2 py-1 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deleting === ch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
