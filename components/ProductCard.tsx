'use client';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProductCard({ product }: { product: any }) {
  const targetImg = product.imageUrl || product.image || (product.images && product.images[0]?.url) || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok';
  const [imgSrc, setImgSrc] = useState(targetImg);

  useEffect(() => {
    setImgSrc(product.imageUrl || product.image || (product.images && product.images[0]?.url) || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok');
  }, [product.id, product.slug, product.imageUrl, product.image]);

  const inStock = product.inStock !== false && (product.stockQty === undefined || product.stockQty > 0);

  const productName = product.name || product.title || 'Yedek Parça';
  const productSku = product.sku || product.code || 'OEM';

  const waLink = `https://wa.me/905525843073?text=${encodeURIComponent(
    `Merhaba, Ersa Ticaret sitenizden "${productName}" (OEM: ${productSku}) parçası hakkında fiyat ve stok bilgisi almak istiyorum.`
  )}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* 1. ÜST TEKNİK PARÇA KÜNYESİ (OEM & STOK BAŞLIĞI) */}
      <div className="bg-slate-900 text-slate-200 px-3.5 py-2 flex items-center justify-between text-[11px] border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">OEM:</span>
          <span className="font-bold text-amber-400 tracking-wider font-mono">
            {productSku}
          </span>
        </div>

        {/* Stok Durumu */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          {inStock ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Stokta Hazır
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Temin Edilir
            </span>
          )}
        </div>
      </div>

      <Link href={`/urunler/${product.slug}`} className="flex flex-col flex-grow">
        {/* 2. ÜRÜN GÖRSELİ */}
        <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 group-hover:bg-slate-100/60 transition-colors">
          <Image
            src={imgSrc}
            alt={productName}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={() => {
              setImgSrc('https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok');
            }}
          />
        </div>

        {/* 3. BİLGİ ALANI */}
        <div className="p-4 flex-grow flex flex-col bg-white">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {(() => {
              const rawBrand = product.brandName || (typeof product.brand === 'object' ? product.brand?.name : product.brand);
              const brandText = typeof rawBrand === 'string' && rawBrand.trim() !== '' ? rawBrand.trim() : null;
              if (!brandText) return null;
              return (
                <span className="inline-block px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded font-mono border border-slate-700">
                  {brandText}
                </span>
              );
            })()}
            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold uppercase rounded">
              {product.categoryName || product.category || 'Genel Parça'}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {productName}
          </h3>

          {/* 4. FİYAT ALANI: SADECE FİYAT SORUN */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="inline-block text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                Fiyat Sorun
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">Anlık stok ve net fiyat bilgisi</div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Darıca Depo</span>
          </div>
        </div>
      </Link>

      {/* 5. AKSİYON BUTONU (TAM GENİŞLİK WHATSAPP FİYAT SORUN) */}
      <div className="px-3.5 pb-3.5 bg-white pt-1 border-t border-slate-50">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 bg-[#25D366] hover:bg-[#1ea952] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          title="WhatsApp üzerinden anında fiyat ve stok teyidi alın"
        >
          <MessageCircle size={16} className="fill-white/20" /> Fiyat Sorun
        </a>
      </div>

    </div>
  );
}