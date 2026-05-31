'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 shadow-md' : 'bg-slate-900 border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo Bölümü */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-14 w-14 flex items-center justify-center transition-transform group-hover:scale-105">
             <img 
               src="/logo.png" 
               alt="Ersa Ticaret Logo" 
               className="object-contain w-full h-full"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
               }}
             />
          </div>
          <div>
            <span className="font-extrabold text-xl text-white tracking-tight block leading-none">ERSA</span>
            <span className="font-bold text-xs text-blue-400 tracking-widest uppercase">TİCARET</span>
          </div>
        </Link>

        {/* Masaüstü Menü */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
          <Link href="/kurumsal" className="hover:text-white transition-colors">Mağazamız</Link>
          <Link href="/urunler" className="hover:text-white transition-colors">Ürün Katalog</Link>
          <Link href="/rehber" className="hover:text-white transition-colors">Parça Rehberi</Link>
          <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
          <a href="tel:05525843073" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25">
            <Phone size={16} /> 0552 584 30 73
          </a>
        </nav>

        {/* Mobil Menü Tetikleyici */}
        <button className="md:hidden p-2 text-slate-300 hover:text-white transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobil Menü İçeriği */}
      <div className={`md:hidden absolute w-full bg-slate-900 border-b border-slate-800 shadow-xl transition-all duration-300 origin-top ${isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
        <div className="flex flex-col p-6 gap-6">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Ana Sayfa</Link>
          <Link href="/kurumsal" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Mağazamız</Link>
          <Link href="/urunler" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Ürün Kataloğu</Link>
          <Link href="/rehber" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Parça Rehberi</Link>
          <Link href="/iletisim" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">İletişim</Link>
          <a href="tel:05525843073" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-500/25">
            <Phone size={20} /> Hemen Ara
          </a>
        </div>
      </div>
    </header>
  );
}