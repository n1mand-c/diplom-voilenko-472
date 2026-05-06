"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { ArrowLeft, Star, MapPin, Wifi, Dumbbell, Coffee, Mountain, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const hotels = [
  {
    id: 1,
    name: "Alpine Extreme Resort",
    location: "Шамоні, Франція",
    sport: "ski",
    sportLabel: "Лижі / Фрірайд",
    stars: 5,
    price: 4200,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop",
    amenities: ["wifi", "gym", "coffee", "mountain"],
    description: "Преміальний гірськолижний курорт у серці Монблану. Прямий доступ до трас.",
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 2,
    name: "Summit Climbers Lodge",
    location: "Доломіти, Італія",
    sport: "climbing",
    sportLabel: "Скелелазіння",
    stars: 4,
    price: 2800,
    image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&auto=format&fit=crop",
    amenities: ["wifi", "gym", "coffee"],
    description: "Спеціалізований готель для альпіністів з власним скеледромом і тренерами.",
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 3,
    name: "Powder Palace Hotel",
    location: "Зельден, Австрія",
    sport: "ski",
    sportLabel: "Лижі / Фрірайд",
    stars: 5,
    price: 3800,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop",
    amenities: ["wifi", "gym", "coffee", "mountain"],
    description: "Снобордичний рай з доступом до найкращих парків та свіжого пухляку.",
    rating: 4.8,
    reviews: 247,
  },
  {
    id: 4,
    name: "Vertical Spirit Hotel",
    location: "Барселона, Іспанія",
    sport: "climbing",
    sportLabel: "Скелелазіння",
    stars: 4,
    price: 2100,
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&auto=format&fit=crop",
    amenities: ["wifi", "coffee"],
    description: "Компактний бутик-готель у скелястому регіоні Монтсеррат.",
    rating: 4.5,
    reviews: 98,
  },
  {
    id: 5,
    name: "Red Bull Base Camp",
    location: "Іннсбрук, Австрія",
    sport: "ski",
    sportLabel: "Лижі / Фрірайд",
    stars: 4,
    price: 3100,
    image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&auto=format&fit=crop",
    amenities: ["wifi", "gym", "mountain"],
    description: "Офіційний партнер Red Bull. Готель де зупиняються спортивні зірки.",
    rating: 4.9,
    reviews: 521,
  },
  {
    id: 6,
    name: "Glacier View Lodge",
    location: "Кіцбюель, Австрія",
    sport: "ski",
    sportLabel: "Лижі / Фрірайд",
    stars: 5,
    price: 5200,
    image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&auto=format&fit=crop",
    amenities: ["wifi", "gym", "coffee", "mountain"],
    description: "Ультра-люкс готель з панорамним видом на льодовик. Exclusive для екстремалів.",
    rating: 5.0,
    reviews: 78,
  },
];

const amenityIcons = {
  wifi: <Wifi className="w-3 h-3" />,
  gym: <Dumbbell className="w-3 h-3" />,
  coffee: <Coffee className="w-3 h-3" />,
  mountain: <Mountain className="w-3 h-3" />,
};

const sportFilters = [
  { value: "all", label: "Усі" },
  { value: "ski", label: "Лижі" },
  { value: "climbing", label: "Скелелазіння" },
  { value: "diving", label: "Дайвінг та кейвдайвінг" },
  { value: "rafting", label: "Рафтинг" },
  { value: "surfing", label: "Серфінг" },
  { value: "motocross", label: "Мотокрос" },
];

function HotelCard({ hotel }: { hotel: any }) {
  const allImages = [hotel.image_url, ...(Array.isArray(hotel.images) ? hotel.images : [])].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    } else if (diff < -50) {
      setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
    setTouchStart(null);
  };

  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group bg-white/5 border border-white/10 hover:border-[#C8102E]/40 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:bg-white/10 block"
    >
      <div
        className="relative h-48 overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allImages.map((img, i) => (
            <div key={i} className="min-w-full h-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${hotel.name} - ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 via-transparent" />
        <div className="absolute top-3 left-3 bg-[#C8102E] text-white text-xs px-2 py-1 rounded-full font-medium z-10">
          {hotel.sport_label}
        </div>
        <div className="absolute top-3 right-3 flex z-10">
          {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-yellow-400 drop-shadow-md" fill="currentColor" />
          ))}
        </div>

        {allImages.length > 1 && (
          <>
            {/* Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-5 h-5 pl-0.5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-lg leading-tight">{hotel.name}</h3>
          <div className="text-right ml-4 flex-shrink-0">
            <div className="text-[#C8102E] font-black text-lg">{Number(hotel.price).toLocaleString()} ₴</div>
            <div className="text-white/30 text-xs">за ніч</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/40 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span>{hotel.location}</span>
        </div>
        <p className="text-white/50 text-sm mb-4 leading-relaxed line-clamp-2">{hotel.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
              <Star className="w-3 h-3" fill="currentColor" />
              {Number(hotel.rating).toFixed(1)}
            </div>
            <span className="text-white/30 text-xs">({hotel.reviews} відгуків)</span>
          </div>
        </div>
        <div className="mt-4 block w-full bg-[#C8102E] hover:bg-[#a00d25] text-white text-center py-2.5 rounded-xl text-sm font-medium transition-colors">
          Детальніше
        </div>
      </div>
    </Link>
  );
}

export default function HotelsPage() {
  const [selectedSport, setSelectedSport] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hotels${selectedSport !== "all" ? `?sport=${selectedSport}` : ""}`)
      .then(res => res.json())
      .then(data => {
        if (data.hotels) setHotels(data.hotels);
        setLoading(false);
      });
  }, [selectedSport]);

  const filtered = hotels
    .filter((h) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        h.name?.toLowerCase().includes(q) ||
        h.location?.toLowerCase().includes(q) ||
        h.description?.toLowerCase().includes(q) ||
        h.sport_label?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price") return Number(a.price) - Number(b.price);
      if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
      return 0;
    });

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">
            Готелі для <span className="text-[#C8102E]">екстремалів</span>
          </h1>
          <p className="text-white/50 mb-6">Знайдіть ідеальне місце для вашої наступної пригоди</p>
          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою, містом або видом спорту..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C8102E]/50 transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Фільтри:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sportFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setSelectedSport(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedSport === f.value
                    ? "bg-[#C8102E] text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white/40 text-sm">Сортувати:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="rating" className="bg-[#1a1a2e]">За рейтингом</option>
              <option value="price" className="bg-[#1a1a2e]">За ціною</option>
            </select>
          </div>
        </div>

        {/* Hotel Grid */}
        {loading ? (
          <div className="text-center py-20 text-white/50 animate-pulse">Завантаження готелів...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <Mountain className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Готелів за цим фільтром не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
