'use client';
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Check, PackageOpen, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data'; 

export default function UrunlerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedBrand, setSelectedBrand] = useState('Tümü');
  const [inStockOnly, setInStockOnly] = useState(false);

  // --- YENİ EKLENEN DİNAMİK SİSTEM ---
  // products dosyasının içindeki tüm kategorileri tarar, aynı olanları eler (Set) ve otomatik menü oluşturur.
  const categories = ['Tümü', ...Array.from(new Set(products.map(product => product.category)))];
  
  // Aynı şekilde çekilen ürünlerin içindeki tüm markaları tarayıp otomatik marka filtresi oluşturur.
  const brands = ['Tümü', ...Array.from(new Set(products.map(product => product.brand).filter(Boolean)))];
  // ------------------------------------

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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tümü');
    setSelectedBrand('Tümü');
    setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* TEPE (HERO) EKRANI */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-blue-500/30">
            <PackageOpen size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Tüm Yedek Parçalar</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl">Aradığınız kombi ve beyaz eşya parçalarını veya ürün kodlarını anında bulun.</p>
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

              {/* OTOMATİK KATEGORİLER */}
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
                        onChange={() => setSelectedCategory(cat as string)}
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* OTOMATİK MARKALAR */}
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
                        onChange={() => setSelectedBrand(brand as string)}
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
                  <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="mr-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div className="mb-4 text-sm font-medium text-slate-500">
                  Toplam <span className="font-bold text-slate-800">{filteredProducts.length}</span> ürün bulundu
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
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