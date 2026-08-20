import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/server/catalog/product-service';
import { getSessionUser } from '@/server/auth/jwt';
import {
  ChevronRight,
  Cpu,
  Wrench,
  Truck,
  Award,
  Package,
  Users,
  Timer,
  ShieldCheck,
  Phone,
  MessageCircle,
  Building2,
  Sparkles,
  Layers
} from 'lucide-react';

export const revalidate = 60; // 60 saniye boyunca Edge CDN üzerinden 20ms'de anında sunulur

export default async function Home() {
  let popularProducts: any[] = [];

  try {
    const session = getSessionUser();
    const customerContext = session ? {
      userId: session.userId,
      companyId: session.companyId || undefined,
      customerGroupId: session.customerGroupId || undefined,
    } : null;

    const res = await productService.getProducts(
      { limit: 8, sortBy: 'newest' },
      customerContext
    );
    if (res && res.items) popularProducts = res.items;
  } catch (error) {
    console.error('Home product load error:', error);
  }

  const testimonials = [
    {
      text: "Darıca'da aradığım tüm kombi kartlarını anında bulabildiğim tek yer. Fiyatları toptancı olduğu için çok uygun.",
      author: "Ahmet Usta (Kombi Servisi)",
      source: "Google Yorumu"
    },
    {
      text: "Çamaşır makinesinin pompası bozulmuştu, sağ olsunlar kodundan anında bulup verdiler. Güvenilir esnaf.",
      author: "Mehmet Y.",
      source: "Google Yorumu"
    },
    {
      text: "Sabah sipariş geçiyorum, anında malzemeleri hazırlıyorlar. Kocaeli çevresinde böyle parça stoğu olan yer az.",
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
      <section className="relative overflow-hidden pt-24 pb-36 md:pt-32 md:pb-44 flex items-center justify-center min-h-[580px]">
        <div 
          className="absolute inset-0 z-0 scale-105 transform origin-bottom transition-transform duration-[20s] ease-out hover:scale-110"
          style={{
            backgroundImage: 'url("/vitrin.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
          }}
        />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-10" />
        
        {/* Renk Küreleri */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none opacity-60">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/40 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>

        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-slate-50 to-transparent z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center px-6 py-2 mb-6 text-xs md:text-sm font-bold text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse" />
            Darıca &amp; Gebze Bölgesinin 1 Numaralı B2B &amp; B2C Parça Tedarikçisi
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1] drop-shadow-2xl">
            Beyaz Eşya ve Kombi <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-rose-400">
              Yedek Parça Merkezi
            </span>
          </h1>
          
          <p className="text-slate-300 text-base md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Kombi elektronik anakartları, beyaz eşya motorları ve profesyonel teknik servis ekipmanları. Bayilere özel iskontolar ve aynı gün stoktan teslimat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/urunler"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/30 active:scale-95 text-base"
            >
              <Package size={20} />
              Kataloğu İncele
            </Link>

            <Link
              href="/b2b-basvuru"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 border border-white/20 transition-all backdrop-blur-xl active:scale-95 text-base"
            >
              <Building2 size={20} className="text-amber-400" />
              B2B Bayi Girişi &amp; Başvuru
            </Link>
          </div>
        </div>
      </section>

      {/* --- HİZMETLER BÖLÜMÜ --- */}
      <section className="relative z-30 -mt-20 px-4 max-w-7xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Cpu size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Kombi Elektronik Kart</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Vaillant, Bosch, Demirdöküm, E.C.A, Baykan ve tüm markalar için sıfır ve garantili anakart tedariği.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Wrench size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Beyaz Eşya Parçaları</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Çamaşır makinesi, buzdolabı, bulaşık makinesi pompaları, rezistanslar ve ventil grupları.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Truck size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">B2B Bayi &amp; Servis Ağı</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Bölgedeki teknik servislere özel iskonto oranları, vadeli cari hesap ve anında depodan sevkiyat.</p>
          </div>

        </div>
      </section>

      {/* --- POPÜLER PARÇALAR BÖLÜMÜ --- */}
      {popularProducts.length > 0 && (
        <section className="pb-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
                  <Sparkles size={14} /> Stoktaki Parçalar
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">Öne Çıkan Yedek Parçalar</h2>
                <p className="text-slate-500 text-xs mt-1">Fiyatlar <strong>KDV Hariçtir</strong>. Bayi girişi yaparak özel iskontolu fiyatlarınızı görebilirsiniz.</p>
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
            Kataloğumuzda göremediğiniz özel parça kodları veya toptan sipariş teklifleri için doğrudan bizimle iletişime geçebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/905525843073?text=Merhaba,%20parça%20sorgulamak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-800 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 text-xs"
            >
              <MessageCircle size={18} className="text-emerald-600" /> WhatsApp Destek Hattı
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