'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Truck,
  Wrench,
  MessageCircle,
  ArrowLeft,
  Tag,
  CheckCircle2,
  ChevronRight,
  Phone,
  Info
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailClient({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'shipping'>('specs');
  const [selectedImg, setSelectedImg] = useState(
    (product.images && product.images[0]?.url) || product.imageUrl || 'https://placehold.co/500x500'
  );

  const inStock = product.inStock !== false && (product.stockQty === undefined || product.stockQty > 0);

  const productName = product.name || product.title || 'Yedek Parça';
  const productSku = product.sku || product.code || 'OEM';

  const whatsappMessage = `Merhaba, Ersa Ticaret sitenizden ürün hakkında fiyat ve stok bilgisi almak istiyorum.\n\nÜrün Kodu: ${productSku}\nÜrün Adı: ${productName}\nLink: https://www.ersaticaret.com/urunler/${product.slug}`;
  const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(whatsappMessage)}`;
  const waLink = whatsappUrl;

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
            <span className="text-blue-400">{product.category?.name || product.categoryName || 'Kategori'}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {productName}
          </h1>
        </div>
      </div>

      {/* ÜRÜN DETAY KARTI */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-20 w-full">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl shadow-slate-900/5 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SOL: GÖRSEL GALERİSİ (5 Kolon) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="aspect-square w-full bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center p-8 relative overflow-hidden group">
              <Image
                src={selectedImg}
                alt={productName}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain group-hover:scale-110 transition-transform duration-500"
                onError={() => setSelectedImg('https://placehold.co/500x500/f8fafc/94a3b8?text=Gorsel+Yok')}
              />
              {inStock ? (
                <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 shadow-sm">
                  <CheckCircle2 size={15} /> Stokta Var {product.stockQty ? `(${product.stockQty} ${product.unit || 'Adet'})` : ''}
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
                    key={img.id || img.url}
                    onClick={() => setSelectedImg(img.url)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 transition-all relative overflow-hidden ${selectedImg === img.url ? 'border-blue-600 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={img.url} alt="" fill unoptimized sizes="64px" className="object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: FİYAT BİLGİSİ VE DANIŞMA BUTONLARI (7 Kolon) */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Marka & OEM Etiketleri */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-lg text-xs tracking-wider uppercase border border-blue-100">
                {product.brand?.name || product.brandName || 'Orijinal & Muadil'}
              </span>
              <span className="text-slate-500 flex items-center text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg">
                <Tag size={13} className="mr-1.5 text-slate-400" /> OEM KOD: <strong className="text-slate-800 ml-1">{productSku}</strong>
              </span>
              {product.barcode && (
                <span className="text-slate-400 text-xs font-mono">Barkod: {product.barcode}</span>
              )}
            </div>

            {/* FİYAT ALANI: FİYAT SORUN KUTUSU */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 md:p-8 rounded-3xl border border-slate-200 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Fiyat &amp; Stok Durumu
                  </div>
                  <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Fiyat Sorun
                  </span>
                  <p className="text-xs text-slate-600 mt-2 max-w-md leading-relaxed">
                    Bu yedek parça için güncel toptan ve perakende liste fiyatı, anlık stok durumu ve montaj uyumluluk bilgisi almak için lütfen WhatsApp veya telefon ile iletişime geçiniz.
                  </p>
                </div>
                
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shrink-0 w-full sm:w-auto shadow-sm">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Depo Lokasyonu</div>
                  <div className="text-xs font-black text-slate-800">Darıca / Kocaeli</div>
                  <div className="text-[10px] text-emerald-600 font-extrabold mt-0.5">Aynı Gün Hızlı Teslimat</div>
                </div>
              </div>
            </div>

            {/* DANIŞMA & FİYAT ÖĞRENME BUTONLARI */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
              {/* WhatsApp Fiyat Sor Butonu */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 w-full py-4 px-6 bg-[#25D366] hover:bg-[#1ea952] text-white font-black text-sm md:text-base rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-98"
                title="WhatsApp üzerinden anında fiyat ve stok teyidi alın"
              >
                <MessageCircle size={22} className="fill-white/20" />
                <span>WhatsApp ile Fiyat Sorun</span>
              </a>

              {/* Hızlı Telefon Arama Butonu */}
              <a
                href="tel:+905525843073"
                className="w-full sm:w-auto py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-98 shrink-0 text-sm"
              >
                <Phone size={18} />
                <span>0552 584 30 73</span>
              </a>
            </div>

            {/* GÜVENCE MADDELERİ */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Truck size={20} className="mx-auto text-blue-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Aynı Gün Teslim</div>
                <div className="text-[10px] text-slate-400">Darıca &amp; Gebze elden veya kargo</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck size={20} className="mx-auto text-emerald-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Parça Garantisi</div>
                <div className="text-[10px] text-slate-400">Birebir değişim güvencesi</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Wrench size={20} className="mx-auto text-indigo-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Teknik Destek</div>
                <div className="text-[10px] text-slate-400">Usta danışma hattı</div>
              </div>
            </div>

          </div>

        </div>

        {/* TABLAR (Teknik Özellikler / Açıklama / Kargo & Danışma) */}
        <div className="mt-12 bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
          <div className="flex border-b border-slate-200 gap-8 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-sm font-extrabold transition-colors relative whitespace-nowrap ${activeTab === 'specs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Teknik Özellikler
            </button>
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 text-sm font-extrabold transition-colors relative whitespace-nowrap ${activeTab === 'desc' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Ürün Açıklaması &amp; Uyumluluk
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-sm font-extrabold transition-colors relative whitespace-nowrap ${activeTab === 'shipping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Teslimat &amp; Danışma Bilgileri
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              <table className="w-full text-xs text-left border-collapse">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-500 w-1/3">Ürün Adı</td>
                    <td className="p-3.5 font-bold text-slate-900">{productName}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500">OEM Parça Kodu</td>
                    <td className="p-3.5 font-mono font-bold text-blue-600">{productSku}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-500">Marka</td>
                    <td className="p-3.5 font-bold text-slate-800">{product.brand?.name || product.brandName || 'Genel Uyumlu'}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500">Kategori</td>
                    <td className="p-3.5 font-bold text-slate-800">{product.category?.name || product.categoryName || 'Yedek Parça'}</td>
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
              <p>{product.description || `${productName} kombi ve beyaz eşya yedek parçası.`}</p>
              <p className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-900 font-medium">
                💡 <strong>Usta Tavsiyesi:</strong> Parça değişimi yapmadan önce cihazınızın elektrik ve gaz bağlantılarını kesiniz. Doğru parçayı seçtiğinizden emin olmak için cihaz etiketinizdeki model kodu ile ürün kodumuzun (<strong>{productSku}</strong>) eşleştiğini WhatsApp hattımızdan teyit edebilirsiniz.
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="text-slate-600 text-xs space-y-3 max-w-3xl">
              <p>📦 <strong>Kargo &amp; Depodan Teslim:</strong> Saat 16:00'a kadar teyit edilen tüm siparişleriniz aynı gün Darıca merkez depomuzdan kargoya teslim edilmekte veya depodan elden teslim alınabilmektedir.</p>
              <p>📄 <strong>Fatura Bilgisi:</strong> Kurumsal ve bireysel tüm talepleriniz için faturalı gönderim yapılmaktadır.</p>
              <p>💬 <strong>Fiyat &amp; Sipariş:</strong> WhatsApp ve telefon hattımız üzerinden parçanızı teyit edip anında fiyat bilgisi alabilir ve siparişinizi oluşturabilirsiniz.</p>
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
