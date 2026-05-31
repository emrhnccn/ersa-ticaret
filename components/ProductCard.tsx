'use client';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }: any) {
  const [imgSrc, setImgSrc] = useState(product.image);

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
          <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest rounded-md w-max mb-3">
            {product.category}
          </span>
          <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs font-medium text-slate-400 mb-5">
            Kod: <span className="text-slate-600">{product.code}</span>
          </p>
        </div>
      </Link>
        
      <div className="px-5 pb-5 bg-white">
        <a 
          href={waLink} 
          target="_blank" 
          className="w-full py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/40 active:scale-95"
        >
          <MessageCircle size={18} /> Fiyat Sorun
        </a>
      </div>
    </div>
  );
}