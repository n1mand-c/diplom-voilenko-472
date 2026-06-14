"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import PasswordCharacters from "@/components/ui/PasswordCharacters";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      return setError("Всі поля обов'язкові для заповнення");
    }
    // If the input looks like an email, validate its format
    if (form.username.includes("@") && !emailRegex.test(form.username)) {
      return setError("Введіть коректний email (наприклад: user@gmail.com)");
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Помилка входу");
      }

      // Route based on role
      if (data.role === "ROLE_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/my-bookings");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> На головну
      </Link>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <PasswordCharacters inputId="login-password" isPasswordHidden={!showPassword} />
        <div className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-[#C8102E]/20 text-[#C8102E] rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Вхід в систему</h1>
            <p className="text-white/50 text-sm text-center">Один акаунт для гостей та адміністраторів</p>
          </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-white/50 text-sm mb-1.5 block">Логін або Email</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors"
              placeholder="admin / admin@example.com"
            />
          </div>
          <div>
            <label className="text-white/50 text-sm mb-1.5 block">Пароль</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C8102E] hover:text-[#a00d25] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8102E] hover:bg-[#a00d25] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? "Зачекайте..." : "Увійти"}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-4 w-auto" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          Не маєте акаунту? <Link href="/register" className="text-[#C8102E] hover:underline">Зареєструватись</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
