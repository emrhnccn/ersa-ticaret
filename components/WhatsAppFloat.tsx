'use client';
import { MessageCircle, PhoneCall } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const waUrl = `https://wa.me/905525843073?text=${encodeURIComponent(
    'Merhaba Ersa Ticaret, yedek parça ve teknik danışma için bilgi almak istiyorum.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      
      {/* Mini Hızlı Mesaj Baloncuğu */}
      <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 hidden sm:flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Teknik Parça &amp; WhatsApp Destek</span>
      </div>

      {/* Ana Buton */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 relative animate-wa-pulse"
        aria-label="WhatsApp üzerinden teknik destek ve sipariş"
      >
        <MessageCircle size={30} className="fill-white/20" />
      </a>
    </div>
  );
}
