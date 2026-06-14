"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ArrowLeft, Star, MapPin, Wifi, Dumbbell, Coffee, Mountain, CheckCircle, BedDouble, X, Send, Search, Check, Ban, ChevronLeft, ChevronRight, Users, DollarSign, Sparkles, Waves, CarFront, Car, Utensils, Wine, Wind, Tv } from "lucide-react";

const AMENITIES_ICONS: Record<string, React.ElementType> = {
  "WiFi": Wifi,
  "Басейн": Waves,
  "Спа": Sparkles,
  "Парковка": CarFront,
  "Сніданок": Coffee,
  "Тренажерний зал": Dumbbell,
  "Трансфер": Car,
  "Ресторан": Utensils,
  "Бар": Wine,
  "Кондиціонер": Wind,
  "Телевізор": Tv
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${(hovered || value) >= i ? "text-yellow-400" : "text-white/20"}`}
            fill={(hovered || value) >= i ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

export default function HotelDetailsPage() {
  const { id } = useParams();

  const [hotel, setHotel] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Availability checker state
  const [availCheckIn, setAvailCheckIn] = useState<string>("");
  const [availCheckOut, setAvailCheckOut] = useState<string>("");
  const [availResults, setAvailResults] = useState<any[] | null>(null);
  const [availLoading, setAvailLoading] = useState(false);
  // Room type expand
  const [expandedRoomType, setExpandedRoomType] = useState<number | null>(null);

  const checkAvailability = async () => {
    if (!availCheckIn || !availCheckOut) return;
    setAvailLoading(true);
    try {
      const res = await fetch(`/api/hotels/${id}/availability?checkIn=${availCheckIn}&checkOut=${availCheckOut}`);
      const data = await res.json();
      setAvailResults(data.availability || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAvailLoading(false);
    }
  };

  const fetchHotel = useCallback(() => {
    if (!id) return;
    fetch(`/api/hotels/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.hotel) {
          setHotel(data.hotel);
          setRoomTypes(data.roomTypes || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchReviews = useCallback(() => {
    if (!id) return;
    fetch(`/api/hotels/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data.reviews || []));
  }, [id]);

  useEffect(() => {
    fetchHotel();
    fetchReviews();
  }, [fetchHotel, fetchReviews]);

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) return;
    setReviewSending(true);
    try {
      const res = await fetch(`/api/hotels/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        setReviewRating(0);
        setReviewComment("");
        fetchReviews();
        fetchHotel(); // refresh rating
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } finally {
      setReviewSending(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-transparent pt-32 text-center text-white/50 animate-pulse">Завантаження готелю...</div>;
  if (!hotel) return <div className="min-h-screen bg-transparent pt-32 text-center text-white/50">Готель не знайдено</div>;

  const parsedImages: string[] = Array.isArray(hotel.images) ? hotel.images.filter(Boolean) : [];

  const goLightbox = (dir: number) => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + dir + parsedImages.length) % parsedImages.length);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />


      {/* Gallery Lightbox with navigation */}
      {lightboxIndex !== null && parsedImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/97 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goLightbox(diff > 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          <button onClick={() => setLightboxIndex(null)} className="absolute top-5 right-5 z-10 text-white/50 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/40 px-4 py-1.5 rounded-full">
            {lightboxIndex + 1} / {parsedImages.length}
          </div>
          {/* Prev */}
          {parsedImages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); goLightbox(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={parsedImages[lightboxIndex]}
            alt={`Фото ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
            onClick={e => e.stopPropagation()}
            draggable={false}
          />
          {/* Next */}
          {parsedImages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); goLightbox(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          {/* Dot indicators */}
          {parsedImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {parsedImages.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full mt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hotel.image_url} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-16">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <Link href="/hotels" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Назад до списку
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#C8102E] text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {hotel.sport_label}
                  </span>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-2 text-white/70 text-lg">
                  <MapPin className="w-5 h-5" />
                  <span>{hotel.location}</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-end">
                <div className="text-white/60 text-sm mb-1">Від</div>
                <div className="text-3xl font-black text-[#C8102E] mb-4">{Number(hotel.price).toLocaleString()} ₴ <span className="text-lg font-normal text-white/50">/ ніч</span></div>
                <Link
                  href={`/booking?hotelId=${hotel.id}`}
                  className="bg-[#C8102E] hover:bg-[#a00d25] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#C8102E]/20"
                >
                  Забронювати зараз
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Gallery */}
          {parsedImages.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Галерея ({parsedImages.length} фото)</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {parsedImages.map((img: string, idx: number) => (
                  <div key={idx} onClick={() => setLightboxIndex(idx)} className="relative h-32 md:h-48 rounded-xl overflow-hidden cursor-pointer border border-white/10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${hotel.name} - фото ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs bg-black/50 px-3 py-1.5 rounded-full">Переглянути</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Про готель</h2>
            <p className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap">{hotel.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Типи номерів</h2>
            <div className="space-y-3">
              {roomTypes.length > 0 ? roomTypes.map(rt => {
                const isExpanded = expandedRoomType === rt.id;
                return (
                  <div key={rt.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'border-[#C8102E]/40 bg-white/8' : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}>
                    {/* Header — always visible */}
                    <button
                      onClick={() => setExpandedRoomType(isExpanded ? null : rt.id)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isExpanded ? 'bg-[#C8102E]/30' : 'bg-[#C8102E]/20'
                        }`}>
                          <BedDouble className="w-5 h-5 text-[#C8102E]" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base">{rt.name}</h3>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-white/50">
                            <span>До {rt.capacity} осіб</span>
                            <span className="text-[#C8102E] font-semibold">{(Number(hotel.price) + Number(rt.extra_price || 0)).toLocaleString()} ₴/ніч</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-white/30 transition-transform duration-300 ${
                        isExpanded ? 'rotate-90 text-[#C8102E]' : ''
                      }`} />
                    </button>

                    {/* Expanded details panel */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-black/30 rounded-xl p-3">
                            <div className="text-white/40 text-xs mb-1">Місткість</div>
                            <div className="text-white font-semibold flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" /> {rt.capacity} осіб
                            </div>
                          </div>
                          {rt.total_rooms > 0 && (
                            <div className="bg-black/30 rounded-xl p-3">
                              <div className="text-white/40 text-xs mb-1">Кімнат цього типу</div>
                              <div className="text-white font-semibold">{rt.total_rooms} шт.</div>
                            </div>
                          )}
                          <div className="bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-xl p-3">
                            <div className="text-white/40 text-xs mb-1">Ціна</div>
                            <div className="text-[#C8102E] font-bold">{(Number(hotel.price) + Number(rt.extra_price || 0)).toLocaleString()} ₴<span className="text-xs font-normal text-[#C8102E]/70">/ніч</span></div>
                          </div>
                        </div>
                        {rt.amenities && Array.isArray(rt.amenities) && rt.amenities.length > 0 && (
                          <div>
                            <div className="text-white/40 text-xs mb-2 uppercase tracking-wider">Зручності номера</div>
                            <div className="flex flex-wrap gap-2">
                              {rt.amenities.map((am: string) => {
                                const Icon = AMENITIES_ICONS[am] || CheckCircle;
                                return (
                                  <span key={am} className="flex items-center gap-1.5 bg-white/8 border border-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">
                                    <Icon className="w-3 h-3 text-[#C8102E]" />{am}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="text-white/40">Немає доступних номерів для цього готелю.</div>
              )}
            </div>
          </section>

          {/* Availability Checker Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Перевірити наявність номерів</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="text-white/50 text-sm mb-1.5 block">Дата заїзду</label>
                  <DatePicker
                    date={availCheckIn ? new Date(availCheckIn) : undefined}
                    setDate={(d) => setAvailCheckIn(d ? format(d, 'yyyy-MM-dd') : "")}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-white/50 text-sm mb-1.5 block">Дата виїзду</label>
                  <DatePicker
                    date={availCheckOut ? new Date(availCheckOut) : undefined}
                    setDate={(d) => setAvailCheckOut(d ? format(d, 'yyyy-MM-dd') : "")}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={checkAvailability}
                    disabled={!availCheckIn || !availCheckOut || availLoading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#a00d25] disabled:opacity-50 text-white font-bold h-11 px-8 rounded-xl transition-colors"
                  >
                    {availLoading ? "Пошук..." : <><Search className="w-4 h-4" /> Знайти</>}
                  </button>
                </div>
              </div>

              {availResults && (
                <div className="space-y-4 border-t border-white/5 pt-6">
                  {availResults.length === 0 ? (
                    <div className="text-white/50 text-center py-4">Немає доступних типів номерів.</div>
                  ) : (
                    availResults.map(rt => (
                      <div key={rt.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <div className="text-white font-bold text-lg">{rt.name}</div>
                          <div className="text-white/50 text-sm mb-2">до {rt.capacity} гостей • <span className="text-[#C8102E] font-semibold">{(Number(hotel.price) + Number(rt.extraPrice || 0)).toLocaleString()} ₴/ніч</span></div>
                          {rt.available > 0 ? (
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                              <Check className="w-4 h-4" /> Є вільні номери ({rt.available} шт.)
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                              <Ban className="w-4 h-4" /> На ці дати повністю заброньовано
                            </div>
                          )}
                        </div>
                        <Link
                          href={rt.available > 0 ? `/booking?hotelId=${hotel.id}&roomTypeId=${rt.id}&checkIn=${availCheckIn}&checkOut=${availCheckOut}` : "#"}
                          className={`shrink-0 px-6 py-2.5 rounded-xl font-medium transition-all ${
                            rt.available > 0 
                              ? "bg-[#C8102E] hover:bg-[#a00d25] text-white border border-[#C8102E]" 
                              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                          }`}
                          onClick={e => rt.available <= 0 && e.preventDefault()}
                        >
                          Забронювати
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Відгуки ({reviews.length})</h2>

            {/* Add review form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-white font-bold mb-4">Залишити відгук</h3>
              <form onSubmit={handleSendReview} className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Ваша оцінка</label>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Коментар (необов&apos;язково)</label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Розкажіть про ваш досвід..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none placeholder:text-white/30 focus:border-[#C8102E]/50 transition-colors"
                  />
                </div>
                {reviewSuccess && (
                  <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Дякуємо за відгук!
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!reviewRating || reviewSending}
                  className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d25] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {reviewSending ? "Надсилання..." : "Надіслати відгук"}
                </button>
              </form>
            </div>

            {/* Review list */}
            {reviews.length === 0 ? (
              <p className="text-white/40 text-center py-8">Ще немає відгуків. Будьте першим!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center text-[#C8102E] font-bold">
                          {r.guest_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{r.guest_name}</div>
                          <div className="text-white/30 text-xs">{new Date(r.created_at).toLocaleDateString("uk-UA")}</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= r.rating ? "text-yellow-400" : "text-white/20"}`} fill={i <= r.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-white/60 text-sm leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Рейтинг</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-black text-white">{Number(hotel.rating || 0).toFixed(1)}</div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(hotel.rating || 0)) ? "text-yellow-400" : "text-white/20"}`} fill={i < Math.floor(Number(hotel.rating || 0)) ? "currentColor" : "none"} />
                  ))}
                </div>
                <div className="text-white/50 text-sm">На основі {hotel.reviews ?? 0} відгуків</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Зручності</h3>
            <ul className="space-y-4 text-white/70">
              {hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 ? (
                hotel.amenities.map((am: string) => {
                  const Icon = AMENITIES_ICONS[am] || CheckCircle;
                  return (
                    <li key={am} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#C8102E]" /> {am}
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="flex items-center gap-3"><Wifi className="w-5 h-5 text-[#C8102E]" /> Швидкісний Wi-Fi</li>
                  <li className="flex items-center gap-3"><Dumbbell className="w-5 h-5 text-[#C8102E]" /> Фітнес зона</li>
                  <li className="flex items-center gap-3"><Coffee className="w-5 h-5 text-[#C8102E]" /> Ресторан & Бар</li>
                  <li className="flex items-center gap-3"><Mountain className="w-5 h-5 text-[#C8102E]" /> Доступ до спорту</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
