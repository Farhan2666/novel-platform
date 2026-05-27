"use client";

import Link from "next/link";
import { Pen, BookOpen, User, LogIn, Menu, X, Plus, Library } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          NovelNest
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/novels" className="text-sm text-white/60 hover:text-white transition-colors">Jelajahi</Link>
          {user && (
            <Link href="/author" className="text-sm text-white/60 hover:text-white transition-colors">Dashboard</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm text-emerald-400/80 hover:text-emerald-400 transition-colors">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link href="/author/novels/new" className="hidden sm:flex items-center gap-1.5 text-sm bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Tulis
              </Link>
              <Link href="/profile" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={logout} className="text-xs text-white/40 hover:text-white hidden sm:block">Keluar</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">Masuk</Link>
              <Link href="/auth/register" className="text-sm bg-emerald-500 text-black font-semibold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors">Daftar</Link>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0F0F0F] p-4 space-y-2">
          <Link href="/novels" className="block px-4 py-2 rounded-lg hover:bg-white/5 text-sm" onClick={() => setOpen(false)}>Jelajahi</Link>
          {user && (
            <>
              <Link href="/author" className="block px-4 py-2 rounded-lg hover:bg-white/5 text-sm" onClick={() => setOpen(false)}>Dashboard Penulis</Link>
              <Link href="/author/novels/new" className="block px-4 py-2 rounded-lg hover:bg-white/5 text-sm" onClick={() => setOpen(false)}>Tulis Novel Baru</Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/5 text-sm text-emerald-400" onClick={() => setOpen(false)}>Panel Admin</Link>
          )}
          <hr className="border-white/10" />
          {user ? (
            <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400">Keluar</button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1 text-center px-4 py-2 text-sm border border-white/10 rounded-lg" onClick={() => setOpen(false)}>Masuk</Link>
              <Link href="/auth/register" className="flex-1 text-center px-4 py-2 text-sm bg-emerald-500 text-black rounded-lg font-semibold" onClick={() => setOpen(false)}>Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
