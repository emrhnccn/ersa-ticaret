'use client';
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Check, PackageOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data'; 

const ITEMS_PER_PAGE = 24;

export default function UrunlerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedBrand, setSelectedBrand] = useState('Tümü');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['Tümü', ...Array.from(new Set(products.map(product => product.category)))];
  const brands = ['Tümü', ...Array.from(new Set(products.map(product => product.brand).filter(Boolean)))];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'Tümü' || product.brand === selectedBrand;
      const matchesStock = inStockOnly ? product.inStock : true;
      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [searchTerm, selectedCategory, selectedBrand, inStockOnly, products]);

  // Pagination hesaplaması
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filtre değişince sayfa 1'e dön
  const handleFilterChange = (setter: Function, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tümü');
    setSelectedBrand('Tümü');
    setInStockOnly(false);
    setCurrentPage(1);
  };

  // Sayfa numaralarını hesapla
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* TEPE (HERO) EKRANI */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center mt-8">
          <div className="animate-fade-in-up w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <PackageOpen size={32} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">Tüm Yedek <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-rose-400">Parçalar</span></h1>
          <p className="animate-fade-in-up-delay-2 text-slate-300 text-lg md:text-xl max-w-2xl drop-shadow-md">Aradığınız kombi ve beyaz eşya parçalarını veya ürün kodlarını anında bulun.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-16 w-full pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* FİLTRELEME MENÜSÜ */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-900/5 sticky top-24">
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-extrabold text-slate-800">
                  <SlidersHorizontal size={20} className="text-blue-600" />
                  Filtreler
                </div>
                {(selectedCategory !== 'Tümü' || selectedBrand !== 'Tümü' || inStockOnly || searchTerm) && (
                  <button onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <RotateCcw size={14} /> Temizle
                  </button>
                )}
              </div>

              {/* KATEGORİLER */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Kategoriler</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        checked={selectedCategory === cat}
                        onChange={() => handleFilterChange(setSelectedCategory, cat)}
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* MARKALAR */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Uyumlu Markalar</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {brands.map((brand, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="brand"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        checked={selectedBrand === brand}
                        onChange={() => handleFilterChange(setSelectedBrand, brand)}
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedBrand === brand ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ekstra */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Ekstra</h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 group-hover:border-blue-500'}`}>
                    {inStockOnly && <Check size={14} strokeWidth={3} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => handleFilterChange(setInStockOnly, e.target.checked)} />
                  <span className={`text-sm font-medium transition-colors ${inStockOnly ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>Sadece Stoktakiler</span>
                </label>
              </div>

            </div>
          </aside>

          {/* SAĞ TARAF: ARAMA VE ÜRÜNLER */}
          <div className="w-full lg:w-3/4 flex flex-col">
            
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 mb-8 flex items-center focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
              <Search className="text-slate-400 ml-3 mr-3 shrink-0" size={24} />
              <input 
                type="text" 
                placeholder="Parça adı veya ürün kodu (Örn: OEM-12345) arayın..." 
                className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="mr-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {paginatedProducts.length > 0 ? (
              <>
                <div className="mb-4 text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>
                    Toplam <span className="font-bold text-slate-800">{filteredProducts.length}</span> ürün bulundu
                    {totalPages > 1 && <span className="text-slate-400 ml-2">• Sayfa {currentPage}/{totalPages}</span>}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>

                {/* SAYFALANDIRMA (PAGİNATİON) */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                    {/* Önceki Sayfa */}
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn pagination-btn-inactive disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft size={16} /> Önceki
                    </button>

                    {/* Sayfa Numaraları */}
                    {getPageNumbers().map((page, i) => (
                      typeof page === 'number' ? (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(page)}
                          className={`pagination-btn ${currentPage === page ? 'pagination-btn-active' : 'pagination-btn-inactive'}`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={i} className="px-2 text-slate-400 text-sm">...</span>
                      )
                    ))}

                    {/* Sonraki Sayfa */}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn pagination-btn-inactive disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Sonraki <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center h-64">
                <Search className="text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Parça Bulunamadı</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Arama kriterlerinize uygun yedek parça stoklarımızda görünmüyor. Filtreleri değiştirerek tekrar deneyebilirsiniz.</p>
                <button onClick={clearFilters} className="px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors">
                  Filtreleri Temizle
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}