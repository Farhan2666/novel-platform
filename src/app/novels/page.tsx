import { Suspense } from "react";
import type { Metadata } from "next";
import NovelListClient from "./content";

export const metadata: Metadata = {
  title: "Jelajahi Novel - NovelNest",
  description: "Temukan dan baca novel karya kreator Indonesia",
};

export default function NovelsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-white/40">Memuat...</div>
    }>
      <NovelListClient />
    </Suspense>
  );
}
