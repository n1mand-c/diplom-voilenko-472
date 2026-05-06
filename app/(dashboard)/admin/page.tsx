"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ArrowLeft, Zap, CalendarCheck, Building, Users, BarChart3, CheckCircle, XCircle, Clock, TrendingUp, Edit2, Plus, Trash2, DollarSign, AlertTriangle, BedDouble, MessageSquare, UserCheck, Wifi, Waves, Sparkles, CarFront, Coffee, Dumbbell, Car, Utensils, Wine, Wind, Tv } from "lucide-react";

const statusConfig = {
  confirmed: { label: "Підтверджено", icon: CheckCircle, color: "text-green-400 bg-green-400/10 border-green-400/20" },
  pending: { label: "Очікує", icon: Clock, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  cancelled: { label: "Скасовано", icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const navItems = [
  { id: "bookings", label: "Бронювання", icon: CalendarCheck },
  { id: "hotels", label: "Готелі", icon: Building },
  { id: "occupancy", label: "Зайнятість", icon: BedDouble },
  { id: "guests", label: "Гості", icon: UserCheck },
  { id: "messages", label: "Повідомлення", icon: MessageSquare },
  { id: "users", label: "Користувачі", icon: Users },
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

  // New Features State
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  // Occupancy state
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [occupancyStart, setOccupancyStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [occupancyEnd, setOccupancyEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [occupancyLoading, setOccupancyLoading] = useState(false);

  // Guests state
  const [guestsSearch, setGuestsSearch] = useState("");
  const [expandedGuest, setExpandedGuest] = useState<number | null>(null);

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

      // Fetch users and tickets
      if (uData.user.role === 'ROLE_ADMIN') {
        const uRes = await fetch("/api/admin/users");
        if (uRes.ok) setUsers((await uRes.json()).users || []);
      }
      
      const tRes = await fetch("/api/contacts");
      if (tRes.ok) setTickets((await tRes.json()).tickets || []);

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

  const handleSaveRoomType = async (rt: any) => {
    try {
      const res = await fetch(`/api/room-types/${rt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rt.name,
          capacity: rt.capacity,
          extraPrice: rt.extra_price ?? rt.extraPrice ?? 0,
          totalRooms: rt.total_rooms ?? rt.totalRooms ?? 1,
          amenities: rt.amenities || []
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Помилка збереження: ' + (err.error || 'Server error'));
      } else {
        loadRoomTypes(editHotel.id);
      }
    } catch (e: any) {
      alert('Помилка: ' + e.message);
    }
  };

  const toggleAmenity = (amenity: string, isRoomType: boolean = false, rtIndex: number = -1) => {
    if (isRoomType) {
      const updated = [...roomTypes];
      const rt = updated[rtIndex];
      const am = rt.amenities || [];
      updated[rtIndex].amenities = am.includes(amenity) ? am.filter((a: string) => a !== amenity) : [...am, amenity];
      setRoomTypes(updated);
    } else {
      const am = editHotel.amenities || [];
      setEditHotel({ ...editHotel, amenities: am.includes(amenity) ? am.filter((a: string) => a !== amenity) : [...am, amenity] });
    }
  };

  const loadMessages = async (ticketId: string) => {
    const res = await fetch(`/api/contacts/${ticketId}/messages`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  };

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
    loadMessages(ticket.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      const res = await fetch(`/api/contacts/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage })
      });
      if (res.ok) {
        setNewMessage("");
        loadMessages(selectedTicket.id);
      }
    } catch(e) {}
  };

  const closeTicket = async (ticketId: string) => {
    await fetch(`/api/contacts/${ticketId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" })
    });
    fetchData();
    if (selectedTicket?.id === ticketId) setSelectedTicket({...selectedTicket, status: "closed"});
  };

  const AMENITIES_LIST = [
    { id: "WiFi", icon: Wifi },
    { id: "Басейн", icon: Waves },
    { id: "Спа", icon: Sparkles },
    { id: "Парковка", icon: CarFront },
    { id: "Сніданок", icon: Coffee },
    { id: "Тренажерний зал", icon: Dumbbell },
    { id: "Трансфер", icon: Car },
    { id: "Ресторан", icon: Utensils },
    { id: "Бар", icon: Wine },
    { id: "Кондиціонер", icon: Wind },
    { id: "Телевізор", icon: Tv }
  ];

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
          {navItems.filter(item => !['revenue', 'users'].includes(item.id) || userRole === 'ROLE_ADMIN').map((item) => (
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

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden h-[700px] flex">
                  <div className="w-1/3 border-r border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-black/40"><h3 className="font-bold text-white">Всі звернення</h3></div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {tickets.map(t => (
                        <button key={t.id} onClick={() => handleTicketClick(t)} className={`w-full text-left p-3 rounded-xl transition-colors ${selectedTicket?.id === t.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${t.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>{t.status === 'open' ? 'Відкрито' : 'Закрито'}</span>
                            <span className="text-white/40 text-xs">{format(new Date(t.created_at), 'dd.MM HH:mm')}</span>
                          </div>
                          <div className="font-bold text-white truncate text-sm">{t.subject}</div>
                          <div className="text-white/50 text-xs truncate">{t.user_name} ({t.user_email})</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-2/3 flex flex-col bg-[#161616]">
                    {selectedTicket ? (
                      <>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                          <div>
                            <h3 className="font-bold text-white">{selectedTicket.subject}</h3>
                            <div className="text-xs text-white/50">Клієнт: {selectedTicket.user_name} • Готель: {selectedTicket.hotel_name || 'Загальне'}</div>
                          </div>
                          {selectedTicket.status === 'open' && (
                            <button onClick={() => closeTicket(selectedTicket.id)} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30">Закрити тікет</button>
                          )}
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                          {messages.map(m => {
                            const isAdmin = m.sender_type !== 'ROLE_USER';
                            return (
                              <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] text-white/30 mb-1">{isAdmin ? 'Ви' : 'Клієнт'} • {format(new Date(m.created_at), 'HH:mm')}</div>
                                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${isAdmin ? 'bg-[#C8102E] text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                                  {m.message}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                          <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Відповісти клієнту..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#C8102E]/50 text-sm" />
                          <button disabled={!newMessage.trim()} type="submit" className="bg-[#C8102E] text-white px-4 py-2 rounded-xl disabled:opacity-50"><Zap className="w-4 h-4" /></button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-white/30 flex-col gap-2">
                        <MessageSquare className="w-12 h-12" />
                        <p>Оберіть звернення для перегляду</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Occupancy Tab */}
              {activeTab === "occupancy" && (() => {
                // Selected hotel object
                const selectedHotel = hotels.find((h: any) => String(h.id) === String(analyticsHotelId));

                // Build day-by-day calendar from occupancyData
                const buildDayMap = () => {
                  if (!occupancyData.length || !occupancyStart || !occupancyEnd) return [];
                  const hotel = occupancyData[0]; // always one hotel after filtering
                  const start = new Date(occupancyStart);
                  const end = new Date(occupancyEnd);
                  const days: { date: Date; dateStr: string; slots: { roomTypeName: string; roomTypeCapacity?: number; roomTypeId: number; totalRooms: number; bookings: any[] }[] }[] = [];

                  // Iterate each day in range
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dayStr = d.toISOString().split('T')[0];
                    const dayDate = new Date(d);
                    const slots = hotel.roomTypes.map((rt: any) => {
                      // Bookings active on this specific day
                      const activeBookings = (rt.bookings || []).filter((bk: any) => {
                        const ci = bk.checkIn ? bk.checkIn.split('T')[0] : bk.check_in;
                        const co = bk.checkOut ? bk.checkOut.split('T')[0] : bk.check_out;
                        return ci <= dayStr && co > dayStr;
                      });
                      return { roomTypeName: rt.name, roomTypeCapacity: rt.capacity, roomTypeId: rt.id, totalRooms: rt.totalRooms, bookings: activeBookings };
                    }).filter((s: any) => s.bookings.length > 0);
                    days.push({ date: dayDate, dateStr: dayStr, slots });
                  }
                  return days;
                };

                const dayMap = buildDayMap();
                const occupiedDays = dayMap.filter(d => d.slots.length > 0);

                return (
                  <div className="space-y-5">
                    {/* Filters — hotel required */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-wrap items-end gap-4">
                      <div className="min-w-[220px]">
                        <label className="text-white/50 text-xs mb-1.5 block flex items-center gap-1">
                          Готель <span className="text-[#C8102E]">*</span>
                        </label>
                        <select
                          value={analyticsHotelId}
                          onChange={e => { setAnalyticsHotelId(e.target.value); setOccupancyData([]); }}
                          className={`w-full bg-[#1a1a2e] border rounded-xl px-3 py-3 text-white text-sm outline-none transition-colors ${
                            analyticsHotelId === 'all' ? 'border-[#C8102E]/50 focus:border-[#C8102E]' : 'border-white/10 focus:border-[#C8102E]/50'
                          }`}
                        >
                          <option value="all">— Оберіть готель —</option>
                          {hotels.map((h: any) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-white/50 text-xs mb-1.5 block">Дата з</label>
                        <DatePicker
                          allowPast
                          date={occupancyStart ? new Date(occupancyStart) : undefined}
                          setDate={(d) => setOccupancyStart(d ? format(d, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0])}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-white/50 text-xs mb-1.5 block">Дата до</label>
                        <DatePicker
                          allowPast
                          date={occupancyEnd ? new Date(occupancyEnd) : undefined}
                          setDate={(d) => setOccupancyEnd(d ? format(d, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0])}
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (analyticsHotelId === 'all') return;
                          setOccupancyLoading(true);
                          try {
                            const res = await fetch(`/api/admin/occupancy?startDate=${occupancyStart}&endDate=${occupancyEnd}&hotelId=${analyticsHotelId}`);
                            const data = await res.json();
                            setOccupancyData(data.occupancy || []);
                          } finally { setOccupancyLoading(false); }
                        }}
                        disabled={occupancyLoading || analyticsHotelId === 'all'}
                        className="h-11 px-6 bg-[#C8102E] hover:bg-[#a00d25] text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-40"
                      >
                        {occupancyLoading
                          ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4 inline-block" />
                          : <BarChart3 className="w-4 h-4" />}
                        Показати
                      </button>
                    </div>

                    {/* Require hotel notice */}
                    {analyticsHotelId === 'all' && (
                      <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                        <p className="text-yellow-400 text-sm">Оберіть готель зі списку, щоб переглянути зайнятість по днях.</p>
                      </div>
                    )}

                    {/* Results */}
                    {occupancyData.length > 0 && selectedHotel && (
                      <div className="space-y-3">
                        {/* Hotel header */}
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-white font-bold text-lg">{selectedHotel.name}</h3>
                          <div className="text-white/40 text-sm">
                            {occupancyStart && occupancyEnd && (
                              <span>
                                {new Date(occupancyStart).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long' })}
                                {' — '}
                                {new Date(occupancyEnd).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Day-by-day list */}
                        {dayMap.length === 0 ? (
                          <div className="text-center py-12 text-white/30 flex flex-col items-center gap-2">
                            <BedDouble className="w-10 h-10" />
                            <p>Немає даних за вказаний період</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayMap.map(day => {
                              const hasBookings = day.slots.length > 0;
                              const totalBooked = day.slots.reduce((s, sl) => s + sl.bookings.length, 0);
                              const weekday = day.date.toLocaleDateString('uk-UA', { weekday: 'short' });
                              const dateLabel = day.date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
                              const isToday = day.dateStr === new Date().toISOString().split('T')[0];

                              return (
                                <div key={day.dateStr} className={`border rounded-2xl overflow-hidden transition-all ${
                                  hasBookings
                                    ? 'border-white/15 bg-white/5'
                                    : 'border-white/5 bg-white/2 opacity-60'
                                }`}>
                                  {/* Day header */}
                                  <div className="flex items-center gap-4 px-5 py-3">
                                    {/* Date badge */}
                                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                                      isToday ? 'bg-[#C8102E]/20 border border-[#C8102E]/40' : 'bg-white/5 border border-white/10'
                                    }`}>
                                      <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#C8102E]' : 'text-white/40'}`}>{weekday}</span>
                                      <span className={`text-base font-black leading-none ${isToday ? 'text-[#C8102E]' : 'text-white'}`}>{day.date.getDate()}</span>
                                    </div>

                                    <div className="flex-1">
                                      <div className="text-white/60 text-xs">{dateLabel}</div>
                                      {hasBookings ? (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {day.slots.map(slot => (
                                            <span key={slot.roomTypeId} className="text-xs bg-[#C8102E]/15 border border-[#C8102E]/25 text-white/80 px-2 py-0.5 rounded-lg font-medium">
                                              {slot.roomTypeName}{slot.roomTypeCapacity ? ` · до ${slot.roomTypeCapacity} ос.` : ''} · {slot.bookings.length}/{slot.totalRooms} зайн.
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-white/25 text-xs mt-0.5">Всі номери вільні</div>
                                      )}
                                    </div>

                                    <div className="shrink-0 text-right">
                                      {hasBookings ? (
                                        <span className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">
                                          {totalBooked} брон.
                                        </span>
                                      ) : (
                                        <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
                                          Вільно
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Booking details */}
                                  {hasBookings && (
                                    <div className="px-5 pb-3 space-y-1.5 border-t border-white/5 pt-2.5">
                                      {day.slots.map(slot =>
                                        slot.bookings.map((bk: any) => (
                                          <div key={`${slot.roomTypeId}-${bk.id}`} className="flex items-center justify-between bg-black/25 border border-white/5 rounded-xl px-4 py-2 text-xs">
                                            <div className="flex items-center gap-2">
                                              <BedDouble className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                              <span className="text-white/50 font-medium">{slot.roomTypeName}</span>
                                              {slot.roomTypeCapacity && <span className="text-white/30 text-[10px]">до {slot.roomTypeCapacity} ос.</span>}
                                              <span className="text-white/20">·</span>
                                              <CalendarCheck className="w-3 h-3 text-white/30 shrink-0" />
                                              <span className="text-white/80 font-semibold">{bk.guestName}</span>
                                              <span className="text-white/30">·</span>
                                              <span className="text-white/40">{bk.guestsCount} ос.</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-green-400">{new Date(bk.checkIn).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</span>
                                              <span className="text-white/30">→</span>
                                              <span className="text-red-400">{new Date(bk.checkOut).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</span>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty state when hotel selected but not yet fetched */}
                    {analyticsHotelId !== 'all' && occupancyData.length === 0 && !occupancyLoading && (
                      <div className="text-center py-16 text-white/30 flex flex-col items-center gap-3">
                        <BedDouble className="w-12 h-12" />
                        <p>Оберіть дати і натисніть «Показати»</p>
                      </div>
                    )}
                  </div>
                );
              })()}



              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {users.length === 0 ? (
                      <div className="text-center py-12 text-white/30 flex flex-col items-center gap-2">
                        <Users className="w-10 h-10" />
                        <p>Завантаження...</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {users.map(u => {
                          const roleLabel = u.role === 'ROLE_ADMIN' ? 'Адмін' : u.role === 'ROLE_MANAGER' ? 'Менеджер' : 'Користувач';
                          const roleColor = u.role === 'ROLE_ADMIN' ? 'text-[#C8102E] bg-[#C8102E]/10 border-[#C8102E]/20' : u.role === 'ROLE_MANAGER' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-white/50 bg-white/5 border-white/10';
                          const hotelForUser = hotels.find((h: any) => h.id === u.hotelId);
                          return (
                            <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center text-[#C8102E] font-bold text-sm shrink-0">
                                {(u.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{u.username}</div>
                                <div className="text-xs text-white/40 truncate">{u.email}</div>
                                {u.role === 'ROLE_MANAGER' && hotelForUser && (
                                  <div className="text-xs text-yellow-400/70 mt-0.5">Готель: {hotelForUser.name}</div>
                                )}
                              </div>
                              {/* Role badge */}
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${roleColor}`}>{roleLabel}</span>
                              {/* Role selector */}
                              <select
                                value={u.role}
                                onChange={(e) => {
                                  const newRole = e.target.value;
                                  fetch(`/api/admin/users/${u.id}`, {
                                    method: 'PUT', headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({ role: newRole, hotelId: u.hotelId })
                                  }).then(() => fetchData());
                                }}
                                className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#C8102E]/50"
                              >
                                <option value="ROLE_USER">Користувач</option>
                                <option value="ROLE_MANAGER">Менеджер</option>
                                <option value="ROLE_ADMIN">Адміністратор</option>
                              </select>
                              {/* Hotel selector for managers */}
                              {u.role === 'ROLE_MANAGER' && (
                                <select
                                  value={u.hotelId || ""}
                                  onChange={(e) => {
                                    fetch(`/api/admin/users/${u.id}`, {
                                      method: 'PUT', headers: {'Content-Type': 'application/json'},
                                      body: JSON.stringify({ role: u.role, hotelId: e.target.value || null })
                                    }).then(() => fetchData());
                                  }}
                                  className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs max-w-[180px] outline-none focus:border-yellow-400/50"
                                >
                                  <option value="">Оберіть готель</option>
                                  {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Guests Tab */}
              {activeTab === "guests" && (() => {
                // Build guest list from bookings
                const guestMap: Record<number, { id: number; name: string; email?: string; phone?: string; bookings: any[] }> = {};
                for (const b of bookings) {
                  if (!guestMap[b.user_id]) {
                    guestMap[b.user_id] = {
                      id: b.user_id,
                      name: b.guest_name,
                      email: b.user_email || b.guest_email || undefined,
                      phone: b.guest_phone || undefined,
                      bookings: []
                    };
                  }
                  guestMap[b.user_id].bookings.push(b);
                }
                const guestList = Object.values(guestMap).filter(g =>
                  !guestsSearch ||
                  g.name.toLowerCase().includes(guestsSearch.toLowerCase()) ||
                  (g.email || '').toLowerCase().includes(guestsSearch.toLowerCase()) ||
                  (g.phone || '').includes(guestsSearch)
                );
                return (
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="flex gap-3">
                      <input
                        value={guestsSearch}
                        onChange={e => setGuestsSearch(e.target.value)}
                        placeholder="Пошук гостя..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C8102E]/50"
                      />
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm">
                        <UserCheck className="w-4 h-4" />
                        {guestList.length} гостей
                      </div>
                    </div>
                    {/* Guest cards */}
                    {guestList.length === 0 ? (
                      <div className="text-center py-16 text-white/30 flex flex-col items-center gap-3">
                        <UserCheck className="w-12 h-12" />
                        <p>Гостей не знайдено</p>
                      </div>
                    ) : guestList.map(guest => {
                      const isExpanded = expandedGuest === guest.id;
                      const totalSpent = guest.bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.total_price), 0);
                      const confirmedCount = guest.bookings.filter(b => b.status === 'confirmed').length;
                      return (
                        <div key={guest.id} className={`border rounded-2xl overflow-hidden transition-all ${
                          isExpanded ? 'border-[#C8102E]/30 bg-white/5' : 'border-white/10 bg-white/3 hover:border-white/20'
                        }`}>
                          <button
                            onClick={() => setExpandedGuest(isExpanded ? null : guest.id)}
                            className="w-full flex items-center gap-4 p-4 text-left"
                          >
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-full bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center text-[#C8102E] font-black text-base shrink-0">
                              {guest.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white">{guest.name}</div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                {guest.email && (
                                  <span className="text-white/40 text-xs flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {guest.email}
                                  </span>
                                )}
                                {guest.phone && (
                                  <span className="text-white/40 text-xs flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {guest.phone}
                                  </span>
                                )}
                                <span className="text-white/30 text-xs">{guest.bookings.length} брон. · {confirmedCount} підтв.</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[#C8102E] font-black">{totalSpent.toLocaleString()} ₴</div>
                              <div className="text-white/30 text-xs">загально</div>
                            </div>
                            <div className={`text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>›</div>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-2">
                              {guest.bookings.map((b: any) => {
                                const sc = statusConfig[b.status as keyof typeof statusConfig] || statusConfig.pending;
                                return (
                                  <div key={b.id} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <div className="text-white text-sm font-medium">{b.hotel_name}</div>
                                        <div className="text-white/40 text-xs mt-0.5">
                                          {new Date(b.check_in).toLocaleDateString('uk-UA')} → {new Date(b.check_out).toLocaleDateString('uk-UA')} · {b.guests_count} ос.
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-white font-semibold text-sm">{Number(b.total_price).toLocaleString()} ₴</span>
                                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${sc.color}`}>
                                        <sc.icon className="w-3 h-3" />{sc.label}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

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
                        allowPast
                        date={analyticsStartDate ? new Date(analyticsStartDate) : undefined}
                        setDate={(d) => setAnalyticsStartDate(d ? format(d, 'yyyy-MM-dd') : "")}
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-white/50 text-xs mb-1.5 block">Дата до</label>
                      <DatePicker
                        allowPast
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
                          allowPast
                          date={analyticsStartDate ? new Date(analyticsStartDate) : undefined}
                          setDate={(d) => setAnalyticsStartDate(d ? format(d, 'yyyy-MM-dd') : "")}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-white/50 text-xs mb-1.5 block">Дата до</label>
                        <DatePicker
                          allowPast
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

              {/* Amenities */}
              <div className="col-span-2 mt-2">
                <label className="text-white/50 text-xs mb-2 block">Зручності Готелю</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {AMENITIES_LIST.map(a => {
                    const isSelected = editHotel.amenities?.includes(a.id);
                    return (
                      <button type="button" key={a.id} onClick={() => toggleAmenity(a.id)} className={`px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-[#C8102E] border-[#C8102E] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                        <a.icon className="w-3.5 h-3.5" />
                        {a.id}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <input placeholder="Свій варіант (напр. Джакузі)" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
                  <button type="button" onClick={() => { if(customAmenity.trim()){ toggleAmenity(customAmenity.trim()); setCustomAmenity(""); } }} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Додати</button>
                </div>
                {editHotel.amenities?.filter((a: string) => !AMENITIES_LIST.some(am => am.id === a)).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-white/30 text-xs mt-1">Кастомні:</span>
                    {editHotel.amenities.filter((a: string) => !AMENITIES_LIST.some(am => am.id === a)).map((a: string) => (
                      <button type="button" key={a} onClick={() => toggleAmenity(a)} className="px-3 py-1.5 rounded-full text-xs font-medium border bg-[#C8102E] border-[#C8102E] text-white">
                        {a} ✕
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {editHotel.id && (
                <div className="col-span-2 mt-4 border-t border-white/10 pt-4">
                  <h4 className="text-white font-bold text-sm mb-3">Типи номерів</h4>
                  <div className="space-y-4 mb-4">
                    {roomTypes.map((rt, idx) => (
                      <div key={rt.id} className="bg-black/30 border border-white/10 p-4 rounded-xl relative">
                        <button type="button" onClick={() => handleDeleteRoomType(rt.id)} className="absolute top-4 right-4 text-white/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        <div className="grid grid-cols-4 gap-3 mb-3 pr-8">
                          <input value={rt.name} onChange={e => { const updated = [...roomTypes]; updated[idx].name = e.target.value; setRoomTypes(updated); }} className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white" placeholder="Назва (напр. Люкс)" />
                          <input type="number" placeholder="Кіл-ть місць" value={rt.capacity} onChange={e => { const updated = [...roomTypes]; updated[idx].capacity = Number(e.target.value); setRoomTypes(updated); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white" />
                          <input type="number" placeholder="Всього кімнат" value={rt.total_rooms || rt.totalRooms} onChange={e => { const updated = [...roomTypes]; updated[idx].total_rooms = Number(e.target.value); updated[idx].totalRooms = Number(e.target.value); setRoomTypes(updated); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white" />
                        </div>
                        <div className="text-xs text-white/50 mb-2">Доплата:</div>
                        <input type="number" placeholder="Доплата" value={rt.extra_price || rt.extraPrice} onChange={e => { const updated = [...roomTypes]; updated[idx].extra_price = Number(e.target.value); updated[idx].extraPrice = Number(e.target.value); setRoomTypes(updated); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white w-full mb-3" />
                        
                        <div className="text-xs text-white/50 mb-2">Зручності номера:</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {AMENITIES_LIST.map(a => {
                            const isSelected = rt.amenities?.includes(a.id);
                            return (
                              <button type="button" key={a.id} onClick={() => toggleAmenity(a.id, true, idx)} className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-colors ${isSelected ? 'bg-[#C8102E] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                                <a.icon className="w-3 h-3" />
                                {a.id}
                              </button>
                            )
                          })}
                        </div>
                        {rt.amenities?.filter((a: string) => !AMENITIES_LIST.some(am => am.id === a)).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {rt.amenities.filter((a: string) => !AMENITIES_LIST.some(am => am.id === a)).map((a: string) => (
                              <button type="button" key={a} onClick={() => toggleAmenity(a, true, idx)} className="px-2 py-1 rounded text-[10px] transition-colors bg-[#C8102E] text-white">
                                {a} ✕
                              </button>
                            ))}
                          </div>
                        )}
                        <button type="button" onClick={() => {
                          const custom = prompt("Введіть кастомну зручність для номера:");
                          if (custom && custom.trim()) toggleAmenity(custom.trim(), true, idx);
                        }} className="text-[#C8102E] text-[10px] mt-2 font-bold hover:underline">+ Додати інше</button>
                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSaveRoomType(rt)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
                          >
                            ✓ Зберегти номер
                          </button>
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
