"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen, Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function NovelListClient() {
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") || "";

  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQ);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterGenre, setFilterGenre] = useState("");

  useEffect(() => {
    setSearch(urlQ);
    setPage(1);
  }, [urlQ]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.ok && r.json()).then(setCategories);
    fetch("/api/genres").then(r => r.ok && r.json()).then(setGenres);
  }, []);

  useEffect(() => {
    async function fetchNovels() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (filterCategory) params.set("category", filterCategory);
        if (filterGenre) params.set("genre", filterGenre);
        params.set("page", String(page));
        const res = await fetch(`/api/novels?${params}`);
        if (res.ok) {
          const data = await res.json();
          setNovels(data.novels);
          setTotalPages(data.totalPages);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchNovels();
  }, [search, page, filterCategory, filterGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Jelajahi Novel</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Cari novel..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50">
          <option value="">Semua Kategori</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.slug}>{c.name} ({c._count?.novels || 0})</option>
          ))}
        </select>
        <select value={filterGenre} onChange={(e) => { setFilterGenre(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50">
          <option value="">Semua Genre</option>
          {genres.map((g: any) => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>
      ) : novels.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p>Novel tidak ditemukan</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {novels.map((novel: any) => (
              <Link key={novel.id} href={`/novels/${novel.id}`} className="card overflow-hidden group">
                <div className="aspect-[3/4] bg-white/5 overflow-hidden flex items-center justify-center">
                  {novel.coverUrl ? (
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <BookOpen className="w-10 h-10 text-white/20" />
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm truncate">{novel.title}</h3>
                  <p className="text-xs text-white/40 truncate">{novel.author?.username}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>{novel._count?.chapters || 0} bab</span>
                    <span className={novel.status === "completed" ? "text-emerald-400" : "text-yellow-400"}>
                      {novel.status === "completed" ? "Selesai" : "Ongoing"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/40">Halaman {page} dari {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
