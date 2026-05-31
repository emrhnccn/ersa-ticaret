import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data'; 
import { ChevronRight, Cpu, Wrench, Truck } from 'lucide-react'; // YENİ İKONLAR EKLENDİ

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
      `}</style>

      {/* --- VİTRİN FOTOĞRAFLI YENİ HERO ALANI --- */}
      {/* Alt kısımdan biraz daha boşluk (pb-40) verdik ki kartlar üzerine taşabilsin */}
      <section className="relative overflow-hidden pt-24 pb-40 md:pt-32 md:pb-48 flex items-center justify-center min-h-[600px]">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/vitrin.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
          }}
        />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] z-10" />

        {/* YUMUŞAK GEÇİŞ (FADE): Fotoğrafın alt kısmını sayfanın arka plan rengine doğru eritir */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center px-5 py-2 mb-8 text-sm font-semibold text-blue-200 bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-lg">
            Darıca & Gebze'nin 1 Numaralı Tedarikçisi
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-lg">
            Beyaz Eşya ve Kombi <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-md">
              Yedek Parça Merkezi
            </span>
          </h1>
          
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
            Kombi elektronik kartları, beyaz eşya yedek parçaları ve profesyonel teknik servis ekipmanları tedariğinde tek adresiniz. Toptan ve perakende parça satışı.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a 
              href="tel:+905525843073"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/50 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Hemen Ara
            </a>
            
            <a 
              href="https://wa.me/905525843073?text=Merhaba,%20stokta%20parça%20sorgulamak%20istiyorum."
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-500 transition-all duration-300 backdrop-blur-md shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Parça Sorgula
            </a>
          </div>
        </div>
      </section>

      {/* --- HİZMETLER BÖLÜMÜ (ÖRTÜŞEN / OVERLAPPING TASARIM) --- */}
      {/* -mt-24 ile kartları yukarı, fotoğrafın üstüne doğru taşırdık */}
      <section className="relative z-30 -mt-24 px-4 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kutu 1 - Kombi Kart */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Cpu size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Kombi Elektronik Kart</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Her marka kombi için sıfır ve muadil elektronik anakart tedariği sağlıyoruz.</p>
          </div>

          {/* Kutu 2 - Beyaz Eşya */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <Wrench size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Beyaz Eşya Parçaları</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Çamaşır makinesi, buzdolabı ve bulaşık makinesi için orijinal ve yan sanayi parça satışı.</p>
          </div>

          {/* Kutu 3 - Teknik Servis */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Teknik Servis Tedariği</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Bölgedeki teknik servisler için toplu parça tedariği ve hızlı sevkiyat imkanı sunuyoruz.</p>
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
                  <p className="text-slate-300 text-sm md:text-base italic mb-6 leading-relaxed">"{testi.text}"</p>
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
                  <p className="text-slate-300 text-sm md:text-base italic mb-6 leading-relaxed">"{testi.text}"</p>
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
      
    </main>
  );
}