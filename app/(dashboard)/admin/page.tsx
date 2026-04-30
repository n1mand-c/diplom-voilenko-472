"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ArrowLeft, Zap, CalendarCheck, Building, Users, BarChart3, CheckCircle, XCircle, Clock, TrendingUp, Edit2, Plus, Trash2, DollarSign, AlertTriangle } from "lucide-react";

const statusConfig = {
  confirmed: { label: "Підтверджено", icon: CheckCircle, color: "text-green-400 bg-green-400/10 border-green-400/20" },
  pending: { label: "Очікує", icon: Clock, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  cancelled: { label: "Скасовано", icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const navItems = [
  { id: "bookings", label: "Бронювання", icon: CalendarCheck },
  { id: "hotels", label: "Готелі", icon: Building },
  { id: "guests", label: "Гості", icon: Users },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
  { id: "revenue", label: "Доходи", icon: DollarSign },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("bookings");

  const [userRole, setUserRole] = useState<string>("ROLE_USER");
  const [userHotelId, setUserHotelId] = useState<number | null>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [editBooking, setEditBooking] = useState<any>(null);
  const [editHotel, setEditHotel] = useState<any>(null);
  const [editImages, setEditImages] = useState<string[]>(['']); // Separate state for images
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [newRoomType, setNewRoomType] = useState({ name: "", capacity: 2, extraPrice: 0, totalRooms: 1 });

  // Analytics State
  const [analyticsHotelId, setAnalyticsHotelId] = useState<string>("all");
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>("");
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const uRes = await fetch("/api/auth/me");
      const uData = await uRes.json();
      if (!uData.user || (uData.user.role !== 'ROLE_ADMIN' && uData.user.role !== 'ROLE_MANAGER')) {
        window.location.href = "/login";
        return;
      }
      setUserRole(uData.user.role);
      setUserHotelId(uData.user.hotelId);
      if (uData.user.role === 'ROLE_MANAGER') {
        setAnalyticsHotelId(uData.user.hotelId?.toString() || "all");
      }

      const bRes = await fetch("/api/admin/bookings");
      if (bRes.status === 403) window.location.href = "/login";
      const bData = await bRes.json();
      if (bData.bookings) setBookings(bData.bookings);
      if (bData.splits) setSplits(bData.splits);

      const hRes = await fetch("/api/admin/hotels");
      const hData = await hRes.json();
      if (hData.hotels) setHotels(hData.hotels);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadRoomTypes = async (hotelId: number) => {
    const res = await fetch(`/api/room-types?hotelId=${hotelId}`);
    const data = await res.json();
    if (data.roomTypes) setRoomTypes(data.roomTypes);
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setEditBooking(null);
    fetchData();
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editHotel.id;

    // Use dedicated editImages state (filter empty entries)
    const images = editImages.filter(url => url.trim() !== '');

    // Normalize field names: DB fields use snake_case but API expects camelCase
    const payload = {
      ...editHotel,
      images,
      imageUrl: editHotel.imageUrl || editHotel.image_url || '',
      sportLabel: editHotel.sportLabel || editHotel.sport_label || '',
    };

    const res = await fetch(isNew ? "/api/admin/hotels" : `/api/admin/hotels/${editHotel.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Помилка збереження: ${err.error}`);
      return;
    }

    setEditHotel(null);
    setEditImages(['']);
    fetchData();
  };

  const handleDeleteHotel = async (id: number) => {
    if (!confirm("Ви впевнені? Всі бронювання цього готелю також будуть видалені!")) return;
    await fetch(`/api/admin/hotels/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddRoomType = async () => {
    if (!newRoomType.name) return;
    try {
      const res = await fetch("/api/room-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: editHotel.id, ...newRoomType })
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("Помилка додавання номеру: " + (errorData.error || "Невідома помилка"));
        return;
      }
      setNewRoomType({ name: "", capacity: 2, extraPrice: 0, totalRooms: 1 });
      loadRoomTypes(editHotel.id);
    } catch (e: any) {
      alert("Помилка: " + e.message);
    }
  };

  const handleDeleteRoomType = async (id: number) => {
    await fetch(`/api/room-types/${id}`, { method: "DELETE" });
    loadRoomTypes(editHotel.id);
  };

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col fixed h-full bg-black/40">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Red Bull" className="w-auto h-8" />
            <div>
              <div className="text-white font-bold text-sm">RED BULL HOTELS</div>
              <div className="text-white/30 text-xs">Адмін панель</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.filter(item => item.id !== "revenue" || userRole === 'ROLE_ADMIN').map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                  ? "bg-[#C8102E]/20 text-[#C8102E] border border-[#C8102E]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors">
            <ArrowLeft className="w-3 h-3" />
            На сайт
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-72">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur px-8 py-4 flex justify-between items-center">
          <h1 className="text-white font-bold text-lg capitalize">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C8102E] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userRole === 'ROLE_MANAGER' ? 'M' : 'A'}
            </div>
            <span className="text-white/60 text-sm">
              {userRole === 'ROLE_MANAGER' ? 'Manager' : 'Admin'}
            </span>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="text-white/50 animate-pulse text-center py-20">Завантаження даних...</div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Всього бронювань", value: bookings.length, icon: CalendarCheck, color: "text-blue-400" },
                  { label: "Активних готелів", value: hotels.length, icon: Building, color: "text-purple-400" },
                  { label: "Підтверджено", value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: "text-green-400" },
                  {
                    label: "Дохід платформи (10%)",
                    value: (
                      bookings
                        .filter(b => b.status === 'confirmed' && !b.discount_applied)
                        .reduce((sum, b) => sum + Number(b.total_price), 0) * 0.10
                    ).toLocaleString() + ' ₴',
                    icon: TrendingUp,
                    color: "text-[#C8102E]"
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/40 text-xs">{s.label}</span>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h2 className="text-white font-bold">Всі бронювання</h2>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["ID", "Гість", "Готель", "Заїзд", "Виїзд", "Сума", "Статус", "Дії"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-white/40 text-xs font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-8 text-white/50">Немає бронювань</td></tr>
                      ) : bookings.map((b) => {
                        const s = statusConfig[b.status as keyof typeof statusConfig] || statusConfig.pending;
                        const bSplits = splits.filter(split => split.booking_id === b.id);
                        const hasSplits = bSplits.length > 0;
                        const allPaid = hasSplits && bSplits.every(split => split.status === 'paid');
                        const checkInDate = new Date(b.check_in);
                        const isSoon = (checkInDate.getTime() - Date.now()) / (1000 * 3600 * 24) <= 3 && checkInDate.getTime() > Date.now();

                        return (
                          <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                            <td className="px-5 py-4 text-white/40 text-sm">#{b.id}</td>
                            <td className="px-5 py-4 text-white text-sm font-medium">{b.guest_name}</td>
                            <td className="px-5 py-4 text-white/60 text-sm">{b.hotel_name}</td>
                            <td className="px-5 py-4 text-white/60 text-sm">
                              {checkInDate.toLocaleDateString()}
                              {isSoon && hasSplits && !allPaid && (
                                <div className="text-yellow-400 text-[10px] font-bold flex items-center gap-1 mt-1 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20 w-fit">
                                  <AlertTriangle className="w-3 h-3" /> Скоро заїзд
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-white/60 text-sm">{new Date(b.check_out).toLocaleDateString()}</td>
                            <td className="px-5 py-4 text-sm min-w-[200px]">
                              <div className="text-white font-medium">{Number(b.total_price).toLocaleString()} ₴</div>
                              {b.discount_applied ? (
                                <div className="text-[#C8102E] text-xs font-bold mt-0.5 flex items-center gap-1">
                                  🏷️ Red Bull -10%
                                </div>
                              ) : null}
                              {hasSplits && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Спліт-оплата:</div>
                                  {bSplits.map((split: any) => (
                                    <div key={split.id} className="flex items-center justify-between text-xs bg-black/20 p-1.5 rounded border border-white/5">
                                      <span className="text-white/80">{split.user_username} ({split.percentage}%)</span>
                                      {split.status === 'paid' ? (
                                        <span className="text-green-400 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {Number(split.amount).toLocaleString()}</span>
                                      ) : (
                                        <span className="text-yellow-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {Number(split.amount).toLocaleString()}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${s.color}`}>
                                <s.icon className="w-3 h-3" />
                                {s.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <button onClick={() => setEditBooking(b)} className="text-[#C8102E] hover:text-white text-xs transition-colors flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> Редагувати
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Hotels Tab */}
              {activeTab === "hotels" && (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    {userRole === 'ROLE_ADMIN' && (
                      <button
                        onClick={() => {
                          setEditHotel({ name: "", location: "", sport: "ski", sportLabel: "Лижі", price: 0, imageUrl: "", description: "", stars: 4, reviews: 0 });
                          setEditImages(['']);
                        }}
                        className="bg-[#C8102E] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#a00d25] transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Додати готель
                      </button>
                    )}
                  </div>
                  {hotels.map((h) => (
                    <div key={h.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={h.image_url} alt={h.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <h3 className="text-white font-bold mb-1">{h.name}</h3>
                          <p className="text-white/40 text-sm">{h.location} · {Number(h.price).toLocaleString()} ₴/ніч</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-white font-bold">{h.room_types_count}</div>
                          <div className="text-white/40 text-xs">Типів номерів</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#C8102E] font-bold">{h.active_bookings}</div>
                          <div className="text-white/40 text-xs">Акт. бронювань</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditHotel({ ...h });
                              // Initialize images state from DB images array
                              const imgs = Array.isArray(h.images) ? [...h.images.filter(Boolean), ''] : [''];
                              setEditImages(imgs);
                              loadRoomTypes(h.id);
                            }}
                            className="text-white/60 hover:text-white p-2 bg-white/5 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {userRole === 'ROLE_ADMIN' && (
                            <button
                              onClick={() => handleDeleteHotel(h.id)}
                              className="text-red-400/60 hover:text-red-400 p-2 bg-white/5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Guests Tab */}
              {activeTab === "guests" && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#C8102E]/20 border border-[#C8102E]/30 rounded-full flex items-center justify-center text-[#C8102E] font-bold text-sm">
                            {b.guest_name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{b.guest_name}</div>
                            <div className="text-white/30 text-xs">{b.guest_email} · {b.guest_phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/60 text-sm pr-4">{b.hotel_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-white/50 text-xs mb-1.5 block">Готель</label>
                      <select
                        value={analyticsHotelId}
                        onChange={(e) => setAnalyticsHotelId(e.target.value)}
                        disabled={userRole === 'ROLE_MANAGER'}
                        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#C8102E]/50 disabled:opacity-50"
                      >
                        {userRole === 'ROLE_ADMIN' && <option value="all">Всі готелі</option>}
                        {hotels.map(h => <option key={h.id} value={h.id.toString()}>{h.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-white/50 text-xs mb-1.5 block">Дата з</label>
                      <DatePicker
                        date={analyticsStartDate ? new Date(analyticsStartDate) : undefined}
                        setDate={(d) => setAnalyticsStartDate(d ? format(d, 'yyyy-MM-dd') : "")}
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-white/50 text-xs mb-1.5 block">Дата до</label>
                      <DatePicker
                        date={analyticsEndDate ? new Date(analyticsEndDate) : undefined}
                        setDate={(d) => setAnalyticsEndDate(d ? format(d, 'yyyy-MM-dd') : "")}
                      />
                    </div>
                    <button
                      onClick={() => { setAnalyticsHotelId("all"); setAnalyticsStartDate(""); setAnalyticsEndDate(""); }}
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors h-[46px]"
                    >
                      Скинути
                    </button>
                  </div>

                  {(() => {
                    const filteredBookings = bookings.filter(b => {
                      let match = true;
                      if (analyticsHotelId !== "all" && b.hotel_id?.toString() !== analyticsHotelId) match = false;

                      const checkInDate = new Date(b.check_in).getTime();
                      const checkOutDate = new Date(b.check_out).getTime();
                      const filterStart = analyticsStartDate ? new Date(analyticsStartDate).getTime() : null;
                      const filterEnd = analyticsEndDate ? new Date(analyticsEndDate).getTime() : null;

                      if (filterStart && checkOutDate < filterStart) match = false;
                      if (filterEnd && checkInDate > filterEnd) match = false;

                      return match;
                    });

                    const totalRevenue = filteredBookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0);

                    return (
                      <>
                        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#C8102E]/10 border border-[#C8102E]/20 rounded-2xl p-8 flex items-center justify-between">
                          <div>
                            <div className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">Загальна вартість бронювань</div>
                            <div className="text-5xl font-black text-white">{totalRevenue.toLocaleString()} ₴</div>
                          </div>
                          <div className="w-16 h-16 bg-[#C8102E]/20 rounded-full flex items-center justify-center text-[#C8102E]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4">Бронювання по готелях (Відфільтровано)</h3>
                            <div className="space-y-4">
                              {hotels.filter(h => analyticsHotelId === "all" || h.id.toString() === analyticsHotelId).map((h) => {
                                const hotelData = filteredBookings.filter(b => b.hotel_id === h.id);
                                const count = hotelData.length;
                                if (count === 0 && analyticsHotelId !== h.id.toString()) return null;

                                const max = Math.max(...hotels.map(ht => filteredBookings.filter(b => b.hotel_id === ht.id).length || 1));
                                const pct = (count / max) * 100;
                                return (
                                  <div key={h.id}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                      <span className="text-white/60">{h.name}</span>
                                      <span className="text-white font-medium">{count} брон.</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-[#C8102E] to-[#001E62] rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4">Статуси (Відфільтровано)</h3>
                            <div className="space-y-3">
                              {(["confirmed", "pending", "cancelled"] as const).map((s) => {
                                const count = filteredBookings.filter(b => b.status === s).length;
                                const cfg = statusConfig[s];
                                return (
                                  <div key={s} className={`flex justify-between items-center p-3 rounded-xl border ${cfg.color}`}>
                                    <div className="flex items-center gap-2 text-sm">
                                      <cfg.icon className="w-4 h-4" />
                                      {cfg.label}
                                    </div>
                                    <span className="font-bold">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === "revenue" && userRole === 'ROLE_ADMIN' && (() => {
                const confirmedBookings = bookings.filter(b => {
                  if (b.status !== 'confirmed') return false;

                  const checkInDate = new Date(b.check_in).getTime();
                  const checkOutDate = new Date(b.check_out).getTime();
                  const filterStart = analyticsStartDate ? new Date(analyticsStartDate).getTime() : null;
                  const filterEnd = analyticsEndDate ? new Date(analyticsEndDate).getTime() : null;

                  if (filterStart && checkOutDate < filterStart) return false;
                  if (filterEnd && checkInDate > filterEnd) return false;

                  return true;
                });
                const totalValue = confirmedBookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
                // Platform earns 10% ONLY from bookings without a Red Bull discount
                const nonDiscountedBookings = confirmedBookings.filter(b => !b.discount_applied);
                const commission = nonDiscountedBookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0) * 0.1;
                const discountedCount = confirmedBookings.filter(b => b.discount_applied).length;
                return (
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex items-end gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-white/50 text-xs mb-1.5 block">Дата від</label>
                        <DatePicker
                          date={analyticsStartDate ? new Date(analyticsStartDate) : undefined}
                          setDate={(d) => setAnalyticsStartDate(d ? format(d, 'yyyy-MM-dd') : "")}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-white/50 text-xs mb-1.5 block">Дата до</label>
                        <DatePicker
                          date={analyticsEndDate ? new Date(analyticsEndDate) : undefined}
                          setDate={(d) => setAnalyticsEndDate(d ? format(d, 'yyyy-MM-dd') : "")}
                        />
                      </div>
                      <button
                        onClick={() => { setAnalyticsStartDate(""); setAnalyticsEndDate(""); }}
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors h-[46px]"
                      >
                        Скинути
                      </button>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#C8102E]/10 border border-[#C8102E]/20 rounded-2xl p-8">
                        <div className="text-white/60 text-xs uppercase tracking-widest mb-2">Загальна вартість бронювань</div>
                        <div className="text-4xl font-black text-white mb-1">{totalValue.toLocaleString()} ₴</div>
                        <div className="text-white/30 text-sm">{confirmedBookings.length} підтверджених</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#1a1a2e] to-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8">
                        <div className="text-white/60 text-xs uppercase tracking-widest mb-2">Дохід платформи (10%)</div>
                        <div className="text-4xl font-black text-yellow-400 mb-1">{commission.toLocaleString()} ₴</div>
                        <div className="text-white/30 text-sm">10% від чистих бронювань</div>
                        {discountedCount > 0 && (
                          <div className="mt-3 text-[#C8102E] text-xs font-semibold flex items-center gap-1.5">
                            🏷️ {discountedCount} брон. зі знижкою Red Bull — комісія не нараховується
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Per-hotel breakdown */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-5">Розбивка по готелях</h3>
                      <div className="space-y-4">
                        {hotels.map(h => {
                          const hb = confirmedBookings.filter(b => b.hotel_id === h.id);
                          const hTotal = hb.reduce((s, b) => s + Number(b.total_price || 0), 0);
                          // Commission only from non-discounted bookings
                          const hComm = hb.filter(b => !b.discount_applied).reduce((s, b) => s + Number(b.total_price || 0), 0) * 0.1;
                          const hDiscounted = hb.filter(b => b.discount_applied).length;
                          if (hTotal === 0) return null;
                          return (
                            <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={h.image_url} alt={h.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <div className="text-white font-medium text-sm">{h.name}</div>
                                  <div className="text-white/40 text-xs">{hb.length} бронювань</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">{hTotal.toLocaleString()} ₴</div>
                                <div className="text-yellow-400 text-sm">комісія: {hComm.toLocaleString()} ₴</div>
                                {hDiscounted > 0 && (
                                  <div className="text-[#C8102E] text-xs mt-0.5">🏷️ {hDiscounted} зі знижкою</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>

      {/* Edit Booking Modal */}
      {editBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Статус бронювання #{editBooking.id}</h3>
            <div className="space-y-2 mb-6">
              <button onClick={() => handleUpdateBookingStatus(editBooking.id, "confirmed")} className="w-full text-left p-3 rounded-xl bg-green-400/10 text-green-400 border border-green-400/20 font-medium">Підтверджено</button>
              <button onClick={() => handleUpdateBookingStatus(editBooking.id, "pending")} className="w-full text-left p-3 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium">Очікує</button>
              <button onClick={() => handleUpdateBookingStatus(editBooking.id, "cancelled")} className="w-full text-left p-3 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 font-medium">Скасовано</button>
            </div>
            <button onClick={() => setEditBooking(null)} className="w-full py-2 text-white/50 hover:text-white transition-colors">Закрити</button>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {editHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">{editHotel.id ? "Редагувати готель" : "Новий готель"}</h3>
            <form onSubmit={handleSaveHotel} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Назва</label>
                <input required value={editHotel.name} onChange={e => setEditHotel({ ...editHotel, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Локація</label>
                <input required value={editHotel.location} onChange={e => setEditHotel({ ...editHotel, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Вид спорту</label>
                <select
                  required
                  value={editHotel.sport}
                  onChange={e => {
                    const sportsConf: Record<string, string> = {
                      ski: "Лижі / Фрірайд", climbing: "Скелелазіння", diving: "Дайвінг та кейвдайвінг",
                      rafting: "Рафтинг", surfing: "Серфінг", motocross: "Мотокрос"
                    };
                    setEditHotel({ ...editHotel, sport: e.target.value, sportLabel: sportsConf[e.target.value] });
                  }}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="ski">Лижі</option>
                  <option value="climbing">Скелелазіння</option>
                  <option value="diving">Дайвінг та кейвдайвінг</option>
                  <option value="rafting">Рафтинг</option>
                  <option value="surfing">Серфінг</option>
                  <option value="motocross">Мотокрос</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Ціна за ніч</label>
                <input type="number" required value={editHotel.price} onChange={e => setEditHotel({ ...editHotel, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Зірки (1-5)</label>
                <input type="number" min="1" max="5" required value={editHotel.stars} onChange={e => setEditHotel({ ...editHotel, stars: parseInt(e.target.value) || 4 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Відгуки</label>
                <input type="number" value={editHotel.reviews} onChange={e => setEditHotel({ ...editHotel, reviews: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-white/50 text-xs mb-1 block">Головне фото (URL)</label>
                <input required value={editHotel.imageUrl || editHotel.image_url} onChange={e => setEditHotel({ ...editHotel, imageUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-white/50 text-xs mb-2 block">Додаткові фото галереї</label>
                <div className="space-y-2">
                  {editImages.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-white/30 text-xs w-16 shrink-0">Фото {idx + 1}</span>
                      <input
                        value={url}
                        onChange={e => {
                          const newImgs = editImages.map((v, i) => i === idx ? e.target.value : v);
                          // Auto-add empty slot when last field is typed into
                          if (idx === editImages.length - 1 && e.target.value !== '') {
                            newImgs.push('');
                          }
                          setEditImages(newImgs);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none text-sm focus:border-[#C8102E]/50 transition-colors"
                      />
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0" />
                      )}
                      {editImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditImages(editImages.filter((_, i) => i !== idx))}
                          className="text-red-400/60 hover:text-red-400 shrink-0 text-lg leading-none"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-white/50 text-xs mb-1 block">Опис готелю</label>
                <textarea rows={4} required value={editHotel.description} onChange={e => setEditHotel({ ...editHotel, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none resize-none" />
              </div>

              {editHotel.id && (
                <div className="col-span-2 mt-4 border-t border-white/10 pt-4">
                  <h4 className="text-white font-bold text-sm mb-3">Типи номерів</h4>
                  <div className="space-y-2 mb-4">
                    {roomTypes.map(rt => (
                      <div key={rt.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-sm">
                        <span className="text-white">{rt.name} (до {rt.capacity} місць)</span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/60 text-xs">К-сть: {rt.total_rooms || 1}</span>
                          <span className="text-[#C8102E] font-medium">+{Number(rt.extra_price)} ₴</span>
                          <button type="button" onClick={() => handleDeleteRoomType(rt.id)} className="text-white/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Назва (Люкс)" value={newRoomType.name} onChange={e => setNewRoomType({ ...newRoomType, name: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" title="Назва номеру" />
                    <input type="number" placeholder="Місць" value={newRoomType.capacity} onChange={e => setNewRoomType({ ...newRoomType, capacity: parseInt(e.target.value) })} className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" title="Макс. кількість гостей" />
                    <input type="number" placeholder="К-сть" value={newRoomType.totalRooms} onChange={e => setNewRoomType({ ...newRoomType, totalRooms: parseInt(e.target.value) })} className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" title="Фізична кількість таких номерів у готелі" />
                    <input type="number" placeholder="Доплата" value={newRoomType.extraPrice} onChange={e => setNewRoomType({ ...newRoomType, extraPrice: parseInt(e.target.value) })} className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" title="Доплата до базової ціни готелю (₴)" />
                    <button type="button" onClick={handleAddRoomType} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Додати</button>
                  </div>
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setEditHotel(null)} className="px-5 py-2 text-white/60 hover:text-white transition-colors">Скасувати</button>
                <button type="submit" className="px-5 py-2 bg-[#C8102E] hover:bg-[#a00d25] text-white font-medium rounded-xl transition-colors">Зберегти готель</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
