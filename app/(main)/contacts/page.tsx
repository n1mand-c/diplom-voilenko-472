"use client";
import { useState, useEffect } from "react";
import { Send, MapPin, Phone, Mail, Clock, MessageSquare, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/ui/navbar";

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'tickets'>('form');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  const [form, setForm] = useState({ name: '', email: '', hotelId: '', subject: '', message: '' });
  const [hotels, setHotels] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Chat state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    fetch("/api/hotels")
      .then(res => res.json())
      .then(data => setHotels(data.hotels || []));
      
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        if (data.tickets) setTickets(data.tickets);
      }
    } catch(e) {}
    setLoadingTickets(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setForm({ name: '', email: '', hotelId: '', subject: '', message: '' });
        fetchTickets();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const errorData = await res.json();
        if (res.status === 401) alert("Будь ласка, авторизуйтесь, щоб надіслати повідомлення");
        else alert(errorData.error || "Помилка відправки");
      }
    } catch(e) {
      alert("Помилка відправки");
    }
    setIsSubmitting(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    
    setSendingMsg(true);
    try {
      const res = await fetch(`/api/contacts/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage })
      });
      if (res.ok) {
        setNewMessage("");
        loadMessages(selectedTicket.id);
        fetchTickets();
        // Update ticket status to open in local state if it was closed
        if (selectedTicket.status === 'closed') {
           setSelectedTicket({...selectedTicket, status: 'open'});
        }
      }
    } catch(e) {}
    setSendingMsg(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8102E]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#001E62]/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Зв&apos;яжіться з <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8102E] to-red-600">Нами</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Є запитання щодо бронювання чи послуг готелю? Наша команда підтримки готова допомогти вам 24/7.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => { setActiveTab('form'); setSelectedTicket(null); }}
            className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'form' ? 'bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/30' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            Написати нам
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-8 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'tickets' ? 'bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/30' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Мої звернення
            {tickets.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{tickets.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-[#111] border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Надіслати повідомлення</h2>
              
              {submitSuccess ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-8 rounded-2xl flex flex-col items-center justify-center text-center h-[300px]">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Повідомлення надіслано!</h3>
                  <p className="text-green-400/70">Ми отримали ваш запит і відповімо найближчим часом. Ви можете стежити за статусом у вкладці &quot;Мої звернення&quot;.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Ваше ім&apos;я</label>
                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors" placeholder="Іван Іванов" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Email</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors" placeholder="ivan@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Тема / Готель (опціонально)</label>
                    <div className="grid grid-cols-2 gap-5">
                      <select value={form.hotelId} onChange={e => setForm({...form, hotelId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors">
                        <option value="">Загальне питання</option>
                        {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors" placeholder="Тема повідомлення" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Повідомлення</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors resize-none" placeholder="Опишіть ваше питання..." />
                  </div>
                  <button disabled={isSubmitting} type="submit" className="w-full bg-[#C8102E] text-white py-4 rounded-xl font-bold hover:bg-[#a00d25] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Надіслати</>}
                  </button>
                </form>
              )}
            </div>

            {/* Info Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111] border border-white/10 p-8 rounded-3xl flex items-start gap-5 group hover:border-white/20 transition-colors">
                <div className="w-12 h-12 bg-[#C8102E]/10 rounded-2xl flex items-center justify-center text-[#C8102E] shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Головний офіс</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Red Bull Headquarters<br/>Fuschl am See, Salzburg<br/>Austria</p>
                </div>
              </div>
              
              <div className="bg-[#111] border border-white/10 p-8 rounded-3xl flex items-start gap-5 group hover:border-white/20 transition-colors">
                <div className="w-12 h-12 bg-[#C8102E]/10 rounded-2xl flex items-center justify-center text-[#C8102E] shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Телефон підтримки</h3>
                  <p className="text-white/60 text-sm mb-1">+43 662 6582 0</p>
                  <p className="text-white/40 text-xs">Пн-Пт, 09:00 - 18:00 (CET)</p>
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 p-8 rounded-3xl flex items-start gap-5 group hover:border-white/20 transition-colors">
                <div className="w-12 h-12 bg-[#C8102E]/10 rounded-2xl flex items-center justify-center text-[#C8102E] shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Електронна пошта</h3>
                  <p className="text-white/60 text-sm">hotels@redbull.com</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden h-[600px] flex">
            {!selectedTicket ? (
              <div className="w-full p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Історія звернень</h2>
                {loadingTickets ? (
                  <div className="flex justify-center py-20 text-white/50"><Loader2 className="w-8 h-8 animate-spin" /></div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-20">
                    <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/50">У вас ще немає звернень.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => handleTicketClick(t)}
                        className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors text-left group"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${t.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                              {t.status === 'open' ? 'Відкрито' : 'Закрито'}
                            </span>
                            <span className="text-white/40 text-xs">{format(new Date(t.created_at), 'dd.MM.yyyy HH:mm')}</span>
                          </div>
                          <h4 className="text-white font-medium group-hover:text-[#C8102E] transition-colors">{t.subject}</h4>
                          <p className="text-white/40 text-sm mt-1">{t.hotel_name || 'Загальне питання'}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-white/50 text-sm group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                            {t.messages_count}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full bg-[#161616]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedTicket(null)} className="text-white/50 hover:text-white transition-colors p-2 rounded-lg bg-white/5 hover:bg-white/10">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-white font-bold leading-tight">{selectedTicket.subject}</h3>
                      <div className="text-white/40 text-xs mt-0.5 flex items-center gap-2">
                        <span>{selectedTicket.hotel_name || 'Загальне питання'}</span>
                        <span>•</span>
                        <span className={selectedTicket.status === 'open' ? 'text-green-400' : 'text-white/40'}>
                          {selectedTicket.status === 'open' ? 'Активне' : 'Закрито'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((m: any) => {
                    const isUser = m.sender_type === 'ROLE_USER';
                    return (
                      <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`text-[10px] text-white/30 mb-1 px-1 flex items-center gap-2`}>
                          {!isUser && <span className="text-[#C8102E] font-bold">Підтримка Red Bull</span>}
                          <span>{format(new Date(m.created_at), 'dd.MM HH:mm')}</span>
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          isUser 
                            ? 'bg-[#C8102E] text-white rounded-tr-none' 
                            : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                        }`}>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 bg-black/20 border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input 
                      value={newMessage} 
                      onChange={e => setNewMessage(e.target.value)} 
                      placeholder={selectedTicket.status === 'closed' ? "Написати повідомлення (звернення буде відкрито знову)..." : "Ваше повідомлення..."}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C8102E]/50 transition-colors"
                    />
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendingMsg}
                      className="bg-[#C8102E] hover:bg-[#a00d25] text-white px-6 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                    >
                      {sendingMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
    </>
  );
}
