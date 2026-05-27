"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ChevronLeft, ChevronRight, Settings, Sun, Moon, Type,
  ChevronUp, ArrowLeft, ArrowRight, BookOpen, AlertTriangle, MessageSquare, Send
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeProvider, useTheme } from "@/components/reading/ThemeContext";
import { cn } from "@/lib/utils";

function ReadingContent() {
  const { id, chapterId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, themes, fontScale, navMode, setTheme, setFontScale, setNavMode } = useTheme();

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const flipContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchChapter() {
      try {
        const [chRes, cmRes] = await Promise.all([
          fetch(`/api/chapters/${chapterId}/read`),
          fetch(`/api/chapters/${chapterId}/comments`),
        ]);
        if (chRes.ok) {
          const data = await chRes.json();
          setChapter(data);
          document.title = `Bab ${data.chapterNumber}: ${data.title} - ${data.novel?.title} - NovelNest`;
        }
        if (cmRes.ok) setComments(await cmRes.json());
      } catch {} finally {
        setLoading(false);
      }
    }
    if (chapterId) fetchChapter();
  }, [chapterId]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setCommentText("");
      }
    } catch {} finally {
      setSendingComment(false);
    }
  };

  useEffect(() => {
    if (!chapter || navMode !== "flip") return;
    const container = flipContainerRef.current;
    if (!container) return;

    const calculatePages = () => {
      const containerHeight = container.clientHeight - 64;
      const temp = document.createElement("div");
      temp.style.cssText = `
        position: absolute; visibility: hidden; width: ${container.clientWidth - 48}px;
        font-size: ${fontScale}%; line-height: 1.9; padding: 0;
      `;
      document.body.appendChild(temp);

      const plainText = chapter.content.replace(/<[^>]+>/g, "");
      const words = plainText.split(/\s+/).filter(Boolean);
      const result: string[] = [];
      let currentPageText = "";

      for (const word of words) {
        const testText = currentPageText ? currentPageText + " " + word : word;
        temp.textContent = testText + ".";
        if (temp.offsetHeight > containerHeight && currentPageText) {
          result.push(currentPageText);
          currentPageText = word;
        } else {
          currentPageText = testText;
        }
      }
      if (currentPageText) result.push(currentPageText);
      document.body.removeChild(temp);
      setPages(result.length > 0 ? result : [chapter.content]);
      setCurrentPage((prev) => Math.min(prev, Math.max(0, result.length - 1)));
    };

    calculatePages();
    const observer = new ResizeObserver(calculatePages);
    observer.observe(container);
    return () => observer.disconnect();
  }, [chapter, navMode, fontScale]);

  const saveProgress = useCallback(async () => {
    if (!user || !chapter || saving) return;
    setSaving(true);
    try {
      await fetch("/api/reading-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: id,
          chapterId: chapter.id,
          scrollPosition: navMode === "scroll" ? window.scrollY / document.body.scrollHeight : 0,
          pageIndex: currentPage,
        }),
      });
    } catch {} finally {
      setSaving(false);
    }
  }, [user, chapter, id, navMode, currentPage, saving]);

  useEffect(() => {
    if (navMode === "scroll") {
      const timer = setInterval(saveProgress, 10000);
      return () => clearInterval(timer);
    }
  }, [navMode, saveProgress]);

  useEffect(() => {
    if (navMode === "flip") saveProgress();
  }, [currentPage, navMode, saveProgress]);

  const currentTheme = themes.find((t) => t.id === theme.id) || themes[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: currentTheme.bg }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.text }} />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: currentTheme.bg, color: currentTheme.text }}>
        <p>Bab tidak ditemukan</p>
      </div>
    );
  }

  const prevChapter = chapter.novel?.chapters?.find(
    (c: any) => c.chapterNumber === chapter.chapterNumber - 1
  );
  const nextChapter = chapter.novel?.chapters?.find(
    (c: any) => c.chapterNumber === chapter.chapterNumber + 1
  );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: currentTheme.bg }}>
      {chapter.underReview && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500/90 text-black text-[10px] text-center py-1.5 px-4 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Bab ini sedang dalam review
        </div>
      )}

      <div className={cn(
        "fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-12 transition-colors",
        theme.id === "dark" ? "bg-[#121212]/90" : "bg-white/80 backdrop-blur-md"
      )}
        style={theme.id !== "dark" ? { backgroundColor: `${currentTheme.bg}dd` } : {}}
      >
        <button onClick={() => router.push(`/novels/${id}`)} className="flex items-center gap-1 text-xs" style={{ color: currentTheme.text }}>
          <ChevronLeft className="w-4 h-4" /> {chapter.novel?.title}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] opacity-50" style={{ color: currentTheme.text }}>Bab {chapter.chapterNumber}</span>
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
            <Settings className="w-4 h-4" style={{ color: currentTheme.text }} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed top-12 left-0 right-0 z-30 p-4 border-b transition-colors" style={{
          backgroundColor: theme.id === "dark" ? "#1A1A1A" : currentTheme.bg,
          borderColor: theme.id === "dark" ? "#2A2A2A" : "rgba(0,0,0,0.1)",
          color: currentTheme.text,
        }}>
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider opacity-50 mb-2">Tema</p>
              <div className="flex flex-wrap gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs transition-all",
                      theme.id === t.id ? "ring-2 ring-emerald-500 font-medium" : "opacity-60 hover:opacity-100"
                    )}
                    style={{ background: t.bg, color: t.text }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5 opacity-50" />
                <input
                  type="range"
                  min={80}
                  max={200}
                  value={fontScale}
                  onChange={(e) => setFontScale(Number(e.target.value))}
                  className="w-24 accent-emerald-500"
                />
                <span className="text-[10px] w-8">{fontScale}%</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] opacity-50">Mode:</span>
                <button
                  onClick={() => setNavMode("scroll")}
                  className={cn("px-2 py-1 rounded text-[10px]", navMode === "scroll" ? "bg-emerald-500 text-black font-medium" : "opacity-50")}
                >
                  Scroll
                </button>
                <button
                  onClick={() => setNavMode("flip")}
                  className={cn("px-2 py-1 rounded text-[10px]", navMode === "flip" ? "bg-emerald-500 text-black font-medium" : "opacity-50")}
                >
                  Flip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {navMode === "scroll" ? (
        <div
          ref={contentRef}
          className="scroll-page pt-16 px-4 max-w-[680px] mx-auto"
          style={{ fontSize: `${fontScale}%`, color: currentTheme.text }}
        >
          <div
            className="reading-container"
            dangerouslySetInnerHTML={{
              __html: /<[a-z][\s\S]*>/i.test(chapter.content)
                ? chapter.content
                : chapter.content.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")
            }}
          />
        </div>
      ) : (
        <div ref={flipContainerRef} className="flip-page pt-16 px-6 max-w-[680px] mx-auto" style={{ fontSize: `${fontScale}%`, color: currentTheme.text }}>
          <div className="reading-container">
            <p>{pages[currentPage] || ""}</p>
          </div>
          <div className="text-center text-[10px] opacity-30 mt-8">
            {currentPage + 1} / {pages.length}
          </div>
        </div>
      )}

      {navMode === "flip" && pages.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 transition-colors"
          style={{
            backgroundColor: theme.id === "dark" ? "#121212" : currentTheme.bg,
            borderTop: `1px solid ${theme.id === "dark" ? "#2A2A2A" : "rgba(0,0,0,0.1)"}`,
          }}
        >
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="btn-outline text-xs py-1.5 px-3 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs opacity-50" style={{ color: currentTheme.text }}>
            {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage >= pages.length - 1}
            className="btn-outline text-xs py-1.5 px-3 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {navMode === "scroll" && (
        <div className="max-w-[680px] mx-auto px-4 pb-8 flex items-center justify-between gap-2 pt-4">
          {prevChapter ? (
            <Link href={`/novels/${id}/chapters/${prevChapter.id}`} className="btn-outline text-xs py-2 px-4 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Bab Sebelumnya
            </Link>
          ) : <div />}
          {nextChapter ? (
            <Link href={`/novels/${id}/chapters/${nextChapter.id}`} className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
              Bab Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link href={`/novels/${id}`} className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
              Selesai <BookOpen className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      <div className="max-w-[680px] mx-auto px-4 py-8 border-t border-white/10 mt-4" style={{ color: currentTheme.text }}>
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4" /> Komentar ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
              style={{ color: currentTheme.text }}
            />
            <button type="submit" disabled={sendingComment} className="btn-primary text-xs py-2 px-3 flex items-center gap-1 disabled:opacity-50">
              {sendingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </form>
        ) : (
          <p className="text-xs text-white/40 mb-4">
            <Link href="/auth/login" className="text-emerald-400 hover:underline">Masuk</Link> untuk berkomentar
          </p>
        )}

        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs opacity-40">Belum ada komentar</p>
          ) : (
            comments.map((c: any) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {c.user?.avatarUrl ? (
                    <img src={c.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400">{(c.user?.username || "?")[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{c.user?.username}</span>
                    <span className="text-[10px] opacity-40">{new Date(c.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReadingPage() {
  return (
    <ThemeProvider>
      <ReadingContent />
    </ThemeProvider>
  );
}
