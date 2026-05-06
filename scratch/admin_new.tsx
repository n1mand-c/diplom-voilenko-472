"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { 
  Building2, Users, CalendarDays, TrendingUp, BarChart3, Star, MapPin, 
  CheckCircle, Clock, XCircle, Search, Filter, Plus, Edit2, Trash2, 
  Settings, Loader2, ArrowUpRight, BedDouble, Mail, MessageSquare, Send,
  UserCheck, Map
} from "lucide-react";
import { format } from "date-fns";

const AMENITIES_LIST = [
  "WiFi", "Басейн", "Спа", "Парковка", "Сніданок", "Тренажерний зал", 
  "Трансфер", "Ресторан", "Бар", "Кондиціонер", "Телевізор"
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Hotel Modal State
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [hotelForm, setHotelForm] = useState<any>({ name: "", location: "", sport: "ski", sportLabel: "Лижі", price: 0, stars: 4, description: "", images: [], amenities: [] });
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isSavingHotel, setIsSavingHotel] = useState(false);

  // Messages State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, statRes, bookRes, hotRes, userRes, tickRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/hotels"),
        fetch("/api/admin/users"),
        fetch("/api/contacts") // Admins/Managers get all tickets
      ]);
      const sData = await sessRes.json();
      setSession(sData.user);
      
      if (statRes.ok) setStats((await statRes.json()).stats);
      if (bookRes.ok) setBookings((await bookRes.json()).bookings);
      if (hotRes.ok) setHotels((await hotRes.json()).hotels);
      if (userRes.ok) setUsers((await userRes.json()).users);
      if (tickRes.ok) setTickets((await tickRes.json()).tickets);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const navItems = [
    { id: "bookings", label: "Бронювання", icon: CalendarDays },
    { id: "hotels", label: "Готелі", icon: Building2 },
    { id: "occupancy", label: "Зайнятість", icon: BedDouble },
    { id: "messages", label: "Повідомлення", icon: MessageSquare },
    ...(session?.role === 'ROLE_ADMIN' ? [{ id: "users", label: "Користувачі", icon: Users }] : []),
    { id: "revenue", label: "Доходи", icon: TrendingUp },
    { id: "analytics", label: "Аналітика", icon: BarChart3 },
  ];

  // ===================== MESSAGES TAB =====================
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

  // ===================== HOTEL MODAL FUNCTIONS =====================
  const openHotelModal = async (hotel: any = null) => {
    setEditingHotel(hotel);
    if (hotel) {
      setHotelForm({ ...hotel, images: hotel.images || [], amenities: hotel.amenities || [] });
      const res = await fetch(`/api/room-types?hotelId=${hotel.id}`);
      if (res.ok) setRoomTypes((await res.json()).roomTypes || []);
    } else {
      setHotelForm({ name: "", location: "", sport: "ski", sportLabel: "Лижі", price: 0, stars: 4, description: "", images: [], amenities: [] });
      setRoomTypes([]);
    }
    setIsHotelModalOpen(true);
  };

  const saveHotel = async () => {
    setIsSavingHotel(true);
    try {
      const isEdit = !!editingHotel;
      const url = isEdit ? `/api/admin/hotels/${editingHotel.id}` : `/api/admin/hotels`;
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(hotelForm) });
      if (res.ok) {
        const data = await res.json();
        const hotelId = isEdit ? editingHotel.id : data.hotelId;
        
        // Save Room Types
        for (const rt of roomTypes) {
          if (rt.id && String(rt.id).startsWith("new_")) {
            await fetch("/api/room-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hotelId, ...rt }) });
          } else if (rt.id) {
            await fetch(`/api/room-types/${rt.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...rt }) });
          }
        }
        
        fetchData();
        setIsHotelModalOpen(false);
      }
    } catch(e) {}
    setIsSavingHotel(false);
  };

  const toggleAmenity = (amenity: string, isRoomType: boolean = false, rtIndex: number = -1) => {
    if (isRoomType) {
      const updated = [...roomTypes];
      const rt = updated[rtIndex];
      const am = rt.amenities || [];
      updated[rtIndex].amenities = am.includes(amenity) ? am.filter((a: string) => a !== amenity) : [...am, amenity];
      setRoomTypes(updated);
    } else {
      const am = hotelForm.amenities || [];
      setHotelForm({ ...hotelForm, amenities: am.includes(amenity) ? am.filter((a: string) => a !== amenity) : [...am, amenity] });
    }
  };

  // ===================== RENDER FUNCTIONS =====================
  const renderMessages = () => (
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
                const isAdmin = m.sender_role !== 'ROLE_USER';
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
              <button disabled={!newMessage.trim()} type="submit" className="bg-[#C8102E] text-white px-4 py-2 rounded-xl disabled:opacity-50"><Send className="w-4 h-4" /></button>
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
  );

  const renderOccupancy = () => {
    // Simple mock calculation for occupancy visualization
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Зайнятість номерів (Occupancy)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map(h => (
            <div key={h.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-white mb-2">{h.name}</h3>
              <div className="flex justify-between text-sm text-white/50 mb-4">
                <span>Всього номерів: {h.room_types_count * 10}</span>
                <span>Активних бронювань: {h.active_bookings}</span>
              </div>
              <div className="w-full bg-black/50 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (h.active_bookings / (h.room_types_count * 10 || 1)) * 100)}%` }} 
                />
              </div>
              <div className="mt-2 text-right text-xs text-white/40">
                Завантаженість: {Math.round(Math.min(100, (h.active_bookings / (h.room_types_count * 10 || 1)) * 100))}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Користувачі та Ролі</h2>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/40 uppercase bg-black/40">
              <th className="p-4 font-medium">Користувач</th>
              <th className="p-4 font-medium">Роль</th>
              <th className="p-4 font-medium">Готель (Для менеджера)</th>
              <th className="p-4 font-medium">Дії</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">
                  <div className="font-medium">{u.username}</div>
                  <div className="text-xs text-white/40">{u.email}</div>
                </td>
                <td className="p-4">
                  <select 
                    value={u.role}
                    onChange={(e) => {
                      fetch(`/api/admin/users/${u.id}`, {
                        method: 'PUT', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ role: e.target.value, hotelId: u.hotelId })
                      }).then(() => fetchData());
                    }}
                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="ROLE_USER">Користувач</option>
                    <option value="ROLE_MANAGER">Менеджер</option>
                    <option value="ROLE_ADMIN">Адміністратор</option>
                  </select>
                </td>
                <td className="p-4">
                  {u.role === 'ROLE_MANAGER' && (
                    <select 
                      value={u.hotelId || ""}
                      onChange={(e) => {
                        fetch(`/api/admin/users/${u.id}`, {
                          method: 'PUT', headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ role: u.role, hotelId: e.target.value || null })
                        }).then(() => fetchData());
                      }}
                      className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs max-w-[150px]"
                    >
                      <option value="">Оберіть готель</option>
                      {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-xs text-white/30">Реєстрація: {format(new Date(u.created_at), 'dd.MM.yyyy')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex text-white pt-[72px]">
      <Navbar transparent={false} />
      {/* Sidebar */}
      <div className="w-64 bg-[#0A0A0F] border-r border-white/5 fixed bottom-0 top-[72px] overflow-y-auto">
        <div className="p-6">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Меню панелі</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-[#C8102E]/10 text-[#C8102E] font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#C8102E]" : ""}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-white/50"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {activeTab === "messages" && renderMessages()}
            {activeTab === "occupancy" && renderOccupancy()}
            {activeTab === "users" && renderUsers()}
            
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Всі бронювання</h2>
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">{b.guest_name}</div>
                        <div className="text-sm text-white/50">{b.guest_email} • {b.hotel_name}</div>
                        <div className="text-xs text-white/40 mt-1">{format(new Date(b.check_in), 'dd.MM.yyyy')} - {format(new Date(b.check_out), 'dd.MM.yyyy')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[#C8102E] text-xl">{Number(b.total_price).toLocaleString()} ₴</div>
                        <div className="text-xs mt-1 px-2 py-1 bg-white/10 rounded inline-block">{b.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "hotels" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Управління Готелями</h2>
                  {session?.role === 'ROLE_ADMIN' && (
                    <button onClick={() => openHotelModal()} className="bg-[#C8102E] hover:bg-[#a00d25] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Додати Готель
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((h) => (
                    <div key={h.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-xl leading-tight max-w-[80%]">{h.name}</h3>
                        {(session?.role === 'ROLE_ADMIN' || (session?.role === 'ROLE_MANAGER' && session?.hotelId === h.id)) && (
                          <button onClick={() => openHotelModal(h)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-white/50 mb-4 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{h.location}</div>
                      <div className="flex flex-wrap gap-2 text-xs mb-4">
                        <span className="bg-white/10 px-2 py-1 rounded border border-white/5">Зручності: {h.amenities?.length || 0}</span>
                        <span className="bg-white/10 px-2 py-1 rounded border border-white/5">Типи номерів: {h.room_types_count}</span>
                        <span className="bg-white/10 px-2 py-1 rounded border border-white/5">Ціна від: {h.price} ₴</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* HOTEL MODAL */}
            {isHotelModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                  <div className="sticky top-0 bg-[#111]/90 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">{editingHotel ? "Редагувати Готель" : "Новий Готель"}</h2>
                    <button onClick={() => setIsHotelModalOpen(false)} className="text-white/50 hover:text-white"><XCircle className="w-6 h-6" /></button>
                  </div>
                  <div className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/50 uppercase mb-1 block">Назва</label>
                        <input value={hotelForm.name} onChange={e => setHotelForm({...hotelForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase mb-1 block">Локація</label>
                        <input value={hotelForm.location} onChange={e => setHotelForm({...hotelForm, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase mb-1 block">Базова ціна (₴)</label>
                        <input type="number" value={hotelForm.price} onChange={e => setHotelForm({...hotelForm, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase mb-1 block">Зірки</label>
                        <input type="number" max="5" min="1" value={hotelForm.stars} onChange={e => setHotelForm({...hotelForm, stars: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h3 className="text-lg font-bold mb-3 border-b border-white/10 pb-2">Зручності Готелю</h3>
                      <div className="flex flex-wrap gap-2">
                        {AMENITIES_LIST.map(a => {
                          const isSelected = hotelForm.amenities?.includes(a);
                          return (
                            <button key={a} onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-[#C8102E] border-[#C8102E] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                              {a}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Room Types */}
                    <div>
                      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                        <h3 className="text-lg font-bold">Типи номерів</h3>
                        <button onClick={() => setRoomTypes([...roomTypes, { id: `new_${Date.now()}`, name: "Новий номер", capacity: 2, extraPrice: 0, totalRooms: 1, amenities: [] }])} className="text-[#C8102E] text-sm hover:underline font-bold">+ Додати номер</button>
                      </div>
                      <div className="space-y-4">
                        {roomTypes.map((rt, idx) => (
                          <div key={rt.id} className="bg-black/30 border border-white/10 p-4 rounded-xl">
                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <input value={rt.name} onChange={e => { const updated = [...roomTypes]; updated[idx].name = e.target.value; setRoomTypes(updated); }} className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm" placeholder="Назва (напр. Люкс)" />
                              <input type="number" placeholder="Кіл-ть місць" value={rt.capacity} onChange={e => { const updated = [...roomTypes]; updated[idx].capacity = Number(e.target.value); setRoomTypes(updated); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm" />
                              <input type="number" placeholder="Всього кімнат" value={rt.totalRooms} onChange={e => { const updated = [...roomTypes]; updated[idx].totalRooms = Number(e.target.value); setRoomTypes(updated); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm" />
                            </div>
                            <div className="text-xs text-white/50 mb-2">Зручності номера:</div>
                            <div className="flex flex-wrap gap-2">
                              {AMENITIES_LIST.map(a => {
                                const isSelected = rt.amenities?.includes(a);
                                return (
                                  <button key={a} onClick={() => toggleAmenity(a, true, idx)} className={`px-2 py-1 rounded text-[10px] transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-black/40 text-white/40 hover:bg-white/10'}`}>
                                    {a}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sticky bottom-0 bg-[#111]/90 backdrop-blur-md p-4 border-t border-white/10 flex justify-end gap-3 z-10">
                    <button onClick={() => setIsHotelModalOpen(false)} className="px-5 py-2 rounded-xl border border-white/10 text-sm">Скасувати</button>
                    <button onClick={saveHotel} disabled={isSavingHotel} className="bg-[#C8102E] hover:bg-[#a00d25] px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      {isSavingHotel ? <Loader2 className="w-4 h-4 animate-spin" /> : "Зберегти"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
