'use client';
import { useCart } from '@/context/CartContext';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }: any) {
  const [imgSrc, setImgSrc] = useState(product.image);
  const { addToCart } = useCart();

  const waLink = `https://wa.me/905525843073?text=Merhaba,%20${product.title}%20(${product.code})%20parçası%20hakkında%20fiyat%20almak%20istiyorum.`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden">
      
      <Link href={`/urunler/${product.slug}`} className="flex flex-col flex-grow">
        <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors z-10" />
          
          <img 
            src={imgSrc} 
            alt={product.title} 
            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out z-20"
            onError={() => {
              setImgSrc('https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok');
            }}
          />
        </div>

        <div className="p-5 flex-grow flex flex-col z-20 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest rounded-md w-max">
              {product.category}
            </span>
            {product.brand && (
              <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md w-max">
                {product.brand}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs font-medium text-slate-400 mb-2">
            Kod: <span className="text-slate-600">{product.code}</span>
          </p>
        </div>
      </Link>
        
      {/* İKİLİ BUTON YAPISI */}
      <div className="px-5 pb-5 bg-white grid grid-cols-2 gap-2">
        {/* Doğrudan WhatsApp'tan Fiyat Sor */}
        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 text-center"
        >
          <MessageCircle size={16} /> Fiyat Sor
        </a>

        {/* Sepete (Sipariş Listesine) Ekle */}
        <button 
          onClick={() => addToCart(product)}
          className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg shadow-blue-600/10 active:scale-95"
        >
          <ShoppingCart size={16} /> Sepete Ekle
        </button>
      </div>

    </div>
  );
}