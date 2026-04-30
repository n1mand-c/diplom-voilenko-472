"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { MaskContainer } from "@/components/ui/svg-mask-effect";
import { MountainSnow, Rows2Icon, ArrowRight, Waves, Bike, MapPin, Youtube, Instagram, Facebook, Twitter } from "lucide-react";

const sports = [
  {
    icon: MountainSnow,
    title: "Лижі",
    subtitle: "Фрірайд",
    description: "Фрірайд у найвищих горах світу. Від Альп до Карпат – відкрий нову вершину екстриму.",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop",
    color: "from-blue-900 to-blue-600",
    tag: "ski",
  },
  {
    icon: MountainSnow,
    title: "Скелелазіння",
    subtitle: "Vertical Challenge",
    description: "Вертикальні виклики для справжніх професіоналів. Підкори кожен метр скелі.",
    image: "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=600&auto=format&fit=crop",
    color: "from-gray-900 to-gray-600",
    tag: "climbing",
  },
  {
    icon: Waves,
    title: "Дайвінг та кейвдайвінг",
    subtitle: "Deep Exploration",
    description: "Досліджуй найглибші океанські западини та підводні печери по всьому світу.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop",
    color: "from-blue-900 to-blue-600",
    tag: "diving",
  },
  {
    icon: Waves,
    title: "Рафтинг",
    subtitle: "Wild Water",
    description: "Підкорюй найбурхливіші гірські річки та відчуй справжню силу стихії на воді.",
    image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=600&auto=format&fit=crop",
    color: "from-cyan-900 to-cyan-600",
    tag: "rafting",
  },
  {
    icon: Waves,
    title: "Серфінг",
    subtitle: "Ocean Rider",
    description: "Лови найбільші хвилі світу. Найкращі споти для серфінгу вже чекають на тебе.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop",
    color: "from-teal-900 to-teal-600",
    tag: "surfing",
  },
  {
    icon: Bike,
    title: "Мотокрос",
    subtitle: "Dirt Track",
    description: "Швидкість, пил та круті віражі. Випробуй свої навички керування на максимум.",
    image: "https://img.redbull.com/images/c_crop,x_1000,y_0,h_3000,w_3500/c_fill,w_900,h_750/q_auto:low,f_auto/redbullcom/2018/07/17/65873810-4744-4b16-a6b9-fd1758350630/enduro-collection",
    color: "from-orange-900 to-amber-600",
    tag: "motocross",
  },
];

