"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";

function RedBullLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src="/logo.png" 
      alt="Red Bull Logo" 
      className={className} 
    />
  );
}

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; userId: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 border-b border-white/5 transition-colors ${transparent ? "bg-black/40 backdrop-blur-md" : "bg-[#0A0A0F]"}`}>
      <Link href="/" className="flex items-center gap-2 group">
        <RedBullLogo className="h-6 md:h-8 w-auto transition-transform group-hover:scale-105" />
        <span className="text-white font-bold text-sm md:text-lg tracking-wide group-hover:text-white/80 hidden sm:block">RED BULL HOTELS</span>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        <Link
          href="/hotels"
          className="bg-[#FFC906] hover:bg-[#e6b500] text-[#1a1a1a] px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all hover:scale-105 shadow-md shadow-yellow-500/20"
        >
          Готелі
        </Link>
        
        {user ? (
          <>
            {(user.role === "ROLE_ADMIN" || user.role === "ROLE_MANAGER") ? (
              <Link href="/admin" className="text-white/70 hover:text-white transition-colors text-xs md:text-sm font-medium">Управління</Link>
            ) : (
              <Link href="/my-bookings" className="text-white/70 hover:text-white transition-colors text-xs md:text-sm font-medium">Мої бронювання</Link>
            )}

            <div className="flex items-center gap-2 md:gap-4 border-l border-white/10 pl-3 ml-1 md:pl-6 md:ml-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white text-sm font-medium">{user.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-white/50 hover:text-[#C8102E] transition-colors"
                title="Вийти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-[#C8102E] hover:bg-[#a00d25] text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-colors"
          >
            Увійти
          </Link>
        )}
      </div>
    </nav>
  );
}
