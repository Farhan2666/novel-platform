"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  useEffect(() => { document.title = "Daftar - NovelNest"; }, []);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form.username, form.email, form.password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <UserPlus className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold">Daftar Akun</h1>
          <p className="text-xs text-white/40 mt-1">Mulai baca dan tulis novel</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 block mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input pl-10" placeholder="Username" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input pl-10" placeholder="Email" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pl-10" placeholder="Min 6 karakter" required minLength={6} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Daftar
          </button>
        </form>

        <p className="text-center text-xs text-white/40">
          Sudah punya akun? <Link href="/auth/login" className="text-emerald-400 hover:underline font-medium">Masuk</Link>
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
          <p className="text-[10px] text-white/30 font-medium">INFO ROLE:</p>
          <p className="text-[10px] text-white/30">Semua user daftar sebagai <span className="text-white/50">Reader</span>.</p>
          <p className="text-[10px] text-white/30">Untuk jadi <span className="text-emerald-400">Author</span>, kamu bisa upgrade lewat Dashboard setelah login.</p>
        </div>
      </div>
    </div>
  );
}
