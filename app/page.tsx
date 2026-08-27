import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/server/catalog/product-service';
import {
  ChevronRight,
  Package,
  Phone,
  MessageCircle,
  Sparkles
} from 'lucide-react';

import type { Metadata } from 'next';

export const revalidate = 60; // 60 saniye boyunca Edge CDN üzerinden 20ms'de anında sunulur

export const metadata: Metadata = {
  title: 'Ersa Ticaret | Online Yedek Parça Merkezi',
  description: 'Darıca ve Kocaeli bölgesinin lider kombi elektronik kartı, beyaz eşya yedek parçası ve teknik servis ekipmanı tedarikçisi. Geniş stok kataloğu, aynı gün teslimat ve anında fiyat danışma.',
  alternates: {
    canonical: 'https://www.ersaticaret.com',
  },
};

export default async function Home() {
  let popularProducts: any[] = [];

  try {
    const res = await productService.getProducts(
      { limit: 8, sortBy: 'newest' },
      null
    );
    if (res && res.items) popularProducts = res.items;
  } catch (error) {
    console.error('Home product load error:', error);
  }

  const testimonials = [
    {
      text: "Darıca'da aradığım tüm kombi kartlarını anında bulabildiğim tek yer. Esnaflıkları ve parça bilgileri çok iyi.",
      author: "Ahmet Usta (Kombi Servisi)",
      source: "Google Yorumu"
    },
    {
      text: "Çamaşır makinesinin pompası bozulmuştu, sağ olsunlar kodundan anında bulup verdiler. Güvenilir esnaf.",
      author: "Mehmet Y.",
      source: "Google Yorumu"
    },
    {
      text: "WhatsApp'tan parça fotoğrafı atıyorum, anında uyumlu modeli bulup hazırlıyorlar. Hızlı ve ilgili bir mağaza.",
      author: "Hakan T. (Teknik Servis)",
      source: "Google Yorumu"
    },
    {
      text: "Buzdolabı termostatı için gitmiştik. İlgilendiler, doğru parçayı verdiler. WhatsApp'tan çok hızlı dönüyorlar.",
      author: "Ayşe K.",
      source: "Google Yorumu"
    }
  ];

  const brands = [
    "VAİLLANT", "BOSCH", "ARÇELİK", "BEKO", "FERROLİ", "AİRFEL", 
    "İMMERGAS", "BAYKAN", "ARİSTON", "E.C.A", "PROTHERM", "VESTEL",
    "SİEMENS", "PROFİLO", "SAMSUNG", "LG", "ALTUS"
  ];

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 overflow-hidden">
      
      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 35s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes brand-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-brand-scroll {
          animation: brand-scroll 25s linear infinite;
        }
      `}</style>

      {/* --- VİTRİN HERO ALANI --- */}
      <section className="relative overflow-hidden pt-24 pb-36 md:pt-32 md:pb-44 flex items-center justify-center min-h-[580px] bg-slate-950">
        <div className="absolute inset-0 z-0 scale-105 transform origin-bottom transition-transform duration-[20s] ease-out hover:scale-110">
          <Image
            src="/vitrin.png"
            alt="Ersa Ticaret Mağaza Görünümü"
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover object-top opacity-30 mix-blend-luminosity"
          />
        </div>
        
        {/* Blueprint Izgarası */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-75 z-10 pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-slate-50 to-transparent z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center px-5 py-2 mb-6 text-xs md:text-sm font-bold text-amber-300 bg-slate-900/90 border border-slate-700 rounded-full font-mono shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            DARICA &amp; GEBZE BÖLGESİ ONLINE YEDEK PARÇA VE KART MERKEZİ
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.15] drop-shadow-2xl">
            Kombi Kartları ve <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400">
              Beyaz Eşya Yedek Parçası
            </span>
          </h1>
          
          <p className="text-slate-300 text-base md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Vaillant, Bosch, Demirdöküm ve tüm markalara uyumlu orijinal &amp; revizyonlu anakartlar, motorlar, pompalar. Aradığınız parçanın güncel fiyatı için bize hemen ulaşın.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/urunler"
              className="w-full sm:w-auto px-8 py-4 bg-pcb-900 hover:bg-pcb-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-pcb-900/40 border border-pcb-700 active:scale-95 text-base"
            >
              <Package size={20} />
              Yedek Parça Kataloğu
            </Link>

            <a
              href="https://wa.me/905525843073?text=Merhaba,%20parça%20fiyatı%20ve%20stok%20bilgisi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#1ea952] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 text-base"
            >
              <MessageCircle size={20} className="fill-white/20" />
              WhatsApp Fiyat Danışma
            </a>
          </div>
        </div>
      </section>

      {/* --- POPÜLER PARÇALAR BÖLÜMÜ --- */}
      {popularProducts.length > 0 && (
        <section className="pt-8 pb-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
                  <Sparkles size={14} /> Stoktaki Parçalar
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">Öne Çıkan Yedek Parçalar</h2>
                <p className="text-slate-500 text-xs mt-1">Stoktaki tüm parçalarımızın güncel fiyat ve temin bilgisi için <strong>Fiyat Sorun</strong> butonuna tıklayarak doğrudan WhatsApp'tan yazabilirsiniz.</p>
              </div>
              <Link
                href="/urunler"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group bg-blue-50 px-4 py-2 rounded-xl"
              >
                Tüm Kataloğu Gör <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- ÇALIŞTIĞIMIZ MARKALAR --- */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Çalıştığımız Markalar</h2>
          <p className="text-slate-500 text-xs">Tüm büyük markaların orijinal ve muadil yedek parçaları stoklarımızda hazırdır.</p>
        </div>
        
        <div className="w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-max animate-brand-scroll">
            <div className="flex items-center gap-6 pr-6">
              {brands.map((brand, i) => (
                <div key={i} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black text-xs tracking-wider uppercase hover:border-blue-300 transition-colors">
                  {brand}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 pr-6" aria-hidden="true">
              {brands.map((brand, i) => (
                <div key={`c-${i}`} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black text-xs tracking-wider uppercase hover:border-blue-300 transition-colors">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- MÜŞTERİ YORUMLARI --- */}
      <section className="py-20 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Ustalarımız ve Müşterilerimiz Ne Diyor?</h2>
          <p className="text-slate-400 text-xs">Bölgedeki teknik servislere ve son kullanıcılara yıllardır güvenle parça tedarik ediyoruz.</p>
        </div>

        <div className="flex w-max animate-infinite-scroll">
          <div className="flex gap-6 pr-6">
            {testimonials.map((testi, i) => (
              <div key={i} className="w-[340px] md:w-[400px] shrink-0 bg-slate-800/60 p-6 rounded-3xl border border-slate-700 text-xs">
                <div className="text-amber-400 mb-3 text-sm">★★★★★</div>
                <p className="text-slate-300 italic mb-4 leading-relaxed">&quot;{testi.text}&quot;</p>
                <div className="font-bold text-white">{testi.author}</div>
                <div className="text-blue-400 text-[10px]">{testi.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA ALANI --- */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-black mb-4">Aradığınız Parçayı Hemen Bulalım</h2>
          <p className="text-blue-100 text-xs md:text-sm mb-8 max-w-xl mx-auto">
            Kataloğumuzda göremediğiniz özel parça kodları veya toplu alım fiyat teklifleri için doğrudan bizimle iletişime geçebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/905525843073?text=Merhaba,%20parça%20fiyatı%20sormak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-800 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 text-xs"
            >
              <MessageCircle size={18} className="text-emerald-600" /> WhatsApp Destek &amp; Fiyat Hattı
            </a>
            <a
              href="tel:+905525843073"
              className="w-full sm:w-auto px-8 py-4 bg-blue-800/80 hover:bg-blue-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 border border-blue-400/40 text-xs"
            >
              <Phone size={18} /> 0552 584 30 73
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}