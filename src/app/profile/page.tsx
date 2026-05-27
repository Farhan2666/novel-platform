"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, BookOpen, Clock, Loader2, LogIn, Mail, Calendar, Shield, Edit3, Bookmark, Save, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  useEffect(() => { document.title = "Profil - NovelNest"; }, []);
  const [histories, setHistories] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "", password: "", avatarUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"history" | "bookmarks">("history");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    Promise.all([
      fetch("/api/reading-history").then(r => r.ok && r.json()),
      fetch("/api/bookmarks").then(r => r.ok && r.json()),
    ]).then(([h, b]) => {
      if (h) setHistories(h);
      if (b) setBookmarks(b);
      setLoading(false);
    });
  }, [user, authLoading]);

  const startEdit = () => {
    setEditForm({ username: user?.username || "", email: user?.email || "", password: "", avatarUrl: user?.avatarUrl || "" });
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: any = {};
      if (editForm.username !== user?.username) body.username = editForm.username;
      if (editForm.email !== user?.email) body.email = editForm.email;
      if (editForm.password) body.password = editForm.password;
      if (editForm.avatarUrl !== user?.avatarUrl) body.avatarUrl = editForm.avatarUrl;
      if (Object.keys(body).length === 0) { setEditing(false); return; }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refresh();
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user?.username}</h2>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user?.email}
              </p>
            </div>
          </div>
          <button onClick={startEdit} className="btn-outline text-xs flex items-center gap-1.5">
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40 pt-4 border-t border-white/10">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> {user?.role}</span>
          <Link href="/author" className="text-emerald-400 hover:underline">
            {user?.role === "reader" ? "Upgrade jadi Author?" : "Dashboard Penulis"}
          </Link>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Edit Profil</h3>
            <button type="button" onClick={() => setEditing(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">{error}</div>}
          <div>
            <label className="text-xs text-white/60 block mb-1">Username</label>
            <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Email</label>
            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">URL Avatar</label>
            <input type="url" value={editForm.avatarUrl} onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })} className="input" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Password Baru (kosongkan jika tidak diganti)</label>
            <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="input" placeholder="Min 6 karakter" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </button>
        </form>
      )}

      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button onClick={() => setTab("history")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "history" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}>
          <Clock className="w-3.5 h-3.5 inline mr-1.5" />Riwayat Baca
        </button>
        <button onClick={() => setTab("bookmarks")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "bookmarks" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}>
          <Bookmark className="w-3.5 h-3.5 inline mr-1.5" />Favorit ({bookmarks.length})
        </button>
      </div>

      {tab === "history" ? (
        <div className="space-y-3">
          {histories.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">Belum ada riwayat baca</p>
              <Link href="/novels" className="text-sm text-emerald-400 hover:underline mt-1 inline-block">Jelajahi Novel</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {histories.map((h: any) => (
                <Link
                  key={h.id}
                  href={`/novels/${h.novelId}/chapters/${h.chapterId}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-14 bg-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {h.novel?.coverUrl ? (
                      <img src={h.novel.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.novel?.title}</p>
                    <p className="text-xs text-white/40">Bab {h.chapter?.chapterNumber}: {h.chapter?.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Bookmark className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">Belum ada novel favorit</p>
              <Link href="/novels" className="text-sm text-emerald-400 hover:underline mt-1 inline-block">Jelajahi Novel</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bookmarks.map((b: any) => (
                <Link key={b.id} href={`/novels/${b.novel.id}`} className="card overflow-hidden group">
                  <div className="aspect-[3/4] bg-white/5 overflow-hidden flex items-center justify-center">
                    {b.novel.coverUrl ? (
                      <img src={b.novel.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{b.novel.title}</h3>
                    <p className="text-xs text-white/40 truncate">{b.novel.author?.username}</p>
                    <p className="text-[10px] text-white/30">{b.novel._count?.chapters || 0} bab</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
