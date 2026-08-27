'use client';
import Link from 'next/link';
import {
  MessageCircle,
  Phone,
  Package,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';

export default function SepetPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center bg-slate-50 p-4 py-16">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <MessageCircle size={40} className="fill-blue-600/10" />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Fiyat &amp; Sipariş Danışma Modeli
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Ersa Ticaret Online Yedek Parça olarak, tüm kombi elektronik kartları ve beyaz eşya yedek parçalarımız için doğrudan <strong>WhatsApp Fiyat Hattımız</strong> ve telefonumuz üzerinden anında fiyat, stok ve montaj teyidi veriyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="https://wa.me/905525843073?text=Merhaba,%20parça%20fiyatı%20ve%20stok%20bilgisi%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-[#25D366] hover:bg-[#1ea952] text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm"
          >
            <MessageCircle size={20} className="fill-white/20" />
            <span>WhatsApp ile Fiyat Sor</span>
          </a>

          <a
            href="tel:+905525843073"
            className="p-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm"
          >
            <Phone size={18} className="text-blue-400" />
            <span>0552 584 30 73</span>
          </a>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Package size={16} /> 3.600+ Parça Kataloğuna Göz At <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}