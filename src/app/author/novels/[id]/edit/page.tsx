"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function EditNovelPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", coverUrl: "", status: "ongoing" });
  const [categoryId, setCategoryId] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading || !id) return;
    async function fetchData() {
      const [novelRes, catsRes, gensRes, tagsRes] = await Promise.all([
        fetch(`/api/novels/${id}`),
        fetch("/api/categories"),
        fetch("/api/genres"),
        fetch("/api/tags"),
      ]);
      if (catsRes.ok) setCategories(await catsRes.json());
      if (gensRes.ok) setGenres(await gensRes.json());
      if (tagsRes.ok) setTags(await tagsRes.json());

      if (novelRes.ok) {
        const novel = await novelRes.json();
        setForm({ title: novel.title, description: novel.description, coverUrl: novel.coverUrl, status: novel.status });
        setCategoryId(novel.categoryId || "");
        setSelectedGenres(novel.genres?.map((g: any) => g.genre.id) || []);
        setSelectedTags(novel.tags?.map((t: any) => t.tag.id) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, authLoading]);

  if (authLoading || loading) return <div className="max-w-xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  if (!user || !["author", "admin"].includes(user.role)) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center text-white/40">Akses ditolak</div>;
  }

  const toggleGenre = (gid: string) => {
    setSelectedGenres(prev => prev.includes(gid) ? prev.filter(g => g !== gid) : [...prev, gid]);
  };
  const toggleTag = (tid: string) => {
    setSelectedTags(prev => prev.includes(tid) ? prev.filter(t => t !== tid) : [...prev, tid]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm({ ...form, coverUrl: data.url });
    } catch {} finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/novels/author", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form, categoryId, genreIds: selectedGenres, tagIds: selectedTags }),
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white mb-4">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>
      <h1 className="text-2xl font-bold mb-6">Edit Novel</h1>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-white/60 block mb-1">Judul Novel</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Deskripsi</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[120px] resize-none" required />
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Kategori</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            <option value="">Pilih kategori</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Genre</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g: any) => (
              <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedGenres.includes(g.id) ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                {g.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Tag</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t: any) => (
              <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTags.includes(t.id) ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
            <option value="ongoing">Ongoing</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Cover</label>
          <div className="flex gap-2">
            <input type="url" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} className="input flex-1" placeholder="URL cover" />
            <label className="btn-outline cursor-pointer text-xs py-2 px-3 flex items-center gap-1.5 shrink-0">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
