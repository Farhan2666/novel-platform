import Link from "next/link";
import { BookOpen, Search, TrendingUp, Star, Pen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestNovels, topNovels] = await Promise.all([
    prisma.novel.findMany({
      select: {
        id: true, title: true, coverUrl: true, status: true, underReview: true,
        author: { select: { username: true } },
        category: { select: { name: true } },
        _count: { select: { chapters: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.novel.findMany({
      select: {
        id: true, title: true, coverUrl: true, status: true,
        author: { select: { username: true } },
        reviews: { select: { rating: true } },
        _count: { select: { chapters: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-12 pb-20">
      <section className="max-w-7xl mx-auto px-4 pt-12 md:pt-20 text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Baca & Tulis Novel
          <span className="text-emerald-400"> Karya Kreator Indonesia</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base">
          Platform UGC untuk penulis dan pembaca. Gratis baca, gratis terbitkan karyamu.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/novels" className="btn-primary flex items-center gap-2">
            <Search className="w-4 h-4" /> Jelajahi Novel
          </Link>
          <Link href="/auth/register" className="btn-outline flex items-center gap-2">
            <Pen className="w-4 h-4" /> Mulai Menulis
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Novel Terbaru
          </h2>
          <Link href="/novels" className="text-sm text-emerald-400 hover:underline">Lihat Semua</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {latestNovels.map((novel) => {
            const avgRating = topNovels.find(n => n.id === novel.id)?.reviews;
            const rating = avgRating?.length ? Math.round((avgRating.reduce((s, r) => s + r.rating, 0) / avgRating.length) * 10) / 10 : null;
            return (
              <Link key={novel.id} href={`/novels/${novel.id}`} className="card overflow-hidden group">
                <div className="aspect-[3/4] bg-white/5 overflow-hidden flex items-center justify-center">
                  {novel.coverUrl ? (
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-white/20" />
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm truncate">{novel.title}</h3>
                  <p className="text-xs text-white/40 truncate">{novel.author.username}</p>
                  {novel.category && <p className="text-[10px] text-emerald-400/60">{novel.category.name}</p>}
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>{novel._count.chapters} bab</span>
                    {rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" /> {rating}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="glass rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <h2 className="text-xl md:text-3xl font-bold mb-3">Jadi Penulis di NovelNest</h2>
          <p className="text-white/60 text-sm mb-4 max-w-lg mx-auto">
            Publikasikan novelmu secara instan, raih pembaca, dan bangun komunitas.
          </p>
          <Link href="/auth/register" className="btn-primary">Mulai Menulis Gratis</Link>
        </div>
      </section>


    </div>
  );
}
