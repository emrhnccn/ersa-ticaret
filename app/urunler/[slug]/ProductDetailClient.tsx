'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Wrench,
  MessageCircle,
  ArrowLeft,
  Tag,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  FileText,
  Sparkles,
  Building2,
  Info
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'shipping'>('specs');
  const [selectedImg, setSelectedImg] = useState(product.images[0]?.url || 'https://placehold.co/500x500');

  const { addToCart, currency } = useCart();
  const { showToast } = useToast();
  const { isB2B, user } = useAuth();

  const quote = product.priceQuote;
  const isDiscounted = quote && quote.appliedRuleNames && quote.appliedRuleNames.length > 0;
  const inStock = product.inStock;

  const currencySymbol = quote?.displayCurrency === 'EUR' ? '€' : quote?.displayCurrency === 'USD' ? '$' : '₺';

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`✓ ${quantity} adet "${product.name}" sepete eklendi`);
  };

  const whatsappMessage = `Merhaba, Ersa Ticaret sitenizden ürün hakkında bilgi almak istiyorum.\n\nÜrün Kodu: ${product.sku}\nÜrün Adı: ${product.name}\nLink: https://ersaticaret.com/urunler/${product.slug}`;
  const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      
      {/* BREADCRUMB & TEPE KOYU ALAN */}
      <div className="bg-slate-900 pt-8 pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link
            href="/urunler"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 text-xs font-bold"
          >
            <ArrowLeft size={16} className="mr-2" /> Kataloğa Dön
          </Link>
          
          <div className="flex items-center text-xs font-semibold text-slate-400 mb-2 flex-wrap gap-1">
            <Link href="/" className="hover:text-blue-400">Ana Sayfa</Link>
            <ChevronRight size={12} />
            <Link href="/urunler" className="hover:text-blue-400">Yedek Parça Kataloğu</Link>
            <ChevronRight size={12} />
            <span className="text-blue-400">{product.category?.name || 'Kategori'}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {product.name}
          </h1>
        </div>
      </div>

      {/* ÜRÜN DETAY KARTI */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-20 w-full">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl shadow-slate-900/5 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SOL: GÖRSEL GALERİSİ (5 Kolon) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="aspect-square w-full bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center p-8 relative overflow-hidden group">
              <img
                src={selectedImg}
                alt={product.name}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                onError={() => setSelectedImg('https://placehold.co/500x500/f8fafc/94a3b8?text=Gorsel+Yok')}
              />
              {inStock ? (
                <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 shadow-sm">
                  <CheckCircle2 size={15} /> Stokta Var ({product.stockQty} {product.unit})
                </div>
              ) : (
                <div className="absolute top-4 left-4 bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 border border-amber-200">
                  <Info size={15} /> Temin Edilir
                </div>
              )}
            </div>

            {/* Thumbnail listesi */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto w-full pb-2">
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(img.url)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 transition-all ${selectedImg === img.url ? 'border-blue-600 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: FİYAT, B2B KAMPANYA VE SATIN ALMA (7 Kolon) */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Marka & OEM Etiketleri */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-lg text-xs tracking-wider uppercase border border-blue-100">
                {product.brand?.name || 'Orijinal & Muadil'}
              </span>
              <span className="text-slate-500 flex items-center text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg">
                <Tag size={13} className="mr-1.5 text-slate-400" /> OEM KOD: <strong className="text-slate-800 ml-1">{product.sku}</strong>
              </span>
              {product.barcode && (
                <span className="text-slate-400 text-xs font-mono">Barkod: {product.barcode}</span>
              )}
            </div>

            {/* B2B Bayi İndirimi Vurgusu */}
            {isDiscounted && quote && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900">
                    Özel Bayi İndirimi Uygulandı! ({quote.appliedRuleNames.join(', ')})
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">
                    Standart liste fiyatı üzerinden firmanıza özel iskonto yansıtılmıştır.
                  </div>
                </div>
              </div>
            )}

            {/* FİYAT KUTUSU (KDV HARİÇ STANDARDI) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Birim Net Fiyat (KDV Hariç)
                  </div>
                  
                  {isDiscounted && quote && (
                    <div className="text-sm text-slate-400 line-through font-semibold mb-0.5">
                      {quote.listUnitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                    </div>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      {quote
                        ? quote.unitNetExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                        : '1.250,00'}{' '}
                      {currencySymbol}
                    </span>
                    <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300">
                      + %{quote?.vatRate || 20} KDV
                    </span>
                  </div>
                </div>

                {/* KDV Tutarı & Genel Toplam Dağılımı */}
                <div className="text-left sm:text-right bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500">
                    KDV Tutarı: <strong className="text-slate-800">{quote ? (quote.vatAmount * quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0'} {currencySymbol}</strong>
                  </div>
                  <div className="text-slate-900 font-black text-sm pt-1 border-t border-slate-100">
                    KDV Dahil: <span className="text-blue-600">{quote ? (quote.lineGross * quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0'} {currencySymbol}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ADET SEÇİCİ VE SATIN ALMA BUTONLARI */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              {/* Adet Kontrolü */}
              <div className="flex items-center border-2 border-slate-200 rounded-2xl p-1 bg-slate-50/50 w-full sm:w-auto">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-white text-slate-600 rounded-xl transition-colors active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center font-black text-slate-800 bg-transparent focus:outline-none text-base"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-3 hover:bg-white text-slate-600 rounded-xl transition-colors active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Sepete Ekle Butonu */}
              <button
                onClick={handleAddToCart}
                className="flex-1 w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/25 active:scale-95 text-base"
              >
                <ShoppingCart size={20} />
                Sepete Ekle ({((quote ? quote.lineGross : 1000) * quantity).toLocaleString('tr-TR')} {currencySymbol})
              </button>

              {/* WhatsApp İle Fiyat Sor */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                <MessageCircle size={20} className="text-emerald-600" />
                <span>WhatsApp Parça Sor</span>
              </a>
            </div>

            {/* GÜVENCE MADDELERİ */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Truck size={20} className="mx-auto text-blue-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Aynı Gün Kargo</div>
                <div className="text-[10px] text-slate-400">16:00'a kadar verilen siparişler</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck size={20} className="mx-auto text-emerald-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">1 Yıl Garanti</div>
                <div className="text-[10px] text-slate-400">Birebir değişim güvencesi</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Wrench size={20} className="mx-auto text-indigo-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Teknik Destek</div>
                <div className="text-[10px] text-slate-400">Usta destek hattı</div>
              </div>
            </div>

          </div>

        </div>

        {/* TABLAR (Teknik Özellikler / Açıklama / Kargo) */}
        <div className="mt-12 bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
          <div className="flex border-b border-slate-200 gap-8 mb-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-sm font-extrabold transition-colors relative ${activeTab === 'specs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Teknik Özellikler
            </button>
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 text-sm font-extrabold transition-colors relative ${activeTab === 'desc' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Ürün Açıklaması &amp; Uyumluluk
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-sm font-extrabold transition-colors relative ${activeTab === 'shipping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Teslimat &amp; Fatura Bilgileri
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              <table className="w-full text-xs text-left border-collapse">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-500 w-1/3">Ürün Adı</td>
                    <td className="p-3.5 font-bold text-slate-900">{product.name}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500">OEM Parça Kodu</td>
                    <td className="p-3.5 font-mono font-bold text-blue-600">{product.sku}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-500">Marka</td>
                    <td className="p-3.5 font-bold text-slate-800">{product.brand?.name || 'Genel Uyumlu'}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500">Kategori</td>
                    <td className="p-3.5 font-bold text-slate-800">{product.category?.name}</td>
                  </tr>
                  {product.specs && Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="even:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-500">{key}</td>
                      <td className="p-3.5 text-slate-800">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'desc' && (
            <div className="text-slate-700 leading-relaxed text-sm space-y-4 max-w-3xl">
              <p>{product.description}</p>
              <p className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-900 font-medium">
                💡 <strong>Usta Tavsiyesi:</strong> Parça değişimi yapmadan önce cihazınızın elektrik ve gaz bağlantılarını kesiniz. Sipariş öncesinde cihazınızın üzerindeki eski parça kodu ile ürün kodumuzun (<strong>{product.sku}</strong>) eşleştiğini teyit ediniz.
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="text-slate-600 text-xs space-y-3 max-w-3xl">
              <p>📦 <strong>Kargo Süreci:</strong> Saat 16:00'a kadar verilen tüm toptan ve perakende siparişleriniz aynı gün Darıca merkez depomuzdan kargoya teslim edilmektedir.</p>
              <p>📄 <strong>e-Fatura Entegrasyonu:</strong> Siparişiniz oluşturulduğunda e-Fatura / e-Arşiv faturanız otomatik olarak oluşturulup kayıtlı e-posta adresinize ve müşteri panelinize iletilmektedir.</p>
              <p>🏢 <strong>B2B Cari Hesap:</strong> Onaylı bayilerimiz siparişlerini cari hesap limiti üzerinden ödemesiz onaylayabilir ve periyodik olarak Sanal POS üzerinden ödeme gerçekleştirebilir.</p>
            </div>
          )}
        </div>

        {/* BENZER / İLGİLİ ÜRÜNLER */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Benzer Yedek Parçalar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((rel: any) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
