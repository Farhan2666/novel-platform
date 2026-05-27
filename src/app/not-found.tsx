import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-emerald-400">404</h1>
        <h2 className="text-xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-white/40 max-w-md">Halaman yang kamu cari tidak ada atau telah dipindahkan.</p>
        <Link href="/" className="btn-primary inline-block">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
