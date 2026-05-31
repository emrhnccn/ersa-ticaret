'use client';
import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Search, X, PackageOpen } from 'lucide-react';

type CatalogSearchProps = {
  products: any[];
  categories: string[];
};

export default function CatalogSearch({ products, categories }: CatalogSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Arama metni veya kategori değiştiğinde ürünleri anında filtreler
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'Tümü' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="flex flex-col gap-8">
      
      {/* Spotlight Arama Çubuğu */}
      <div className="relative group max-w-3xl mx-auto w-full">
        {/* Glow (Parlama) Efekti */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-focus-within:bg-blue-500/40 transition-all duration-500"></div>
        
        <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm group-focus-within:border-blue-400 group-focus-within:shadow-md transition-all">
          <div className="pl-6 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={24} />
          </div>
          <input 
            type="text" 
            placeholder="Parça adı veya kodunu yazın (Örn: ARC-BP-90)..." 
            className="w-full py-4 px-4 bg-transparent outline-none text-slate-800 text-lg placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="pr-6 text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Kategori Filtreleri */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
        {categories.map((c, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedCategory(c)}
            className={`px-5 py-2.5 rounded-xl border text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === c 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Ürün Listesi ve Boş Durum (Empty State) Kontrolü */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <PackageOpen size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Parça Bulunamadı</h3>
          <p className="text-slate-500 max-w-md">
            Aradığınız kritere uygun yedek parça stoklarımızda görünmüyor. Farklı bir kelimeyle aramayı deneyebilir veya WhatsApp üzerinden parçayı sorabilirsiniz.
          </p>
        </div>
      )}
      
    </div>
  );
}