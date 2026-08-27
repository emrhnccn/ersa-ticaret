'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  User,
  ChevronDown,
  Search,
  LogOut,
  Shield,
  Layers,
  Clock,
  MapPin
} from 'lucide-react';

let globalCategoriesCache: any[] | null = null;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [categories, setCategories] = useState<any[]>(() => globalCategoriesCache || []);

  const { user, isAdmin, logout } = useAuth();

  // Kategorileri sadece 1 kez çek ve bellekte tut
  useEffect(() => {
    if (globalCategoriesCache && globalCategoriesCache.length > 0) {
      setCategories(globalCategoriesCache);
      return;
    }
    fetch('/api/v1/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          globalCategoriesCache = data.categories;
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Canlı arama (AbortController ve 200ms debounce)
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => {
        fetch(`/api/v1/products?search=${encodeURIComponent(searchQuery)}&limit=5`, {
          signal: abortCtrl.signal,
        })
          .then(res => res.json())
          .then(data => {
            setSearchResults(data.items || []);
            setIsSearching(false);
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              setIsSearching(false);
            }
          });
      }, 200);

      return () => {
        clearTimeout(timer);
        abortCtrl.abort();
      };
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-xl w-full">
      {/* 1. ÜST BİLGİ VE İLETİŞİM BARI */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Sol: İletişim Bilgileri */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <a href="tel:+905525843073" className="hover:text-white flex items-center gap-1">
                <Phone size={12} className="text-blue-400" /> 0552 584 30 73
              </a>
              <span className="hidden md:inline text-slate-600">|</span>
              <a href="https://wa.me/905525843073" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-1 hover:text-emerald-400">
                <MessageCircle size={12} className="text-emerald-400" /> WhatsApp Fiyat &amp; Parça Hattı
              </a>
            </div>
          </div>

          {/* Sağ: Çalışma Saatleri & Kullanıcı Durumu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock size={12} className="text-amber-400" />
              <span>Pzt-Cmt: 08:30 - 19:00</span>
            </div>

            {/* Giriş Yapmış Kullanıcı */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-xs shadow-md shadow-blue-600/30 transition-all"
                  >
                    <Shield size={13} className="text-amber-300" />
                    <span>Admin Paneli</span>
                  </Link>
                ) : (
                  <Link
                    href="/hesap"
                    className="flex items-center gap-1.5 hover:text-blue-400 font-bold"
                  >
                    <User size={13} />
                    <span>{user.name || user.email}</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  title="Çıkış Yap"
                  className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <Link href="/giris" className="text-slate-400 hover:text-blue-400 font-bold text-[11px]">
                Giriş Yap
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* 2. ORTA BÖLÜM: LOGO + ARAMA KUTUSU + WHATSAPP FİYAT HATTI */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
            E
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white leading-none">
              ERSA <span className="text-blue-400">TİCARET</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Online Yedek Parça
            </div>
          </div>
        </Link>

        {/* CANLI ARAMA ÇUBUĞU */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, OEM parça kodu, marka veya model arayın..."
              className="w-full pl-11 pr-24 py-2.5 bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <button
              onClick={() => {
                if (searchQuery) window.location.href = `/urunler?search=${encodeURIComponent(searchQuery)}`;
              }}
              className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Ara
            </button>
          </div>

          {/* Canlı Arama Sonuç Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 flex justify-between">
                <span>Eşleşen Parçalar ({searchResults.length})</span>
                <span className="text-blue-600">Enter tuşuna basarak tümünü gör</span>
              </div>
              <div className="divide-y divide-slate-100">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/urunler/${p.slug}`}
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="p-3 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative shrink-0 bg-slate-50 rounded-lg overflow-hidden p-1 border border-slate-100">
                        <Image src={p.imageUrl || 'https://placehold.co/400x400'} alt={p.name} fill unoptimized sizes="40px" className="object-contain p-0.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">OEM: {p.sku} | {p.brandName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        Fiyat Sorun
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Stokta: {p.stockQty || 'Var'} {p.unit || 'Adet'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ AKSİYONLAR: WHATSAPP FİYAT HATTI */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/905525843073?text=Merhaba,%20parça%20fiyatı%20ve%20stok%20sorgulamak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs font-bold"
          >
            <MessageCircle size={17} className="fill-white/20" />
            <span className="hidden sm:inline">WhatsApp Fiyat Hattı</span>
            <span className="sm:hidden">Fiyat Sor</span>
          </a>

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-xl md:hidden"
            aria-label="Menüyü Aç/Kapat"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 3. ALT BÖLÜM: KATEGORİ & HIZLI MENÜ */}
      <div className="bg-slate-800 border-t border-slate-700/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          <div className="flex items-center gap-6 text-xs font-bold text-slate-200">
            {/* Tüm Kategoriler Açılır Buton */}
            <div className="relative">
              <button
                onClick={() => setShowCatMenu(!showCatMenu)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition-colors"
              >
                <Layers size={16} />
                <span>TÜM KATEGORİLER</span>
                <ChevronDown size={14} className={`transition-transform ${showCatMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Dropdown */}
              {showCatMenu && (
                <div
                  onMouseLeave={() => setShowCatMenu(false)}
                  className="absolute top-full left-0 w-72 bg-white text-slate-800 shadow-2xl rounded-b-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150"
                >
                  <div className="p-2 font-black text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Ürün Grupları
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/urunler?category=${cat.slug}`}
                      onClick={() => setShowCatMenu(false)}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors text-xs font-semibold"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                        {cat._count?.products || 0}
                      </span>
                    </Link>
                  ))}
                  <div className="p-2 border-t border-slate-100 mt-1">
                    <Link
                      href="/urunler"
                      onClick={() => setShowCatMenu(false)}
                      className="block text-center py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                      Tüm Kataloğu Gör
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Hızlı Menü Linkleri */}
            <Link href="/" className="hover:text-blue-400 py-3 transition-colors">Ana Sayfa</Link>
            <Link href="/urunler" className="hover:text-blue-400 py-3 transition-colors">Yedek Parça Kataloğu</Link>
            <Link href="/rehber" className="hover:text-blue-400 py-3 transition-colors">Teknik Rehber</Link>
            <Link href="/kurumsal" className="hover:text-blue-400 py-3 transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-blue-400 py-3 transition-colors">İletişim &amp; Mağazamız</Link>
          </div>

          {/* Hızlı Telefon Bilgisi */}
          <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
            <a
              href="tel:+905525843073"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <Phone size={13} /> 0552 584 30 73
            </a>
          </div>

        </div>
      </div>

      {/* MOBİL MENÜ DRAWER */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Parça veya kod ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm border border-slate-700"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          </div>

          <div className="space-y-1 font-semibold text-slate-200 text-sm">
            <Link href="/" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Ana Sayfa</Link>
            <Link href="/urunler" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Yedek Parça Kataloğu</Link>
            <Link href="/rehber" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Teknik Rehber</Link>
            <Link href="/kurumsal" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Hakkımızda</Link>
            <Link href="/iletisim" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">İletişim</Link>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <a
              href="https://wa.me/905525843073?text=Merhaba,%20parça%20fiyatı%20ve%20stok%20sorgulamak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#25D366] hover:bg-[#1ea952] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle size={18} /> WhatsApp ile Fiyat Sor
            </a>
            <a
              href="tel:+905525843073"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm border border-slate-700"
            >
              <Phone size={16} className="text-blue-400" /> 0552 584 30 73
            </a>
          </div>
        </div>
      )}
    </header>
  );
}