"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pen, BookOpen, Plus, Loader2, LogIn, Settings, Star, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AuthorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchNovels();
  }, [user, authLoading]);

  async function fetchNovels() {
    try {
      const res = await fetch("/api/novels/author");
      if (res.ok) setNovels(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "author" }),
      });
      if (res.ok) window.location.reload();
    } catch {}
    setUpgrading(false);
  }

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <LogIn className="w-10 h-10 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold">Login Diperlukan</h2>
        <p className="text-sm text-white/40">Masuk dulu untuk mengakses dashboard penulis.</p>
        <Link href="/auth/login" className="btn-primary inline-block">Masuk</Link>
      </div>
    );
  }

  if (user.role === "reader") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Pen className="w-10 h-10 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold">Jadi Penulis</h2>
        <p className="text-sm text-white/40">Upgrade akunmu jadi Author untuk mulai menulis novel.</p>
        <button onClick={handleUpgrade} disabled={upgrading} className="btn-primary">
          {upgrading ? "Memproses..." : "Upgrade Jadi Author"}
        </button>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 mt-4">
          Setelah upgrade, kamu bisa membuat, mengedit, dan mempublikasikan novel.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Penulis</h1>
          <p className="text-sm text-white/40">Halo, {user.username}</p>
        </div>
        <Link href="/author/novels/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novel Baru
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <BookOpen className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold">{novels.length}</p>
          <p className="text-xs text-white/40">Novel</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <FileText className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold">{novels.reduce((s: number, n: any) => s + (n._count?.chapters || 0), 0)}</p>
          <p className="text-xs text-white/40">Total Bab</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Star className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold">{novels.reduce((s: number, n: any) => s + (n._count?.reviews || 0), 0)}</p>
          <p className="text-xs text-white/40">Ulasan</p>
        </div>
      </div>

      {novels.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">Belum ada novel</p>
          <Link href="/author/novels/new" className="btn-primary mt-3 inline-block text-sm">Buat Novel Pertama</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {novels.map((novel: any) => (
            <Link key={novel.id} href={`/author/novels/${novel.id}`} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.07] hover:border-white/20 transition-all group">
              <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {novel.coverUrl ? (
                  <img src={novel.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-5 h-5 text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate group-hover:text-emerald-400 transition-colors">{novel.title}</h3>
                  {novel.underReview && <span className="text-[10px] text-yellow-400 shrink-0">Review</span>}
                  <span className={`text-[10px] shrink-0 ${novel.status === "completed" ? "text-emerald-400" : "text-yellow-400"}`}>
                    {novel.status === "completed" ? "Selesai" : "Ongoing"}
                  </span>
                </div>
                <p className="text-xs text-white/40">{novel._count?.chapters || 0} bab &middot; {novel._count?.reviews || 0} ulasan</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-white/30">{new Date(novel.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
