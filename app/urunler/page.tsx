'use client';
import { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Check,
  PackageOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Building2
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function UrunlerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedBrand, setSelectedBrand] = useState('Tümü');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { currency } = useCart();
  const { isB2B, user } = useAuth();

  // Kategoriler ve Markaları Yükle
  useEffect(() => {
    Promise.all([
      fetch('/api/v1/categories').then(r => r.json()),
      fetch('/api/v1/brands').then(r => r.json()),
    ]).then(([catData, brandData]) => {
      if (catData.categories) setCategories(catData.categories);
      if (brandData.brands) setBrands(brandData.brands);
    }).catch(() => {});
  }, []);

  // Ürünleri Yükle
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(currentPage),
      limit: '24',
      currency,
      sortBy,
    });

    if (searchTerm) query.set('search', searchTerm);
    if (selectedCategory !== 'Tümü') query.set('category', selectedCategory);
    if (selectedBrand !== 'Tümü') query.set('brand', selectedBrand);
    if (inStockOnly) query.set('inStock', 'true');

    fetch(`/api/v1/products?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setProducts(data.items);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage, selectedCategory, selectedBrand, inStockOnly, sortBy, currency, searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tümü');
    setSelectedBrand('Tümü');
    setInStockOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* HERO / TEPE BİLGİLENDİRME */}
      <div className="bg-slate-900 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-3 border border-blue-500/30">
              <Sparkles size={14} /> Toptan &amp; Perakende Satış Kataloğu
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Yedek Parça <span className="text-blue-400">Kataloğu</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
              Kombi elektronik kartları, beyaz eşya motorları, vanalar ve teknik servis ekipmanları.
            </p>
          </div>

          {/* B2B Giriş Yapmışsa Bilgi Kutusu */}
          {isB2B && user?.company && (
            <div className="bg-slate-800/90 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Aktif Bayi Hesabı:</div>
                <div className="text-sm font-bold text-white">{user.company.legalName}</div>
                <div className="text-xs font-extrabold text-emerald-400">
                  {user.company.customerGroup?.name || 'Özel Bayi İndirimi Aktif'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KATALOG GÖVDESİ */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-20 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SOL FİLTRE PANELİ */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-900/5 sticky top-28 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-extrabold text-slate-800 text-sm">
                  <SlidersHorizontal size={18} className="text-blue-600" /> Filtreler
                </div>
                {(selectedCategory !== 'Tümü' || selectedBrand !== 'Tümü' || inStockOnly || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <RotateCcw size={13} /> Sıfırla
                  </button>
                )}
              </div>

              {/* Arama Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Parça / Model Ara</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Kod veya parça adı..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                </div>
              </div>

              {/* Stok Durumu */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Sadece Stoktaki Ürünler</span>
                </label>
              </div>

              {/* Kategoriler */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Kategoriler</label>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
                  <button
                    onClick={() => { setSelectedCategory('Tümü'); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors flex justify-between ${selectedCategory === 'Tümü' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span>Tümü</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors flex justify-between ${selectedCategory === cat.slug ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                      <span className="text-[10px] opacity-70">({cat._count?.products || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Markalar */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Markalar</label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
                  <button
                    onClick={() => { setSelectedBrand('Tümü'); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors flex justify-between ${selectedBrand === 'Tümü' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span>Tümü</span>
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedBrand(b.slug); setCurrentPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors flex justify-between ${selectedBrand === b.slug ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span className="line-clamp-1">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* SAĞ ÜRÜN LİSTESİ */}
          <main className="flex-1">
            {/* Üst Bar: Sıralama & Sonuç Sayısı */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="text-xs font-bold text-slate-600">
                Toplam <span className="text-blue-600 font-extrabold">{totalCount}</span> adet yedek parça bulundu
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="newest">En Yeniler</option>
                  <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="name_asc">Ürün Adı (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Ürün Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 h-96 animate-pulse flex flex-col justify-between">
                    <div className="bg-slate-100 rounded-xl h-48 w-full mb-4"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <PackageOpen size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Aradığınız Kriterlere Uygun Parça Bulunamadı</h3>
                <p className="text-xs text-slate-500 mb-6">Filtreleri temizleyerek veya farklı bir arama yaparak tekrar deneyebilirsiniz.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  if (pNum === 1 || pNum === totalPages || (pNum >= currentPage - 1 && pNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === pNum ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

    </div>
  );
}