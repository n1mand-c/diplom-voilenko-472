"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { ArrowRight, MapPin, CalendarDays, CheckCircle, Clock, XCircle, Users, CreditCard, Banknote, AlertCircle } from "lucide-react";

const getStatusBadge = (status: string) => {
  if (status === "confirmed") return <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20"><CheckCircle className="w-3.5 h-3.5" /> Підтверджено</span>;
  if (status === "pending") return <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20"><Clock className="w-3.5 h-3.5" /> Очікує</span>;
  if (status === "cancelled") return <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20"><XCircle className="w-3.5 h-3.5" /> Скасовано</span>;
  return null;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<{ splitId: number; amount: number } | null>(null);
  const [payMethod, setPayMethod] = useState<"card" | "transfer">("card");
  const [payLoading, setPayLoading] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "" });
  const [cardError, setCardError] = useState("");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/bookings").then(res => { if (res.status === 401) window.location.href = "/login"; return res.json(); }),
      fetch("/api/splits").then(res => res.json()),
    ]).then(([bData, sData]) => {
      if (bData.bookings) setBookings(bData.bookings);
      if (sData.splits) setSplits(sData.splits);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async () => {
    if (!payModal) return;
    
    if (payMethod === "card") {
      if (!cardForm.number.trim() || !cardForm.expiry.trim() || !cardForm.cvv.trim()) {
        return setCardError("Всі поля картки обов'язкові для заповнення");
      }
      if (cardForm.number.replace(/\s/g, "").length < 16) {
        return setCardError("Некоректний номер картки");
      }
    }

    setCardError("");
    setPayLoading(true);
    try {
      const res = await fetch(`/api/splits/${payModal.splitId}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: payMethod }),
      });
      if (res.ok) {
        setPayModal(null);
        fetchData();
      }
    } finally {
      setPayLoading(false);
    }
  };

  const pendingSplits = splits.filter(s => s.status === "pending");
  const paidSplits = splits.filter(s => s.status === "paid");

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-28">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">Мої бронювання</h1>
          <p className="text-white/50">Історія ваших подорожей з Red Bull Hotels</p>
        </div>

        {loading ? (
          <div className="text-white/50 text-center py-20 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-8 w-auto animate-pulse mb-4" />
            Завантаження...
          </div>
        ) : (
          <>
            {/* ── SPLIT PAYMENT REQUESTS ── */}
            {pendingSplits.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-400" /> Запити на оплату
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/20">{pendingSplits.length}</span>
                  </h2>
                </div>
                <div className="grid gap-4">
                  {pendingSplits.map(s => (
                    <div key={s.id} className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.hotel_image} alt={s.hotel_name} className="w-20 h-16 object-cover rounded-xl border border-white/10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-base mb-0.5">{s.hotel_name}</div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs mb-2"><MapPin className="w-3 h-3" />{s.hotel_location}</div>
                        <div className="text-white/50 text-xs">
                          📅 {new Date(s.check_in).toLocaleDateString("uk-UA")} — {new Date(s.check_out).toLocaleDateString("uk-UA")}
                        </div>
                        <div className="text-white/40 text-xs mt-1">Запросив: <span className="text-white/70 font-medium">{s.invited_by_username}</span></div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-yellow-400 font-black text-xl">{Number(s.amount).toLocaleString()} ₴</div>
                        <div className="text-white/30 text-xs mb-3">{s.percentage}% від суми</div>
                        <button
                          onClick={() => setPayModal({ splitId: s.id, amount: Number(s.amount) })}
                          className="bg-[#C8102E] hover:bg-[#a00d25] text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                          Оплатити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PAID SPLITS (collapsed info) ── */}
            {paidSplits.length > 0 && (
              <div className="mb-10">
                <h2 className="text-sm font-bold text-white/40 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Оплачені запити на розділення
                </h2>
                <div className="grid gap-3">
                  {paidSplits.map(s => (
                    <div key={s.id} className="bg-green-400/5 border border-green-400/15 rounded-xl px-5 py-3 flex items-center justify-between">
                      <div>
                        <span className="text-white/80 text-sm font-medium">{s.hotel_name}</span>
                        <span className="text-white/30 text-xs ml-3">{new Date(s.check_in).toLocaleDateString("uk-UA")} — {new Date(s.check_out).toLocaleDateString("uk-UA")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-bold text-sm">{Number(s.amount).toLocaleString()} ₴</span>
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Оплачено
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MY BOOKINGS ── */}
            {bookings.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDays className="w-8 h-8 text-white/30" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Ви ще нічого не бронювали</h2>
                <p className="text-white/50 mb-8 max-w-sm mx-auto">
                  Саме час обрати своє ідеальне місце для екстремального відпочинку.
                </p>
                <Link href="/hotels" className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d25] text-white px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 group">
                  Переглянути готелі
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row transition-colors hover:border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={booking.hotel_image} alt={booking.hotel_name} className="md:w-64 h-48 md:h-auto object-cover" />
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1.5">{booking.hotel_name}</h3>
                          <div className="flex items-center gap-1.5 text-white/40 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.hotel_location}
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-6 mt-auto">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <div className="text-white/40 text-xs mb-1 uppercase tracking-wider font-semibold">Дати проживання</div>
                          <div className="text-white font-medium text-sm">
                            {new Date(booking.check_in).toLocaleDateString("uk-UA")} — {new Date(booking.check_out).toLocaleDateString("uk-UA")}
                          </div>
                          <div className="text-white/40 text-[11px] mt-1">{booking.guests_count} гостей</div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                          <div className="text-white/40 text-xs mb-1 uppercase tracking-wider font-semibold">Сума до сплати</div>
                          <div className="text-xl font-black text-[#C8102E] leading-none">
                            {Number(booking.total_price).toLocaleString()} ₴
                          </div>
                          <div className="text-white/40 text-[11px] mt-2 capitalize">Оплата: {booking.payment_method === 'card' ? 'Картка' : 'IBAN Переказ'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PAY MODAL ── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-1">Оплатити частку</h3>
            <p className="text-white/50 text-sm mb-5">Сума: <span className="text-yellow-400 font-bold">{payModal.amount.toLocaleString()} ₴</span></p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => { setPayMethod("card"); setCardError(""); }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-sm transition-colors ${payMethod === "card" ? "bg-[#C8102E]/20 border-[#C8102E]/40 text-white" : "border-white/10 text-white/40 hover:text-white"}`}>
                <CreditCard className="w-5 h-5" /> Картка
              </button>
              <button onClick={() => { setPayMethod("transfer"); setCardError(""); }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-sm transition-colors ${payMethod === "transfer" ? "bg-blue-500/20 border-blue-500/40 text-white" : "border-white/10 text-white/40 hover:text-white"}`}>
                <Banknote className="w-5 h-5" /> Переказ
              </button>
            </div>
            
            {payMethod === "card" && (
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Номер картки</label>
                  <input value={cardForm.number} onChange={e => setCardForm({...cardForm, number: e.target.value})}
                    placeholder="0000 0000 0000 0000" maxLength={19}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 outline-none text-sm focus:border-[#C8102E]/50"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Термін дії</label>
                    <input value={cardForm.expiry} onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                      placeholder="ММ/РР" maxLength={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 outline-none text-sm focus:border-[#C8102E]/50"/>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">CVV</label>
                    <input type="password" value={cardForm.cvv} onChange={e => setCardForm({...cardForm, cvv: e.target.value})}
                      placeholder="•••" maxLength={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 outline-none text-sm focus:border-[#C8102E]/50"/>
                  </div>
                </div>
                {cardError && <div className="text-red-400 text-xs mt-1 text-center font-medium">{cardError}</div>}
              </div>
            )}

            {payMethod === "transfer" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4 text-xs text-white/60 space-y-1">
                <p><strong className="text-white">IBAN:</strong> UA12 3456 7890 1234 5678 90</p>
                <p><strong className="text-white">Банк:</strong> ПриватБанк</p>
                <p><strong className="text-white">Призначення:</strong> Split #{payModal.splitId}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="flex-1 py-2.5 border border-white/10 text-white/50 hover:text-white rounded-xl text-sm transition-colors">Закрити</button>
              <button disabled={payLoading} onClick={handlePay}
                className="flex-1 bg-[#C8102E] hover:bg-[#a00d25] text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {payLoading ? "..." : "Підтвердити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
