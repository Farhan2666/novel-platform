"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  useEffect(() => { document.title = "Masuk - NovelNest"; }, []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(identifier, password);
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
          <LogIn className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold">Masuk</h1>
          <p className="text-xs text-white/40 mt-1">Selamat datang kembali</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 block mb-1">Email atau Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="input pl-10" placeholder="Email atau username" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 pr-10" placeholder="Password" required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Masuk
          </button>
        </form>

        <p className="text-center text-xs text-white/40">
          Belum punya akun? <Link href="/auth/register" className="text-emerald-400 hover:underline font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
