'use client';
import Link from 'next/link';
import {
  MessageCircle,
  Phone,
  Package,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function FiyatDanismaPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full text-center">
        
        {/* LOGO */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
              E
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white leading-none">
                ERSA <span className="text-blue-400">TİCARET</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Online Yedek Parça
              </div>
            </div>
          </Link>
        </div>

        {/* BİLGİLENDİRME KARTI */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 text-slate-900 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <MessageCircle size={32} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Fiyat &amp; Parça Danışma Hattı
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
              Tüm kombi elektronik anakartları ve beyaz eşya yedek parçalarının güncel fiyat ve stok teyidi için doğrudan bizimle iletişime geçebilirsiniz.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="https://wa.me/905525843073?text=Merhaba,%20yedek%20parça%20fiyatı%20öğrenmek%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#25D366] hover:bg-[#1ea952] text-white font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 text-sm"
            >
              <MessageCircle size={20} className="fill-white/20" />
              <span>WhatsApp ile Fiyat Sorun</span>
            </a>

            <a
              href="tel:+905525843073"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm text-xs"
            >
              <Phone size={16} />
              <span>0552 584 30 73 Nolu Telefonu Arayın</span>
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <Link href="/urunler" className="hover:text-blue-600 flex items-center gap-1">
              <Package size={14} /> Ürün Kataloğunu İncele
            </Link>
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              Ana Sayfa <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
