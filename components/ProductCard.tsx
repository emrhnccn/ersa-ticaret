'use client';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, ShoppingCart, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }: { product: any }) {
  const [imgSrc, setImgSrc] = useState(
    product.imageUrl || product.image || (product.images && product.images[0]?.url) || 'https://placehold.co/400x400'
  );
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isB2B, user } = useAuth();

  const quote = product.priceQuote;
  const isDiscounted = quote && quote.appliedRuleNames && quote.appliedRuleNames.length > 0;
  const inStock = product.inStock !== false && (product.stockQty === undefined || product.stockQty > 0);

  const waLink = `https://wa.me/905525843073?text=${encodeURIComponent(
    `Merhaba, Ersa Ticaret sitenizden "${product.name || product.title}" (OEM: ${product.sku || product.code}) parçası hakkında bilgi/fiyat almak istiyorum.`
  )}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`✓ "${product.name || product.title}" sepete eklendi`);
  };

  const currencySymbol = quote?.displayCurrency === 'EUR' ? '€' : quote?.displayCurrency === 'USD' ? '$' : '₺';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden relative">
      
      {/* İndirim / Bayi Özel Fiyat Rozeti */}
      {isDiscounted && (
        <div className="absolute top-3 left-3 z-30 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
          <Sparkles size={11} /> Bayi Özel Fiyatı
        </div>
      )}

      {/* Stok Rozeti */}
      <div className="absolute top-3 right-3 z-30">
        {inStock ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
            <CheckCircle2 size={11} /> Stokta Var
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold">
            <AlertCircle size={11} /> Temin Edilir
          </span>
        )}
      </div>

      <Link href={`/urunler/${product.slug}`} className="flex flex-col flex-grow">
        {/* ÜRÜN GÖRSELİ */}
        <div className="aspect-square relative overflow-hidden bg-slate-50/50 flex items-center justify-center p-6 border-b border-slate-100">
          <img
            src={imgSrc}
            alt={product.name || product.title}
            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={() => {
              setImgSrc('https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok');
            }}
          />
        </div>

        {/* BİLGİ ALANI */}
        <div className="p-4 flex-grow flex flex-col bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider rounded">
              {product.categoryName || product.category || 'Genel'}
            </span>
            {(product.brandName || product.brand) && (
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                {product.brandName || product.brand}
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
            {product.name || product.title}
          </h3>

          <div className="text-xs font-mono text-slate-400 mb-3">
            OEM: <span className="text-slate-700 font-bold">{product.sku || product.code}</span>
          </div>

          {/* FİYAT ALANI (KDV HARİÇ VURGUSU) */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col">
            {isDiscounted && quote && (
              <div className="text-xs text-slate-400 line-through font-semibold">
                {quote.listUnitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
              </div>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                {quote
                  ? quote.unitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                  : '1.250,00'}{' '}
                {currencySymbol}
              </span>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                + KDV
              </span>
            </div>

            {quote && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                KDV Dahil: {quote.lineGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* BUTONLAR */}
      <div className="px-4 pb-4 bg-white grid grid-cols-2 gap-2 pt-1">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
        >
          <MessageCircle size={14} className="text-emerald-600" /> Fiyat Sor
        </a>

        <button
          onClick={handleAddToCart}
          className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <ShoppingCart size={14} /> Sepete Ekle
        </button>
      </div>

    </div>
  );
}