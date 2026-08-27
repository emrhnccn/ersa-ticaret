'use client';
import { useState, useEffect, useTransition } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface ProductCatalogClientProps {
  initialProducts: any[];
  initialCategories: any[];
  initialBrands: any[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialFilters?: {
    search?: string;
    category?: string;
    brand?: string;
    inStock?: boolean;
    sortBy?: string;
  };
}

export default function ProductCatalogClient({
  initialProducts,
  initialCategories,
  initialBrands,
  initialPagination,
  initialFilters,
}: ProductCatalogClientProps) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [categories] = useState<any[]>(initialCategories || []);
  const [brands] = useState<any[]>(initialBrands || []);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || 'Tümü');
  const [selectedBrand, setSelectedBrand] = useState(initialFilters?.brand || 'Tümü');
  const [inStockOnly, setInStockOnly] = useState(initialFilters?.inStock || false);
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'newest');
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [totalCount, setTotalCount] = useState(initialPagination?.total || (initialProducts ? initialProducts.length : 0));

  const [isInitialMount, setIsInitialMount] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtreler veya sayfa değiştiğinde ürünleri arka planda güncelle
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    setLoading(true);
    const query = new URLSearchParams({
      page: String(currentPage),
      limit: '24',
      sortBy,
    });

    if (debouncedSearch) query.set('search', debouncedSearch);
    if (selectedCategory !== 'Tümü') query.set('category', selectedCategory);
    if (selectedBrand !== 'Tümü') query.set('brand', selectedBrand);
    if (inStockOnly) query.set('inStock', 'true');

    const abortCtrl = new AbortController();

    fetch(`/api/v1/products?${query.toString()}`, { signal: abortCtrl.signal })
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          startTransition(() => {
            setProducts(data.items);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalCount(data.pagination?.total || 0);
          });
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Product fetch error:', err);
        }
      })
      .finally(() => setLoading(false));

    return () => abortCtrl.abort();
  }, [currentPage, selectedCategory, selectedBrand, inStockOnly, sortBy, debouncedSearch]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tümü');
    setSelectedBrand('Tümü');
    setInStockOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HERO / TEPE BİLGİLENDİRME (BLUEPRINT GRID) */}
      <div className="bg-slate-950 bg-blueprint-grid pt-12 pb-24 relative overflow-hidden border-b border-slate-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pcb-900/60 border border-pcb-700/60 text-emerald-400 rounded-full text-xs font-mono font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              3.600+ PARÇA ANLIK STOK KATALOĞU
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Yedek Parça <span className="text-copper-400">Kataloğu</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-xl">
              Kombi elektronik anakartları, beyaz eşya motorları, sirkülasyon pompaları ve servis malzemeleri.
            </p>
          </div>
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
              <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <span>Toplam <span className="text-blue-600 font-extrabold">{totalCount}</span> adet yedek parça bulundu</span>
                {(loading || isPending) && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-500 font-normal">
                    <RefreshCw size={11} className="animate-spin" /> Güncelleniyor...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="newest">En Yeniler</option>
                  <option value="name_asc">Ürün Adı (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Ürün Grid */}
            {products.length === 0 ? (
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
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
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
