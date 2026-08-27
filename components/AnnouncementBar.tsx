'use client';
import { Phone, Clock } from 'lucide-react';

function isOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0=Pazar, 6=Cumartesi
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 60 + minutes;

  if (day === 0) {
    // Pazar: 13:00 - 17:00
    return time >= 780 && time < 1020;
  } else if (day >= 1 && day <= 6) {
    // Pzt-Cmt: 08:30 - 19:00
    return time >= 510 && time < 1140;
  }
  return false;
}

export default function AnnouncementBar() {
  const open = isOpen();

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Sol: Telefon ve Saat */}
        <div className="flex items-center gap-4 sm:gap-6 text-slate-400 font-medium">
          <a 
            href="tel:+905525843073" 
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone size={13} className="text-blue-400" />
            <span className="hidden sm:inline">Fiyat &amp; Parça Hattı:</span>
            <span className="text-white font-bold">0552 584 30 73</span>
          </a>
          <span className="hidden lg:flex items-center gap-2">
            <Clock size={14} className="text-emerald-400" />
            <span><span className="font-semibold text-white">Pzt-Cmt:</span> 08:30-19:00</span>
            <span className="text-slate-600">|</span>
            <span><span className="font-semibold text-white">Pazar:</span> 13:00-17:00</span>
          </span>
        </div>

        {/* Sağ: Açık/Kapalı durumu */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`font-bold ${open ? 'text-emerald-400' : 'text-red-400'}`}>
            {open ? 'Açık' : 'Kapalı'}
          </span>
        </div>
      </div>
    </div>
  );
}
