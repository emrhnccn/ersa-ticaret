'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  MessageCircle,
  User,
  Building2,
  ChevronDown,
  Search,
  CreditCard,
  LogOut,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

let globalCategoriesCache: any[] | null = null;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [categories, setCategories] = useState<any[]>(() => globalCategoriesCache || []);

  const { getCartCount, getTotals, currency, setCurrency } = useCart();
  const { user, isB2B, isAdmin, logout } = useAuth();

  const cartCount = getCartCount();
  const totals = getTotals();

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

  // Canlı arama (AbortController ve 200ms debounce ile yarış durumlarını önler)
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => {
        fetch(`/api/v1/products?search=${encodeURIComponent(searchQuery)}&limit=5&currency=${currency}`, {
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
  }, [searchQuery, currency]);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-xl w-full">
      {/* 1. ÜST BİLGİ VE DÖVİZ / B2B BARI (Çiğdem Soğutma Tarzı) */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Sol: İletişim Bilgileri */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <a href="tel:+905525843073" className="hover:text-white flex items-center gap-1">
                <Phone size={12} className="text-blue-400" /> 0552 584 30 73
              </a>
              <span className="hidden md:inline text-slate-600">|</span>
              <a href="https://wa.me/905525843073" target="_blank" className="hidden md:flex items-center gap-1 hover:text-emerald-400">
                <MessageCircle size={12} className="text-emerald-400" /> WhatsApp Destek
              </a>
            </div>
          </div>

          {/* Sağ: Döviz Seçici + Kullanıcı Durumu */}
          <div className="flex items-center gap-3">
            {/* Döviz Seçici */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setCurrency('TRY')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${currency === 'TRY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ₺ TL
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${currency === 'EUR' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                € EUR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                $ USD
              </button>
            </div>

            {/* B2B Cari Göstergesi */}
            {isB2B && user?.company && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold">
                <Building2 size={13} />
                <span>{user.company.customerGroup?.name || 'Bayi Hesabı'}</span>
              </div>
            )}

            {/* Giriş Yapmış Kullanıcı / Bayi Girişi Linki */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-xs shadow-md shadow-blue-600/30 transition-all"
                  >
                    <span>👑 Admin Paneli</span>
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
              <div className="flex items-center gap-2">
                <Link href="/giris" className="hover:text-blue-400 font-bold">
                  Giriş Yap
                </Link>
                <span className="text-slate-700">/</span>
                <Link href="/b2b-basvuru" className="text-blue-400 hover:text-blue-300 font-bold">
                  B2B Bayi Başvurusu
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 2. ORTA BÖLÜM: LOGO + ARAMA KUTUSU + SEPET */}
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
              B2B &amp; B2C Yedek Parça
            </div>
          </div>
        </Link>

        {/* CANLI ARAMA ÇUBUĞU (Çiğdem Soğutma Tarzı) */}
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
                      <div className="text-sm font-extrabold text-blue-600">{p.priceQuote?.vatExcludedLabel}</div>
                      <div className="text-[10px] text-slate-400">Stokta: {p.stockQty} {p.unit}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ AKSİYONLAR: SEPET & HESAP */}
        <div className="flex items-center gap-3">
          {/* Müşteri / Bayi Portalı Butonu */}
          <Link
            href={user ? (isAdmin ? "/admin" : "/hesap") : "/giris"}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-bold transition-colors"
          >
            {isAdmin ? <Shield size={16} className="text-amber-400" /> : <User size={16} className="text-blue-400" />}
            <span>{user ? (isAdmin ? 'Admin Paneli' : 'Hesabım') : 'Giriş Yap'}</span>
          </Link>

          {/* Sepet Butonu */}
          <Link
            href="/sepet"
            className="flex items-center gap-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
          >
            <div className="relative">
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider leading-none">Sepetim</div>
              <div className="text-xs font-black leading-none mt-1">{totals.grandTotal.toLocaleString('tr-TR')} ₺</div>
            </div>
          </Link>

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-xl md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 3. ALT BÖLÜM: MEGA KATEGORİ MENÜSÜ (Çiğdem Soğutma Tarzı) */}
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
            <Link href="/iletisim" className="hover:text-blue-400 py-3 transition-colors">İletişim</Link>
          </div>

          {/* Hızlı B2B Bayi Girişi Linki */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <Link
              href="/b2b-basvuru"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Building2 size={14} /> Bayi Ol / Özel Fiyat Al
            </Link>
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
              placeholder="Parça ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm border border-slate-700"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-800 rounded-xl text-xs">
            <span className="text-slate-400">Para Birimi:</span>
            <div className="flex gap-1 font-bold">
              <button onClick={() => setCurrency('TRY')} className={`px-2 py-1 rounded ${currency === 'TRY' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>TL</button>
              <button onClick={() => setCurrency('EUR')} className={`px-2 py-1 rounded ${currency === 'EUR' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>EUR</button>
              <button onClick={() => setCurrency('USD')} className={`px-2 py-1 rounded ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>USD</button>
            </div>
          </div>

          <div className="space-y-1 font-semibold text-slate-200 text-sm">
            <Link href="/" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Ana Sayfa</Link>
            <Link href="/urunler" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Ürün Kataloğu</Link>
            <Link href="/b2b-basvuru" onClick={() => setIsOpen(false)} className="block p-2.5 bg-blue-600/20 text-blue-400 rounded-xl font-bold">B2B Bayi Başvurusu</Link>
            <Link href="/hesap" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">Hesabım / Cari Hesap</Link>
            <Link href="/iletisim" onClick={() => setIsOpen(false)} className="block p-2.5 hover:bg-slate-800 rounded-xl">İletişim</Link>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <a
              href="tel:+905525843073"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Phone size={16} /> 0552 584 30 73
            </a>
          </div>
        </div>
      )}
    </header>
  );
}