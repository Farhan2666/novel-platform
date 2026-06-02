"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Star, Clock, AlertTriangle, MessageSquare, Send, Loader2, ChevronLeft, Flag, Tag, FolderOpen, Bookmark, ChevronRight, Lock, Unlock } from "lucide-react";
import CoverImage from "@/components/CoverImage";
import { useAuth } from "@/lib/auth-context";

export default function NovelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [lastRead, setLastRead] = useState<any>(null);

  useEffect(() => {
    async function fetchNovel() {
      try {
        const res = await fetch(`/api/novels/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNovel(data);
          document.title = `${data.title} - NovelNest`;
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    if (id) fetchNovel();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      fetch(`/api/bookmarks/check?novelId=${id}`).then(r => r.ok && r.json()),
      fetch(`/api/reading-history?novelId=${id}`).then(r => r.ok && r.json()),
    ]).then(([bm, rh]) => {
      if (bm) setBookmarked(bm.bookmarked);
      if (rh?.chapter) setLastRead(rh);
    }).catch(() => {});
  }, [user, id]);

  const toggleBookmark = async () => {
    if (!user) { router.push("/auth/login"); return; }
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookmarked(data.bookmarked);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/novels/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNovel((prev: any) => {
        const reviews = [data, ...(prev.reviews || [])];
        const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
        return { ...prev, reviews, avgRating };
      });
      setComment("");
    } catch (err: any) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleReport = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!reportReason.trim()) return;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId: id, reason: reportReason }),
      });
      if (res.ok) {
        setShowReport(false);
        setReportReason("");
        alert("Laporan terkirim! Terima kasih.");
      }
    } catch {}
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>;
  }

  if (!novel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-white/40">Novel tidak ditemukan</p>
        <Link href="/novels" className="btn-primary mt-3 inline-block">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      {novel.underReview && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Novel ini sedang dalam review oleh tim kami
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
          <CoverImage src={novel.coverUrl} alt={novel.title} className="w-full h-full" imgClassName="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{novel.title}</h1>
              <p className="text-sm text-white/40">oleh <span className="text-emerald-400">{novel.author?.username}</span></p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleBookmark} className={`p-2 transition-colors ${bookmarked ? "text-emerald-400" : "text-white/30 hover:text-emerald-400"}`}>
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-emerald-400" : ""}`} />
              </button>
              <button onClick={() => setShowReport(!showReport)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showReport && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 space-y-2">
              <p className="text-xs text-red-400 font-medium">Laporkan Novel</p>
              <textarea
                placeholder="Alasan laporan..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white resize-none h-16 focus:outline-none"
              />
              <button onClick={handleReport} className="btn-primary text-xs py-1.5 px-3">Kirim Laporan</button>
            </div>
          )}

          <p className="text-sm text-white/60 leading-relaxed">{novel.description}</p>

          {novel.category && (
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <FolderOpen className="w-3 h-3" /> {novel.category.name}
            </div>
          )}

          {novel.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {novel.genres.map((g: any) => (
                <span key={g.genre.id} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {g.genre.name}
                </span>
              ))}
            </div>
          )}

          {novel.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {novel.tags.map((t: any) => (
                <span key={t.tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {t.tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">{novel._count?.chapters || 0} bab</span>
            <span className={`flex items-center gap-1 ${novel.status === "completed" ? "text-emerald-400" : "text-yellow-400"}`}>
              {novel.status === "completed" ? "Selesai" : "Ongoing"}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {novel.avgRating || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {novel._count?.reviews || 0}
            </span>
          </div>

          {lastRead && (
            <Link
              href={`/novels/${id}/chapters/${lastRead.chapterId}`}
              className="btn-primary text-xs inline-flex items-center gap-1.5 py-2 px-4"
            >
              <Clock className="w-3 h-3" /> Lanjut Baca (Bab {lastRead.chapter?.chapterNumber})
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" /> Daftar Bab
            <span className="text-xs text-white/30 font-normal">({novel._count?.chapters || 0})</span>
          </h2>
          {lastRead && (
            <Link
              href={`/novels/${id}/chapters/${lastRead.chapterId}`}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Clock className="w-3 h-3" /> Lanjut Bab {lastRead.chapter?.chapterNumber}
            </Link>
          )}
        </div>
        {novel.chapters?.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
            <BookOpen className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">Belum ada bab</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {novel.chapters?.map((ch: any, i: number) => {
              const isPremium = ch.accessType === "premium";
              return (
                <Link
                  key={ch.id}
                  href={`/novels/${id}/chapters/${ch.id}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <span className="text-xs font-bold text-emerald-400">{ch.chapterNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">
                      {ch.title || `Bab ${ch.chapterNumber}`}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {new Date(ch.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isPremium ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Premium
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5" /> Gratis
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" /> Ulasan ({novel.reviews?.length || 0})
        </h2>

        {user ? (
          <form onSubmit={handleReview} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star className={`w-5 h-5 ${s <= rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"}`} />
                </button>
              ))}
              <span className="text-xs text-white/40 ml-2">{rating}/5</span>
            </div>
            <textarea
              placeholder="Tulis ulasan..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 resize-none h-20 focus:outline-none"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50">
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Kirim Ulasan
            </button>
          </form>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-sm text-white/40">
            <Link href="/auth/login" className="text-emerald-400 hover:underline">Masuk</Link> dulu untuk memberi ulasan
          </div>
        )}

        <div className="space-y-2">
          {novel.reviews?.map((review: any) => (
            <div key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-400">{(review.user?.username || "U")[0]}</span>
                  </div>
                  <span className="text-sm font-medium">{review.user?.username || "User"}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"}`} />
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-sm text-white/60">{review.comment}</p>}
              <p className="text-[10px] text-white/30">{new Date(review.createdAt).toLocaleDateString("id-ID")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
