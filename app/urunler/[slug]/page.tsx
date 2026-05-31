import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import Link from 'next/link';
import { ShieldCheck, Truck, Wrench, MessageCircle, ArrowLeft, Tag, CheckCircle2, ChevronRight } from 'lucide-react';

// --- TS HATASINI ÇÖZEN KISIM: VERİ TİPİNİ TANIMLIYORUZ ---
// TypeScript'e "description" kısmının sonundaki "?" işareti ile bunun opsiyonel olduğunu söylüyoruz.
interface ProductType {
  slug: string;
  title: string;
  code: string;
  category: string;
  brand: string;
  image: string;
  inStock: boolean;
  description?: string; 
}

// 1. SEO AYARLARI VE OTOMATİK AÇIKLAMA
export function generateMetadata({ params }: { params: { slug: string } }) {
  // 'as ProductType' diyerek TypeScript'e bu verinin bizim kurallarımıza uyduğunu belirtiyoruz
  const product = products.find((p) => p.slug === params.slug) as ProductType | undefined;
  
  if (!product) {
    return { title: 'Ürün Bulunamadı | Ersa Ticaret' };
  }

  // Ürünün açıklaması yoksa (ki scraper ile çekmedik), otomatik şık bir metin oluşturur.
  const descriptionSnippet = product.description 
    ? product.description.substring(0, 100) + '...' 
    : `${product.brand} marka, ${product.category} uyumlu yedek parça. Darıca Ersa Ticaret güvencesiyle anında stoktan teslim.`;

  return {
    title: `${product.title} | Ersa Ticaret`,
    description: `${product.code} kodlu ${product.title} yedek parçası. ${descriptionSnippet}`,
  };
}

// 2. ÜRÜN DETAY SAYFASI TASARIMI
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug) as ProductType | undefined;

  if (!product) {
    notFound();
  }

  // WhatsApp Sipariş Mesajı Şablonu
  const whatsappMessage = `Merhaba, Ersa Ticaret sitenizden ürün sipariş etmek/bilgi almak istiyorum.\n\nÜrün Kodu: ${product.code}\nÜrün Adı: ${product.title}\nLink: https://ersaticaret.com/urunler/${product.slug}`;
  const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      
      {/* YENİ KOYU TEPE EKRANI (BREADCRUMB - YOL İZİ) */}
      <div className="bg-slate-900 pt-8 pb-32 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          <Link href="/urunler" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Ürünlere Dön
          </Link>
          
          <div className="flex items-center text-sm font-medium text-slate-500 mb-4">
            <Link href="/" className="hover:text-blue-400 transition-colors">Ana Sayfa</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link href="/urunler" className="hover:text-blue-400 transition-colors">Yedek Parçalar</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-blue-400">{product.category}</span>
          </div>
        </div>
      </div>

      {/* ÜRÜN DETAY KARTI (YUKARI TAŞMIŞ EFEKT) */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-24 w-full">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl shadow-slate-900/5 border border-slate-100 flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* Sol Taraf: Ürün Fotoğrafı */}
          <div className="w-full lg:w-5/12 shrink-0">
            <div className="aspect-square bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-6 shadow-sm overflow-hidden relative group">
              <img 
                src={product.image} 
                alt={product.title} 
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4 bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow-sm border border-emerald-200">
                <CheckCircle2 size={16} /> Stokta Var
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Ürün Bilgileri ve Sipariş */}
          <div className="w-full lg:w-7/12 flex flex-col">
            
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-md text-xs tracking-wider uppercase border border-blue-100">
                {product.brand || "Genel Uyumlu"}
              </span>
              <span className="text-slate-400 flex items-center text-sm font-medium">
                <Tag size={14} className="mr-1" /> OEM: <span className="text-slate-600 ml-1 font-bold">{product.code}</span>
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              {product.title}
            </h1>

            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              {product.description 
                ? product.description 
                : `${product.brand !== 'Genel' ? product.brand + ' marka, ' : ''}${product.category} cihazlarıyla tam uyumlu, A kalite yedek parçadır. Dayanıklı malzemeden üretilmiş olup uzun ömürlü kullanım sunar.`}
            </p>

            {/* Özellikler Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 py-6 border-y border-slate-100">
              <div className="flex items-center gap-3 text-slate-700 font-medium">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                Garantili Parça
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-medium">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                Aynı Gün Kargo / Teslimat
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-medium">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Wrench size={20} />
                </div>
                Usta ve Servislere Özel İndirim
              </div>
            </div>

            {/* Fiyat ve Buton Alanı */}
            <div className="mt-auto bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Toptan & Perakende</p>
                <p className="text-xl font-extrabold text-slate-800">Fiyat bilgisi için iletişime geçin</p>
              </div>
              
              <a 
                href={whatsappUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/30 active:scale-95 whitespace-nowrap"
              >
                <MessageCircle size={22} /> WhatsApp'tan Sor
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}