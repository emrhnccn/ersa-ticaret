'use client';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, ShoppingCart, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProductCard({ product }: { product: any }) {
  const targetImg = product.imageUrl || product.image || (product.images && product.images[0]?.url) || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok';
  const [imgSrc, setImgSrc] = useState(targetImg);

  useEffect(() => {
    setImgSrc(product.imageUrl || product.image || (product.images && product.images[0]?.url) || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok');
  }, [product.id, product.slug, product.imageUrl, product.image]);

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

  const isDealer = isB2B || user?.role === 'DEALER' || user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-pcb-700 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* 1. ÜST TEKNİK PARÇA KÜNYESİ (OEM & STOK BARKOD BAŞLIĞI) */}
      <div className="bg-slate-900 text-slate-200 px-3.5 py-2 flex items-center justify-between text-[11px] border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">OEM:</span>
          <span className="font-bold text-copper-400 tracking-wider font-mono">
            {product.sku || product.code || 'OEM-BELİRTİLMEMİŞ'}
          </span>
        </div>

        {/* Stok LED Durumu */}
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
        {/* 2. ÜRÜN GÖRSELİ (TEKNİK ÇİZİM ARKA PLANLI) */}
        <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 group-hover:bg-slate-100/60 transition-colors">
          
          {/* İndirim / Bayi Özel Fiyat Rozeti */}
          {isDiscounted && (
            <div className="absolute top-2.5 left-2.5 z-20 bg-gradient-to-r from-copper-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
              <Sparkles size={11} /> Bayi Özel Fiyatı
            </div>
          )}

          <Image
            src={imgSrc}
            alt={product.name || product.title || 'Yedek Parça'}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={() => {
              setImgSrc('https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok');
            }}
          />
        </div>

        {/* 3. BİLGİ ALANI (TEKNİK KÜNYE & BAŞLIK) */}
        <div className="p-4 flex-grow flex flex-col bg-white">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {(product.brandName || product.brand) && (
              <span className="inline-block px-2 py-0.5 bg-slate-900 text-copper-300 text-[10px] font-black uppercase tracking-wider rounded font-mono">
                {product.brandName || product.brand}
              </span>
            )}
            <span className="inline-block px-2 py-0.5 bg-pcb-50 text-pcb-900 border border-pcb-200 text-[10px] font-bold uppercase rounded">
              {product.categoryName || product.category || 'Genel Parça'}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-pcb-900 transition-colors mb-2">
            {product.name || product.title}
          </h3>

          {/* 4. FİYAT ALANI (B2B vs B2C DİNAMİK HİYERARŞİ) */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col">
            {quote && quote.unitNetExVat > 0 ? (
              isDealer ? (
                /* B2B Bayi Görünümü: Net Fiyat Öncelikli */
                <>
                  {isDiscounted && (
                    <div className="text-xs text-slate-400 line-through font-semibold">
                      {quote.listUnitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                    </div>
                  )}

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {quote.unitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}{' '}
                      {currencySymbol}
                    </span>
                    <span className="text-[10px] font-extrabold text-copper-700 bg-copper-50 px-1.5 py-0.5 rounded border border-copper-200">
                      + %{quote.vatRate || 20} KDV
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    KDV Dahil: <strong className="text-slate-800">{quote.lineGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}</strong>
                  </div>
                </>
              ) : (
                /* B2C Tüketici Görünümü: KDV Dahil Nihai Tutar Öncelikli */
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {quote.lineGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}{' '}
                      {currencySymbol}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      KDV Dahil
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Net: {quote.unitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol} + KDV
                  </div>
                </>
              )
            ) : (
              <div className="py-1">
                <span className="inline-block text-sm font-extrabold text-pcb-900 bg-pcb-50 px-3 py-1 rounded-lg border border-pcb-200">
                  Fiyat Sorunuz
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">Anlık stok ve net iskonto için arayınız</div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* 5. AKSİYON BUTONLARI (WHATSAPP ÖNCELİKLİ + SEPET) */}
      <div className="px-3.5 pb-3.5 bg-white grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 bg-[#25D366] hover:bg-[#1ea952] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          title="WhatsApp üzerinden anında fiyat ve stok teyidi alın"
        >
          <MessageCircle size={15} className="fill-white/20" /> Fiyat Sor
        </a>

        <button
          onClick={handleAddToCart}
          className="py-2.5 bg-slate-900 hover:bg-pcb-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <ShoppingCart size={15} /> Sepete Ekle
        </button>
      </div>

    </div>
  );
}