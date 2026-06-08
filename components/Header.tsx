'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext'; 
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount } = useCart();

  const cartCount = getCartCount();

  return (
    
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        
        {/* LOGO VE KURUMSAL YAZI (Yazılar beyaza uyarlandı) */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img 
            src="/logo.png" 
            alt="Ersa Ticaret Logo" 
            className="h-9 w-auto object-contain bg-white/10 rounded-md p-1" // Karanlıkta logo daha iyi görünsün diye ufak bir parlama efekti
          />
          <span className="text-xl font-black tracking-tight text-white hidden sm:inline-block">
            ERSA <span className="text-blue-400">TİCARET</span>
          </span>
        </Link>

        {/* MASAÜSTÜ MENÜ (Açık gri yazılar) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
          <Link href="/urunler" className="hover:text-white transition-colors">Ürün Kataloğu</Link>
          <Link href="/rehber" className="hover:text-white transition-colors">Yedek Parça Rehberi</Link>
          <Link href="/kurumsal" className="hover:text-white transition-colors">Mağazamız</Link>
          <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
        </nav>

        {/* SAĞ TARAF: SEPET VE HIZLI AKSİYONLAR */}
        <div className="hidden md:flex items-center gap-3">
          {/* Alışveriş Sepeti */}
          <Link 
            href="/sepet" 
            className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Sipariş Listem"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-in zoom-in-50 duration-200">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hızlı Arama Butonu (Karanlık temada parlaması için mavi yapıldı) */}
          <a 
            href="tel:+905525843073" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap"
          >
            <Phone size={15} /> Hızlı Ara
          </a>
        </div>

        {/* MOBİL SAĞ TARAF */}
        <div className="flex items-center gap-1 md:hidden">
          {/* Mobil Sepet İkonu */}
          <Link 
            href="/sepet" 
            className="relative p-2 text-slate-300 hover:text-white rounded-xl"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-900">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobil Menü Butonu */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-slate-300 hover:text-white rounded-xl"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* MOBİL MENÜ PANELI (Okunabilirlik için beyaz bırakıldı) */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-2xl p-4 flex flex-col gap-2 font-semibold animate-in slide-in-from-top-5 duration-200">
          <Link href="/" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Ana Sayfa</Link>
          <Link href="/urunler" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Ürün Kataloğu</Link>
          <Link href="/rehber" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Yedek Parça Rehberi</Link>
          <Link href="/kurumsal" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">Mağazamız</Link>
          <Link href="/iletisim" onClick={() => setIsOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-700">İletişim</Link>
          
          <div className="border-t border-slate-100 my-2 pt-2">
            <Link href="/sepet" onClick={() => setIsOpen(false)} className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-between">
              <span>Sipariş Listem (Sepetim)</span>
              <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full">{cartCount} Ürün</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}