"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Input } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ArrowLeft, Zap, CheckCircle, CreditCard, Banknote, LogIn, UserPlus, Hotel, Users, Search, X, Plus, Clock } from "lucide-react";

function BookingForm() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotelId");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    checkIn: "", checkOut: "", guests: "1",
    roomTypeId: "",
    paymentMethod: "card",
    cardNumber: "", cardExpiry: "", cardCvv: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);

  // Split payment state
  const [isSplitting, setIsSplitting] = useState(false);
  const [splits, setSplits] = useState<{ username: string; percentage: number; payNow: boolean; paymentMethod: string; found: boolean | null }[]>([]);
  const [splitSearch, setSplitSearch] = useState("");
  const [splitSearchResults, setSplitSearchResults] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem('redbull_discount_10') === 'true') {
        setHasDiscount(true);
      }
    }
  }, []);

  const [hotel, setHotel] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [availLoading, setAvailLoading] = useState(false);

  // Auth gate
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        setIsAuthed(!!data.user);
        setAuthChecked(true);
      })
      .catch(() => { setIsAuthed(false); setAuthChecked(true); });
  }, []);

  useEffect(() => {
    if (hotelId) {
      fetch(`/api/hotels`)
        .then(res => res.json())
        .then(data => {
          const h = data.hotels?.find((x: any) => x.id.toString() === hotelId);
          if (h) setHotel(h);
        });

      fetch(`/api/room-types?hotelId=${hotelId}`)
        .then(res => res.json())
        .then(data => {
          if (data.roomTypes) {
            setRoomTypes(data.roomTypes);
            if (data.roomTypes.length > 0) {
              setForm(f => ({ ...f, roomTypeId: data.roomTypes[0].id.toString() }));
            }
          }
        });
    }

    // Auto-fill user details from their latest booking if available
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        if (data.bookings && data.bookings.length > 0) {
          const latest = data.bookings[0];
          const [first = "", ...rest] = (latest.guest_name || "").split(" ");
          setForm(f => ({
            ...f,
            firstName: f.firstName || first,
            lastName: f.lastName || rest.join(" "),
            email: f.email || latest.guest_email || "",
            phone: f.phone || latest.guest_phone || ""
          }));
        }
      })
      .catch(console.error);
  }, [hotelId]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Fetch availability whenever dates change
  useEffect(() => {
    if (hotelId && form.checkIn && form.checkOut && new Date(form.checkOut) > new Date(form.checkIn)) {
      setAvailLoading(true);
      fetch(`/api/hotels/${hotelId}/availability?checkIn=${form.checkIn}&checkOut=${form.checkOut}`)
        .then(res => res.json())
        .then(data => setAvailability(data.availability || []))
        .catch(console.error)
        .finally(() => setAvailLoading(false));
    } else {
      setAvailability([]);
    }
  }, [hotelId, form.checkIn, form.checkOut]);

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(0, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000))
      : 0;
      
  const selectedRoomType = roomTypes.find(rt => rt.id.toString() === form.roomTypeId);
  const basePrice = Number(hotel?.price || 0);
  const extraPrice = Number(selectedRoomType?.extra_price || 0);
  const pricePerNight = basePrice + extraPrice;
  const rawTotal = nights * pricePerNight;
  const total = hasDiscount ? rawTotal * 0.9 : rawTotal;

  // Split logic
  const totalFriendsPct = splits.reduce((s, x) => s + x.percentage, 0);
  const mySharePct = 100 - totalFriendsPct;

  const handleSearchUser = async (q: string) => {
    setSplitSearch(q);
    if (q.length < 2) { setSplitSearchResults([]); return; }
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSplitSearchResults(data.users || []);
  };

  const addSplit = (username: string) => {
    if (splits.find(s => s.username === username)) return;
    const remaining = Math.max(1, 100 - totalFriendsPct - 50);
    setSplits(prev => [...prev, { username, percentage: prev.length === 0 ? 50 : 25, payNow: false, paymentMethod: 'card', found: true }]);
    setSplitSearch("");
    setSplitSearchResults([]);
  };

  const removeSplit = (idx: number) => setSplits(prev => prev.filter((_, i) => i !== idx));

  const updatePct = (idx: number, val: number) => {
    setSplits(prev => prev.map((s, i) => i === idx ? { ...s, percentage: val } : s));
  };

  const handleStep1To2 = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      return setError("Всі контактні дані обов'язкові для заповнення");
    }
    if (!form.email.includes("@")) {
      return setError("Email повинен містити символ @");
    }
    setError("");
    setStep(2);
  };

  const handleStep2To3 = () => {
    if (!form.checkIn || !form.checkOut || !form.roomTypeId) {
      return setError("Будь ласка, оберіть номер та дати проживання");
    }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      return setError("Дата виїзду має бути після дати заїзду");
    }
    const avail = availability.find(a => a.id.toString() === form.roomTypeId);
    if (avail && avail.available <= 0) {
      return setError("Обраний тип номеру повністю заброньовано на ці дати");
    }
    setError("");
    setStep(3);
  };

  const handleSubmit = async () => {
    if (form.paymentMethod === "card") {
      if (!form.cardNumber.trim() || !form.cardExpiry.trim() || !form.cardCvv.trim()) {
        return setError("Всі поля картки обов'язкові для заповнення");
      }
      if (form.cardNumber.replace(/\s/g, "").length < 16) {
        return setError("Некоректний номер картки");
      }
    }
    
    if (isSplitting) {
      if (splits.length === 0) return setError("Додайте учасників для розділення оплати");
      if (totalFriendsPct >= 100) return setError("Сума відсотків друзів не може бути 100% або більше (ви маєте сплатити хоча б 1%)");
    }

    try {
      setLoading(true);
      setError("");
      
      const payload = {
        hotelId,
        guestName: `${form.firstName} ${form.lastName}`,
        guestEmail: form.email,
        guestPhone: form.phone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guestsCount: parseInt(form.guests),
        roomTypeId: form.roomTypeId,
        paymentMethod: form.paymentMethod,
        totalPrice: total,
        discountApplied: hasDiscount ? 1 : 0,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Помилка бронювання (можливо ви не авторизовані)");
      const newBookingId = data.bookingId;
      
      if (isSplitting && splits.length > 0) {
        // Also add the current user as 'paid' for their share, wait, NO! 
        // The current user paid the whole total_price minus splits. The backend handles this.
        const splitRes = await fetch(`/api/bookings/${newBookingId}/splits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ splits })
        });
        const splitData = await splitRes.json();
        if (!splitRes.ok) throw new Error(splitData.error || "Бронювання створено, але виникла помилка при створенні сплітів");
      }
      
      if (hasDiscount) {
        localStorage.removeItem('redbull_discount_10');
        localStorage.setItem('redbull_discount_used_permanently', 'true');
      }
      setBookingId(newBookingId);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auth gate — show while checking
  if (!authChecked) return (
    <div className="py-32 text-center text-white/50 animate-pulse">Перевірка авторизації...</div>
  );

  // Auth gate — not logged in
  if (!isAuthed) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-[#C8102E]/20 border border-[#C8102E]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-10 h-10 text-[#C8102E]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Потрібна авторизація</h2>
        <p className="text-white/50 mb-8 leading-relaxed">
          Для бронювання готелю необхідно зареєструватися або увійти у свій акаунт Red Bull Hotels.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#a00d25] text-white font-bold px-6 py-3.5 rounded-xl transition-all hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            Зареєструватися
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl border border-white/10 transition-all hover:scale-105"
          >
            <LogIn className="w-5 h-5" />
            Увійти в акаунт
          </Link>
          <Link
            href="/hotels"
            className="flex items-center justify-center gap-2 text-white/40 hover:text-white/70 px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <Hotel className="w-4 h-4" />
            Повернутися до готелів
          </Link>
        </div>
      </div>
    </div>
  );

  if (!hotel) return <div className="py-32 text-center text-white/50 animate-pulse">Завантаження готелю...</div>;

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-20">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white mb-3">Бронювання підтверджено! 🎉</h1>
        <p className="text-white/50 mb-8">Деталі надіслано на ваш email. Готуйся до пригод!</p>
        <Link href="/my-bookings" className="bg-[#C8102E] hover:bg-[#a00d25] text-white px-8 py-3 rounded-full font-medium transition-colors">
          Перейти в Мої бронювання
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 pb-12">
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center font-medium">{error}</div>}
      
      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= s ? "bg-[#C8102E] text-white" : "bg-white/10 text-white/40"
            }`}>
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm ${step >= s ? "text-white" : "text-white/30"}`}>
              {s === 1 ? "Гість" : s === 2 ? "Номери & Дати" : "Оплата"}
            </span>
            {s < 3 && <div className={`w-16 h-px ${step > s ? "bg-[#C8102E]" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Дані гостя</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-sm mb-1.5 block">Ім&apos;я</label>
                    <input name="firstName" value={form.firstName} onChange={handle}
                      placeholder="Іван" className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                  </div>
                  <div>
                    <label className="text-white/50 text-sm mb-1.5 block">Прізвище</label>
                    <input name="lastName" value={form.lastName} onChange={handle}
                      placeholder="Петренко" className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                  </div>
                  <div>
                    <label className="text-white/50 text-sm mb-1.5 block">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handle}
                      placeholder="ivan@example.com" className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                  </div>
                  <div>
                    <label className="text-white/50 text-sm mb-1.5 block">Телефон</label>
                    <input name="phone" value={form.phone} onChange={handle}
                      placeholder="+38 050 000 0000" className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                  </div>
                </div>
                <button onClick={handleStep1To2} className="mt-6 w-full bg-[#C8102E] hover:bg-[#a00d25] text-white py-3 rounded-xl font-medium transition-colors">
                  Далі →
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Номери & Дати</h2>
                <div className="space-y-4">
                  {roomTypes.length > 0 && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-white/50 text-sm mb-1.5 block">Тип номеру</label>
                        {availLoading && <span className="text-[#C8102E] text-xs font-bold animate-pulse">Перевірка вільних місць...</span>}
                      </div>
                      <select name="roomTypeId" value={form.roomTypeId} onChange={handle}
                        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                        {roomTypes.map(rt => {
                          const avail = availability.find(a => a.id === rt.id);
                          const isSoldOut = avail && avail.available <= 0;
                          const availText = avail ? (isSoldOut ? ' [🚫 Повністю заброньовано]' : ` [✅ Вільно: ${avail.available}]`) : '';
                          return (
                            <option key={rt.id} value={rt.id} disabled={isSoldOut}>
                              {rt.name} (до {rt.capacity} місць) {Number(rt.extra_price) > 0 ? `+${Number(rt.extra_price)} ₴` : ""} {availText}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-sm mb-1.5 block">Дата заїзду</label>
                      <DatePicker
                        date={form.checkIn ? new Date(form.checkIn) : undefined}
                        setDate={(d) => setForm({ ...form, checkIn: d ? format(d, 'yyyy-MM-dd') : "" })}
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-sm mb-1.5 block">Дата виїзду</label>
                      <DatePicker
                        date={form.checkOut ? new Date(form.checkOut) : undefined}
                        setDate={(d) => setForm({ ...form, checkOut: d ? format(d, 'yyyy-MM-dd') : "" })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-white/50 text-sm mb-1.5 block">Кількість гостей</label>
                    <Input 
                      value={parseInt(form.guests)} 
                      onChange={(val) => setForm({ ...form, guests: val.toString() })} 
                      min={1} 
                      max={selectedRoomType?.capacity || 4} 
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-3 rounded-xl text-sm transition-colors">← Назад</button>
                  <button onClick={handleStep2To3} className="flex-1 bg-[#C8102E] hover:bg-[#a00d25] text-white py-3 rounded-xl font-medium transition-colors">Далі →</button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Спосіб оплати</h2>
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setForm({ ...form, paymentMethod: "card" })}
                    className={`flex-1 flex items-center gap-2 p-4 rounded-xl border transition-all ${
                      form.paymentMethod === "card" ? "border-[#C8102E] bg-[#C8102E]/10" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#C8102E]" />
                    <span className="text-white text-sm font-medium">Картка</span>
                  </button>
                  <button
                    onClick={() => setForm({ ...form, paymentMethod: "transfer" })}
                    className={`flex-1 flex items-center gap-2 p-4 rounded-xl border transition-all ${
                      form.paymentMethod === "transfer" ? "border-[#C8102E] bg-[#C8102E]/10" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#C8102E]" />
                    <span className="text-white text-sm font-medium">Переказ</span>
                  </button>
                </div>

                {form.paymentMethod === "card" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/50 text-sm mb-1.5 block">Номер картки</label>
                      <input name="cardNumber" value={form.cardNumber} onChange={handle}
                        placeholder="0000 0000 0000 0000" maxLength={19}
                        className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-sm mb-1.5 block">Термін дії</label>
                        <input name="cardExpiry" value={form.cardExpiry} onChange={handle}
                          placeholder="ММ/РР" maxLength={5}
                          className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                      </div>
                      <div>
                        <label className="text-white/50 text-sm mb-1.5 block">CVV</label>
                        <input name="cardCvv" type="password" value={form.cardCvv} onChange={handle}
                          placeholder="•••" maxLength={3}
                          className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#C8102E]/50"/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#001E62]/30 border border-[#001E62]/50 rounded-xl space-y-2 text-sm">
                    <p className="text-white/70"><strong className="text-white">IBAN:</strong> UA12 3456 7890 1234 5678 90</p>
                    <p className="text-white/70"><strong className="text-white">Банк:</strong> ПриватБанк</p>
                    <p className="text-white/70"><strong className="text-white">Призначення:</strong> Оплата за готель {hotel.name} ({nights} ноч.)</p>
                  </div>
                )}
                {/* SPLIT TOGGLE */}
                <div className="mt-8 flex items-center gap-3 mb-6 bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="flex-1">
                    <div className="text-white font-bold mb-1 flex items-center gap-2">Розділити з друзями <Users className="w-4 h-4 text-[#C8102E]" /></div>
                    <div className="text-white/50 text-xs">Надіслати запит на оплату частини суми іншим користувачам</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isSplitting} onChange={e => setIsSplitting(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C8102E]"></div>
                  </label>
                </div>

                {isSplitting && (
                  <div className="mb-6 p-5 border border-[#C8102E]/30 bg-[#C8102E]/5 rounded-xl space-y-4">
                    <div className="text-white font-bold flex items-center gap-2 mb-2">Учасники</div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                        <Search className="w-4 h-4 text-white/30" />
                        <input value={splitSearch} onChange={e => handleSearchUser(e.target.value)} placeholder="Пошук за логіном..." className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"/>
                      </div>
                      {splitSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                          {splitSearchResults.map(u => (
                            <button key={u.id} onClick={() => addSplit(u.username)} className="w-full text-left px-4 py-3 text-white text-sm hover:bg-white/5 flex items-center gap-2 transition-colors">
                              <div className="w-6 h-6 rounded-full bg-[#C8102E]/20 flex items-center justify-center text-[#C8102E] text-xs font-bold">{u.username[0].toUpperCase()}</div>
                              {u.username}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {splits.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-2">Знайдіть друзів за логіном</p>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {splits.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="text-white text-sm font-medium flex-1">{s.username}</div>
                            <div className="flex items-center gap-2">
                              <input type="range" min={1} max={99} value={s.percentage} onChange={e => updatePct(idx, Number(e.target.value))} className="w-24 accent-[#C8102E] hidden sm:block" />
                              <input type="number" min={1} max={99} value={s.percentage} onChange={e => updatePct(idx, Number(e.target.value))} className="w-14 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-center text-white outline-none text-sm"/>
                              <span className="text-white/50 text-sm">%</span>
                            </div>
                            <button onClick={() => removeSplit(idx)} className="text-white/30 hover:text-red-400 p-1 transition-colors"><X className="w-4 h-4"/></button>
                          </div>
                        ))}
                        
                        <div className="pt-3 border-t border-white/10 mt-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/60">Ваша частка (до сплати зараз):</span>
                            <span className={`font-bold ${mySharePct <= 0 ? "text-red-400" : "text-green-400"}`}>
                              {mySharePct}% ({((mySharePct / 100) * total).toLocaleString()} ₴)
                            </span>
                          </div>
                          {mySharePct <= 0 && <div className="text-red-400 text-xs text-right mt-1">Ви маєте сплатити хоча б 1%</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-3 rounded-xl text-sm transition-colors">← Назад</button>
                  <button disabled={loading} onClick={handleSubmit}
                    className="flex-1 bg-[#C8102E] hover:bg-[#a00d25] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                    {loading ? "Зачекайте..." : "Підтвердити оплату ✓"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hotel.image_url} alt={hotel.name} className="w-full h-36 object-cover rounded-xl mb-4"/>
            <h3 className="text-white font-bold mb-1">{hotel.name}</h3>
            <p className="text-white/40 text-sm mb-4">{hotel.location} ⭐ {Number(hotel.rating || 4).toFixed(1)}</p>
            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-white/60">
                <span>Базова ціна:</span>
                <span>{basePrice.toLocaleString()} ₴</span>
              </div>
              {selectedRoomType && Number(selectedRoomType.extra_price) > 0 && (
                <div className="flex justify-between text-white/60">
                  <span>Доплата ({selectedRoomType.name}):</span>
                  <span>+{extraPrice.toLocaleString()} ₴</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Ночей:</span>
                <span>{nights}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-[#C8102E] font-bold">
                  <span>Знижка Red Bull (10%):</span>
                  <span>-{(rawTotal * 0.1).toLocaleString()} ₴</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10 mt-2">
                <span>До сплати:</span>
                <span className="text-[#FFC906]">{total.toLocaleString()} ₴</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <Suspense fallback={<div className="py-32 text-center text-white/50">Завантаження...</div>}>
         <BookingForm />
      </Suspense>
    </div>
  );
}
