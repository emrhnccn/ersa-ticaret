import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data'; 
import { ChevronRight, Cpu, Wrench, Truck, Award, Package, Users, Timer, ShieldCheck, Phone, MessageCircle } from 'lucide-react';

export default function Home() {
  const popularProducts = products.slice(0, 4);

  const testimonials = [
    {
      text: "Darıca'da aradığım tüm kombi kartlarını anında bulabildiğim tek yer. Fiyatları da toptancı olduğu için çok uygun.",
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

  // Marka logoları
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

      {/* --- VİTRİN FOTOĞRAFLI HERO ALANI --- */}
      <section className="relative overflow-hidden pt-24 pb-40 md:pt-32 md:pb-48 flex items-center justify-center min-h-[600px] perspective-1000">
        <div 
          className="absolute inset-0 z-0 scale-105 transform origin-bottom transition-transform duration-[20s] ease-out hover:scale-110"
          style={{
            backgroundImage: 'url("/vitrin.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
          }}
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-10" />
        
        {/* Dinamik Renk Küreleri (Animasyonlu) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none opacity-60">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/40 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="animate-fade-in-up inline-flex items-center justify-center px-6 py-2.5 mb-8 text-sm font-bold text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-2xl shadow-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse" />
            Darıca &amp; Gebze&apos;nin 1 Numaralı Tedarikçisi
          </div>
          
          <h1 className="animate-fade-in-up-delay-1 text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1] drop-shadow-2xl">
            Beyaz Eşya ve Kombi <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-rose-400 drop-shadow-md">
              Yedek Parça Merkezi
            </span>
          </h1>
          
          <p className="animate-fade-in-up-delay-2 text-slate-300 text-lg md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-lg">
            Kombi elektronik kartları, beyaz eşya yedek parçaları ve profesyonel teknik servis ekipmanları tedariğinde tek adresiniz.
          </p>
          
          <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <a 
              href="tel:+905525843073"
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-blue-600/30 active:scale-95 text-lg group"
            >
              <Phone size={22} className="group-hover:rotate-12 transition-transform" />
              Hemen Ara
            </a>
            
            <a 
              href="https://wa.me/905525843073?text=Merhaba,%20stokta%20parça%20sorgulamak%20istiyorum."
              target="_blank"
              className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl shadow-xl active:scale-95 text-lg group"
            >
              <MessageCircle size={22} className="group-hover:scale-110 transition-transform text-rose-400" />
              WhatsApp Parça Sorgula
            </a>
          </div>
        </div>
      </section>

      {/* --- HİZMETLER BÖLÜMÜ (OVERLAPPING) --- */}
      <section className="relative z-30 -mt-24 px-4 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Cpu size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Kombi Elektronik Kart</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Her marka kombi için sıfır ve muadil elektronik anakart tedariği sağlıyoruz.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <Wrench size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Beyaz Eşya Parçaları</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Çamaşır makinesi, buzdolabı ve bulaşık makinesi için orijinal ve yan sanayi parça satışı.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-red-400" />
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
              <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">Teknik Servis Tedariği</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Bölgedeki teknik servisler için toplu parça tedariği ve hızlı sevkiyat imkanı sunuyoruz.</p>
          </div>

        </div>
      </section>

      {/* --- YENİ: GÜVEN İSTATİSTİKLERİ BÖLÜMÜ --- */}
      <section className="pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            {/* Arka plan süsleri */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Neden Ersa Ticaret?</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Yıllardır bölgenin güvenilir yedek parça tedarikçisi olarak hizmet veriyoruz.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-blue-500/20">
                    <Award size={32} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">15+</div>
                  <div className="text-sm text-slate-400 font-medium">Yıllık Deneyim</div>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-emerald-500/20">
                    <Package size={32} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">1000+</div>
                  <div className="text-sm text-slate-400 font-medium">Ürün Çeşidi</div>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-amber-500/20">
                    <Users size={32} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">500+</div>
                  <div className="text-sm text-slate-400 font-medium">Teknik Servis Müşterisi</div>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-indigo-500/20">
                    <Timer size={32} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">Aynı Gün</div>
                  <div className="text-sm text-slate-400 font-medium">Stoktan Teslimat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- POPÜLER PARÇALAR BÖLÜMÜ --- */}
      <section className="pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Popüler Parçalar</h2>
              <p className="text-slate-500">En çok tercih edilen yedek parçalar</p>
            </div>
            <Link href="/urunler" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group">
              Tümünü Gör <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* --- YENİ: MARKA LOGOLARI SLIDER --- */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">Çalıştığımız Markalar</h2>
          <p className="text-slate-500 text-sm">Tüm büyük markaların orijinal ve muadil yedek parçaları stoğumuzda.</p>
        </div>
        
        <div className="w-full overflow-hidden relative">
          {/* Kenar fade efekti */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex w-max animate-brand-scroll">
            <div className="flex items-center gap-8 pr-8">
              {brands.map((brand, i) => (
                <div key={i} className="shrink-0 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-bold text-sm tracking-wide whitespace-nowrap hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-default">
                  {brand}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-8 pr-8" aria-hidden="true">
              {brands.map((brand, i) => (
                <div key={`copy-${i}`} className="shrink-0 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-bold text-sm tracking-wide whitespace-nowrap hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-default">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- MÜŞTERİ YORUMLARI (KAYAN YAZI) --- */}
      <section className="py-24 bg-slate-900 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Müşterilerimiz ve Ustalarımız Ne Diyor?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Yıllardır Kocaeli ve Darıca bölgesindeki yüzlerce bireysel müşteriye ve teknik servise güvenle yedek parça tedarik ediyoruz.</p>
          </div>

          <div className="flex w-max animate-infinite-scroll">
            <div className="flex gap-6 pr-6">
              {testimonials.map((testi, i) => (
                <div key={i} className="w-[320px] md:w-[400px] shrink-0 bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors cursor-default">
                  <div className="flex text-emerald-400 mb-4">★★★★★</div>
                  <p className="text-slate-300 text-sm md:text-base italic mb-6 leading-relaxed">&quot;{testi.text}&quot;</p>
                  <div>
                    <h4 className="text-white font-bold text-sm">{testi.author}</h4>
                    <span className="text-blue-400 text-xs">{testi.source}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-6 pr-6" aria-hidden="true">
              {testimonials.map((testi, i) => (
                <div key={`copy-${i}`} className="w-[320px] md:w-[400px] shrink-0 bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors cursor-default">
                  <div className="flex text-emerald-400 mb-4">★★★★★</div>
                  <p className="text-slate-300 text-sm md:text-base italic mb-6 leading-relaxed">&quot;{testi.text}&quot;</p>
                  <div>
                    <h4 className="text-white font-bold text-sm">{testi.author}</h4>
                    <span className="text-blue-400 text-xs">{testi.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- GÜVEN BANDI (CTA) --- */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Aradığınız Parçayı Bulamıyor musunuz?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Kataloğumuzda olmayan parçalar için bize WhatsApp&apos;tan yazın veya mağazamızı ziyaret edin. Binlerce çeşit parçamız depoda sizin için hazır.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://wa.me/905525843073?text=Merhaba,%20kataloğunuzda%20bulamadığım%20bir%20parça%20sorgulamak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-95 hover:bg-blue-50"
            >
              <ShieldCheck size={20} /> WhatsApp ile Sorgula
            </a>
            <Link 
              href="/iletisim"
              className="w-full sm:w-auto px-8 py-4 bg-blue-800/50 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-400/30 transition-all duration-300 active:scale-95"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  );
}