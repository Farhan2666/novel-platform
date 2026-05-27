"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Reset Password - NovelNest"; }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Password tidak cocok"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <XCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold">Token Tidak Valid</h2>
        <p className="text-sm text-white/40">Link reset password tidak valid atau telah kadaluarsa.</p>
        <Link href="/auth/login" className="btn-primary inline-block">Kembali ke Login</Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold">Password Diubah!</h2>
        <p className="text-sm text-white/40">{message}</p>
        <Link href="/auth/login" className="btn-primary inline-block">Masuk</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <h1 className="text-2xl font-bold text-center">Reset Password</h1>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-white/60 block mb-1">Password Baru</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min 6 karakter" required />
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Konfirmasi Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="Ulangi password" required />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-20 text-center"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
