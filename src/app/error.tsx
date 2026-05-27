"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-red-400">500</h1>
        <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
        <p className="text-sm text-white/40 max-w-md">Maaf, terjadi kesalahan pada server. Silakan coba lagi.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">Coba Lagi</button>
          <a href="/" className="btn-outline">Kembali ke Beranda</a>
        </div>
      </div>
    </div>
  );
}
