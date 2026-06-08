'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext'; // Sepet verisini çekiyoruz
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount } = useCart(); // Sepetteki toplam ürün sayısını alıyoruz

  const cartCount = getCartCount();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-slate-900">
            ERSA <span className="text-blue-600">TİCARET</span>
          </span>
        </Link>

        {/* MASAÜSTÜ MENÜ */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
          <Link href="/urunler" className="hover:text-blue-600 transition-colors">Ürün Kataloğu</Link>
          <Link href="/rehber" className="hover:text-blue-600 transition-colors">Yedek Parça Rehberi</Link>
        </nav>

        {/* SAĞ TARAF: SEPET VE İLETİŞİM */}
        <div className="hidden md:flex items-center gap-4">
          {/* Alışveriş Sepeti İkonu */}
          <Link 
            href="/sepet" 
            className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all mr-2"
            title="Sipariş Listem"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50 duration-200">
                {cartCount}
              </span>
            )}
          </Link>

          <a 
            href="tel:+905525843073" 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-slate-900/5"
          >
            <Phone size={16} /> Hızlı Ara
          </a>
        </div>

        {/* MOBİL SAĞ TARAF (Mobil kullanıcılar için sepet ve menü) */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobil Sepet İkonu */}
          <Link 
            href="/sepet" 
            className="relative p-2 text-slate-600 hover:text-blue-600 rounded-xl"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobil Menü Butonu */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-slate-600 hover:text-blue-600 rounded-xl"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* MOBİL MENÜ SEÇENEKLERİ */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-3 font-semibold animate-in slide-in-from-top-5 duration-200">
          <Link href="/" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Ana Sayfa</Link>
          <Link href="/urunler" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Ürün Kataloğu</Link>
          <Link href="/rehber" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Yedek Parça Rehberi</Link>
          <Link href="/sepet" onClick={() => setIsOpen(false)} className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-between">
            <span>Sipariş Listem (Sepetim)</span>
            <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full">{cartCount} Ürün</span>
          </Link>
        </div>
      )}
    </header>
  );
}