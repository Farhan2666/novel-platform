"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, BookOpen, Flag, Loader2, AlertTriangle, Search, Tag, FolderOpen, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [novelSearch, setNovelSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [novelPage, setNovelPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [newGenre, setNewGenre] = useState("");
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const perPage = 10;

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { router.push("/"); return; }
    fetchData();
  }, [user, authLoading]);

  async function fetchData() {
    try {
      const [adminRes, genresRes, tagsRes] = await Promise.all([
        fetch("/api/admin"),
        fetch("/api/genres"),
        fetch("/api/tags"),
      ]);
      if (adminRes.ok) setData(await adminRes.json());
      if (genresRes.ok) setGenres(await genresRes.json());
      if (tagsRes.ok) setTags(await tagsRes.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleAction(type: string, id: string, action: string, extra?: any) {
    const body: any = { type, id, action, ...extra };
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) fetchData();
  }

  async function handleAddGenre() {
    if (!newGenre.trim()) return;
    setAdding(true);
    await fetch("/api/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGenre.trim() }),
    });
    setNewGenre("");
    setAdding(false);
    fetchData();
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    setAdding(true);
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    setNewTag("");
    setAdding(false);
    fetchData();
  }

  async function handleDeleteGenre(id: string) {
    if (!confirm("Hapus genre ini?")) return;
    await handleAction("genre", id, "delete");
  }

  async function handleDeleteTag(id: string) {
    if (!confirm("Hapus tag ini?")) return;
    await handleAction("tag", id, "delete");
  }

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  }

  const stats = {
    users: data?.users?.length || 0,
    novels: data?.novels?.length || 0,
    flagged: data?.flaggedChapters?.length || 0,
    reports: data?.reports?.length || 0,
  };

  const filteredNovels = data?.novels?.filter((n: any) =>
    n.title.toLowerCase().includes(novelSearch.toLowerCase()) ||
    n.author?.username?.toLowerCase().includes(novelSearch.toLowerCase())
  ) || [];
  const filteredUsers = data?.users?.filter((u: any) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ) || [];
  const totalNovelPages = Math.ceil(filteredNovels.length / perPage);
  const totalUserPages = Math.ceil(filteredUsers.length / perPage);
  const pagedNovels = filteredNovels.slice((novelPage - 1) * perPage, novelPage * perPage);
  const pagedUsers = filteredUsers.slice((userPage - 1) * perPage, userPage * perPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="w-6 h-6 text-emerald-400" /> Panel Admin
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Users", value: stats.users, icon: Users },
          { label: "Novel", value: stats.novels, icon: BookOpen },
          { label: "Bab Di-flag", value: stats.flagged, icon: AlertTriangle, warn: stats.flagged > 0 },
          { label: "Laporan", value: stats.reports, icon: Flag },
        ].map((s) => (
          <div key={s.label} className={cn("bg-white/5 border rounded-2xl p-4", s.warn ? "border-yellow-500/30" : "border-white/10")}>
            <s.icon className={cn("w-5 h-5 mb-2", s.warn ? "text-yellow-400" : "text-emerald-400")} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      {data?.reports?.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Laporan Masuk</h2>
          {data.reports.map((r: any) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{r.novel?.title}</p>
                <span className="text-[10px] text-white/30">{new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
              <p className="text-xs text-white/40">Pelapor: {r.user?.username} | Alasan: {r.reason}</p>
              {r.chapter && <p className="text-xs text-white/30">Bab: {r.chapter.title}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleAction("novel", r.novelId, "clear_flag")} className="btn-primary text-xs py-1.5 px-3">Clear Flag</button>
                <button onClick={() => handleAction("novel", r.novelId, "delete")} className="text-xs py-1.5 px-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10">Hapus Novel</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.flaggedChapters?.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Bab Di-flag</h2>
          <div className="space-y-2">
            {data.flaggedChapters.map((ch: any) => (
              <div key={ch.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{ch.novel?.title} — Bab {ch.chapterNumber}: {ch.title}</p>
                </div>
                <button onClick={() => handleAction("chapter", ch.id, "clear_flag")} className="btn-primary text-xs py-1.5 px-3">Clear Flag</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><FolderOpen className="w-4 h-4 text-emerald-400" /> Genre</h3>
          <div className="flex gap-2">
            <input type="text" value={newGenre} onChange={(e) => setNewGenre(e.target.value)} placeholder="Nama genre baru" className="input flex-1 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAddGenre()} />
            <button onClick={handleAddGenre} disabled={adding} className="btn-primary text-xs py-2 px-3 shrink-0">
              {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g: any) => (
              <span key={g.id} className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                {g.name}
                <button onClick={() => handleDeleteGenre(g.id)} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-400" /> Tag</h3>
          <div className="flex gap-2">
            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nama tag baru" className="input flex-1 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()} />
            <button onClick={handleAddTag} disabled={adding} className="btn-primary text-xs py-2 px-3 shrink-0">
              {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t: any) => (
              <span key={t.id} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 flex items-center gap-1">
                {t.name}
                <button onClick={() => handleDeleteTag(t.id)} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Semua Novel</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input type="text" value={novelSearch} onChange={(e) => { setNovelSearch(e.target.value); setNovelPage(1); }}
            placeholder="Cari novel..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-2 px-2">Judul</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Penulis</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-left py-2 px-2">Flag</th>
                <th className="text-right py-2 px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedNovels.map((n: any) => (
                <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2 font-medium truncate max-w-[200px]">{n.title}</td>
                  <td className="py-2 px-2 text-white/40 hidden md:table-cell">{n.author?.username}</td>
                  <td className="py-2 px-2">
                    <span className={n.status === "completed" ? "text-emerald-400" : "text-yellow-400"}>{n.status}</span>
                  </td>
                  <td className="py-2 px-2">{n.underReview ? <span className="text-yellow-400">Ya</span> : "Tidak"}</td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex gap-1 justify-end">
                      {n.underReview && (
                        <button onClick={() => handleAction("novel", n.id, "clear_flag")} className="text-[10px] px-2 py-1 border border-emerald-500/30 text-emerald-400 rounded-lg">Clear</button>
                      )}
                      <button onClick={() => handleAction("novel", n.id, "delete")} className="text-[10px] px-2 py-1 border border-red-500/30 text-red-400 rounded-lg">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalNovelPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-3">
              <button onClick={() => setNovelPage(p => Math.max(1, p - 1))} disabled={novelPage === 1} className="btn-outline text-xs py-1 px-2 disabled:opacity-30">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-white/40">{novelPage}/{totalNovelPages}</span>
              <button onClick={() => setNovelPage(p => Math.min(totalNovelPages, p + 1))} disabled={novelPage === totalNovelPages} className="btn-outline text-xs py-1 px-2 disabled:opacity-30">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Users</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input type="text" value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
            placeholder="Cari user..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-2 px-2">Username</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Email</th>
                <th className="text-left py-2 px-2">Role</th>
                <th className="text-right py-2 px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((u: any) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2 font-medium">{u.username}</td>
                  <td className="py-2 px-2 text-white/40 hidden md:table-cell">{u.email}</td>
                  <td className="py-2 px-2">
                    <select value={u.role} onChange={(e) => handleAction("user", u.id, "set_role", { role: e.target.value })}
                      className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-[10px]">
                      <option value="reader">Reader</option>
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button onClick={() => handleAction("user", u.id, "delete")} className="text-[10px] px-2 py-1 border border-red-500/30 text-red-400 rounded-lg">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalUserPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-3">
              <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="btn-outline text-xs py-1 px-2 disabled:opacity-30">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-white/40">{userPage}/{totalUserPages}</span>
              <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="btn-outline text-xs py-1 px-2 disabled:opacity-30">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
