import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, Wrench, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t-4 border-blue-600 relative overflow-hidden">
      
      {/* Arka Plan Süsleri */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[100%] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Üst Kısım: 4 Kolonlu Yapı */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-16">
          
          {/* 1. Kolon: Marka ve Güven Rozetleri */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-white tracking-wider">
              ERSA<span className="text-blue-500">TİCARET</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Darıca ve Kocaeli bölgesinin en büyük toptan ve perakende kombi/beyaz eşya yedek parça tedarik merkezi.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <ShieldCheck size={18} className="text-emerald-400" /> %100 Orijinal Parçalar
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <Truck size={18} className="text-blue-400" /> Anında Stoktan Teslim
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <Wrench size={18} className="text-amber-400" /> Teknik Servis Desteği
              </div>
            </div>
          </div>

          {/* 2. Kolon: Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              {[
                { name: 'Ana Sayfa', href: '/' },
                { name: 'Mağazamız', href: '/kurumsal' },
                { name: 'Ürün Kataloğu', href: '/urunler' },
                { name: 'Parça Rehberi', href: '/rehber' },
                { name: 'İletişim', href: '/iletisim' },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 hover:text-blue-400 flex items-center gap-2 text-sm font-medium transition-colors group">
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Kolon: İletişim Bilgileri */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <span>Nenehatun, Battal Gazi Cd. No:139/A<br />41700 Darıca / Kocaeli</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone size={18} className="text-emerald-500 shrink-0" />
                <a href="tel:+905525843073" className="hover:text-white transition-colors font-medium">+90 552 584 30 73</a>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail size={18} className="text-amber-500 shrink-0" />
                <a href="mailto:info@ersaticaret.com" className="hover:text-white transition-colors">info@ersaticaret.com</a>
              </li>
            </ul>
          </div>

          {/* 4. Kolon: Çalışma Saatleri */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Çalışma Saatleri</h3>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <ul className="space-y-3">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2"><Clock size={16} /> Pzt - Cmt:</span>
                  <span className="text-white font-bold">08:30 - 19:00</span>
                </li>
                <li className="flex items-center justify-between text-sm pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400 flex items-center gap-2"><Clock size={16} /> Pazar:</span>
                  <span className="text-blue-400 font-bold">13:00 - 17:00</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Alt Kısım: Copyright ve İmza */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm">
          <p className="text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Ersa Ticaret. Tüm hakları saklıdır.
          </p>
          <div className="text-slate-500 font-medium flex items-center gap-1">
            Geliştirici: 
            {/* GÜNCELLENEN PORTFOLYO LİNKİ */}
            <a 
              href="https://affan-portfolio-gilt.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold hover:opacity-80 transition-opacity tracking-wide ml-1"
            >
              CCN TEKNOLOJİ
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}