export default function HomePage() {
  const [marqueeHotels, setMarqueeHotels] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/hotels")
      .then(r => r.json())
      .then(d => { if (d.hotels?.length) setMarqueeHotels(d.hotels); });
      
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  // fallback static list while loading
  const ticker = marqueeHotels.length > 0 ? marqueeHotels : [
    { name: "Alpine Extreme Resort", location: "Шамоні, Франція", image_url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=120&auto=format&fit=crop" },
    { name: "Red Bull Base Camp", location: "Іннсбрук, Австрія", image_url: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=120&auto=format&fit=crop" },
    { name: "Powder Palace Hotel", location: "Зельден, Австрія", image_url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=120&auto=format&fit=crop" },
    { name: "Summit Climbers Lodge", location: "Доломіти, Італія", image_url: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=120&auto=format&fit=crop" },
    { name: "Glacier View Lodge", location: "Кіцбюель, Австрія", image_url: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=120&auto=format&fit=crop" },
  ];
  // duplicate for seamless loop
  const tickerFull = [...ticker, ...ticker];

  return (
    <div className="min-h-screen bg-transparent relative">
      <Navbar transparent />

      {/* Hero Section — marquee anchored to bottom so it's visible on first screen */}
      <div className="relative">
        <MaskContainer
          revealText={
            <div className="flex flex-col items-center text-center gap-6 px-4">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none mt-12">
                Red Bull<br />
                <span className="text-[#C8102E]">Hotel System</span>
              </h1>
              <p className="text-white/60 text-xl max-w-xl leading-relaxed">
                Це ексклюзивна платформа для бронювання готелів для любителів екстремального відпочинку.
              </p>
            </div>
          }
          className="bg-transparent"
        >
          <div className="flex flex-col items-center text-center gap-4 px-4 select-none">
            <p className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Насолоджуйся життям<br />
              <span className="text-white">разом з Red Bull</span>
            </p>
          </div>
        </MaskContainer>

        {/* Hotel Marquee — positioned above the bottom edge so it's not flush with the screen bottom */}
        <div className="absolute bottom-[12%] left-0 right-0 overflow-hidden border-y border-white/10 bg-[#0A0A0F]/80 backdrop-blur-sm">
          <div className="flex animate-marquee" style={{ width: 'max-content' }}>
            {tickerFull.map((hotel, idx) => (
              <Link key={idx} href="/hotels" className="flex-shrink-0 flex items-center gap-5 mx-10 py-5 transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-40 h-28 rounded-2xl object-cover border border-white/15 shadow-xl"
                />
                <div>
                  <div className="text-white text-lg font-bold leading-tight whitespace-nowrap">{hotel.name}</div>
                  <div className="text-white/50 text-sm flex items-center gap-1 whitespace-nowrap mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {hotel.location}
                  </div>
                </div>
                <span className="text-[#C8102E] ml-8 text-xl">✦</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <section className="px-4 pt-48 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#C8102E]/20 border border-[#C8102E]/30 px-6 py-2 md:px-8 md:py-3 rounded-full mb-6">
            <h2 className="text-3xl md:text-5xl font-bold text-[#C8102E]">
              Наша місія
            </h2>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Більше ніж просто <span className="text-[#C8102E]">готелі</span>
          </h2>
          <p className="text-white/60 text-xl leading-relaxed">
            Це ексклюзивна платформа для бронювання готелів для любителів екстремального відпочинку.
            Ми поєднуємо найвищий рівень комфорту з незабутнім досвідом пригод.
          </p>
        </div>
      </section>

      {/* Sports Catalog */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Обери <span className="text-[#C8102E]">свій спорт</span>
            </h2>
            <p className="text-white/50 text-lg">Знайди ідеальний готель для свого виду спорту</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <Link
                key={sport.tag}
                href={`/hotels?sport=${sport.tag}`}
                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-[#C8102E]/50 transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sport.image}
                    alt={sport.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#C8102E] rounded-full p-2">
                    <sport.icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-[#C8102E] text-xs font-semibold uppercase tracking-widest mb-1">{sport.subtitle}</div>
                  <h3 className="text-white text-2xl font-bold mb-3">{sport.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{sport.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-[#C8102E] text-sm font-medium group-hover:gap-3 transition-all">
                    Переглянути готелі
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 md:py-20 bg-[#001E62]/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 text-center">
          {[
            { value: "50+", label: "Готелів партнерів" },
            { value: "22", label: "Країн" },
            { value: "10K+", label: "Задоволених клієнтів" },
          ].map((stat) => {
            const content = (
              <>
                <div className="text-4xl font-black text-[#C8102E] mb-2">{stat.value}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </>
            );

            return stat.label === "Країн" ? (
              <a
                key={stat.label}
                href="https://www.youtube.com/watch?v=BI0iUBoKDEY"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer block"
              >
                {content}
              </a>
            ) : stat.label === "Задоволених клієнтів" ? (
              user ? (
                <Link
                  key={stat.label}
                  href="/redbull-ai.html"
                  className="cursor-pointer block"
                >
                  {content}
                </Link>
              ) : (
                <div key={stat.label}>
                  {content}
                </div>
              )
            ) : (
              <div key={stat.label}>
                {content}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Готовий до <span className="text-[#C8102E]">пригод?</span>
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Забронюй свій ідеальний готель для екстремального відпочинку прямо зараз.
          </p>
          <Link
            href="/hotels"
            className="inline-flex items-center gap-3 bg-[#C8102E] hover:bg-[#a00d25] text-white font-bold px-10 py-5 rounded-full text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-900/40 group"
          >
            Перейти до бронювання
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-8">
        {/* Social row */}
        <div className="px-8 py-10 text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-6">Red Bull у соцмережах</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* YouTube */}
            <a href="https://www.youtube.com/@redbull" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2.5 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/40 px-5 py-3 rounded-xl transition-all hover:scale-105">
              <Youtube className="w-5 h-5 text-white/50 group-hover:text-red-500 transition-colors" />
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">YouTube</span>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/redbull/" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2.5 bg-white/5 hover:bg-pink-600/20 border border-white/10 hover:border-pink-500/40 px-5 py-3 rounded-xl transition-all hover:scale-105">
              <Instagram className="w-5 h-5 text-white/50 group-hover:text-pink-400 transition-colors" />
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">Instagram</span>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/@redbull" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2.5 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 px-5 py-3 rounded-xl transition-all hover:scale-105">
              <svg className="w-5 h-5 text-white/50 group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
              </svg>
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">TikTok</span>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/redbull/" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 px-5 py-3 rounded-xl transition-all hover:scale-105">
              <Facebook className="w-5 h-5 text-white/50 group-hover:text-blue-400 transition-colors" />
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">Facebook</span>
            </a>
            {/* X / Twitter */}
            <a href="https://twitter.com/redbull" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 px-5 py-3 rounded-xl transition-all hover:scale-105">
              <Twitter className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">X (Twitter)</span>
            </a>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-white/5 px-8 py-5">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Red Bull Logo" className="h-6 w-auto" />
              <span className="text-white/50 font-medium text-sm">Red Bull Hotels</span>
            </div>
            <p className="text-white/25 text-sm">© 2026 Red Bull Hotel System. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
