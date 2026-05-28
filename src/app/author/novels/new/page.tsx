"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, X, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FONTS } from "@/components/reading/ThemeContext";

export default function NewNovelPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", coverUrl: "", fontFamily: "inter" });
  const [categoryId, setCategoryId] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.ok && r.json()),
      fetch("/api/genres").then(r => r.ok && r.json()),
      fetch("/api/tags").then(r => r.ok && r.json()),
    ]).then(([cats, gens, tgs]) => {
      if (cats) setCategories(cats);
      if (gens) setGenres(gens);
      if (tgs) setTags(tgs);
    });
  }, []);

  if (authLoading) return <div className="max-w-xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  if (!user || !["author", "admin"].includes(user.role)) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center text-white/40">Akses ditolak</div>;
  }

  const toggleGenre = (id: string) => {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Gagal upload");
      } else {
        setForm({ ...form, coverUrl: data.url });
      }
    } catch (err) {
      setUploadError("Gagal terhubung ke server");
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/novels/author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fontFamily: form.fontFamily, categoryId: categoryId || undefined, genreIds: selectedGenres, tagIds: selectedTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/novels/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Novel Baru</h1>

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
          <label className="text-xs text-white/60 block mb-1">Genre (pilih beberapa)</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g: any) => (
              <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedGenres.includes(g.id) ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                {g.name}
              </button>
            ))}
            {genres.length === 0 && <span className="text-[10px] text-white/30">Belum ada genre</span>}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Tag (pilih beberapa)</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t: any) => (
              <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTags.includes(t.id) ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                {t.name}
              </button>
            ))}
            {tags.length === 0 && <span className="text-[10px] text-white/30">Belum ada tag</span>}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Cover</label>
          {form.coverUrl ? (
            <div className="relative w-48 mx-auto">
              <img src={form.coverUrl} alt="Cover preview" className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" />
              <button type="button" onClick={() => setForm({ ...form, coverUrl: "" })}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black/80 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 mx-auto aspect-[3/4] border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/40 mb-2" />
                  <span className="text-xs text-white/40 text-center px-2">Klik untuk upload cover (max 2MB)</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          )}
          {uploadError && <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>}
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Font Default (untuk pembaca)</label>
          <select value={form.fontFamily} onChange={(e) => setForm({ ...form, fontFamily: e.target.value })} className="input">
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-white/30 mt-1">Pembaca tetap bisa mengganti font saat membaca</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Buat Novel
        </button>
      </form>
    </div>
  );
}
