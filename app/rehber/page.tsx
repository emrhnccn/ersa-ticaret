import Link from 'next/link';
import { blogPosts } from '@/lib/data';
import { BookOpen, ChevronRight, Wrench } from 'lucide-react';

export const metadata = {
  title: 'Yedek Parça ve Tamir Rehberi | Kombi & Beyaz Eşya İpuçları',
  description: 'Kombi ve beyaz eşya arızaları, yedek parça seçim rehberi ve teknik servis ipuçları.',
  alternates: {
    canonical: 'https://www.ersaticaret.com/rehber',
  },
};

export default function RehberPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      
      {/* TEPE (HERO) EKRANI */}
      <div className="bg-slate-900 pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="animate-fade-in-up w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <BookOpen size={32} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">Teknik Bilgi Rehberi</h1>
          <p className="animate-fade-in-up-delay-2 text-slate-300 text-lg md:text-xl max-w-2xl drop-shadow-md">Doğru parçayı seçmek ve cihaz arızalarını anlamak için ustalarımızın hazırladığı rehberler.</p>
        </div>
      </div>

      {/* REHBER KARTLARI */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <div key={post.slug} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col group hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Wrench size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3 leading-snug">{post.title}</h2>
              <p className="text-slate-500 mb-8 flex-grow text-sm leading-relaxed">{post.description}</p>
              
              {/* İŞTE ÇALIŞMAYAN BUTONUN ÇÖZÜMÜ BURADA (Link Kullanımı) */}
              <Link 
                href={`/rehber/${post.slug}`} 
                className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Rehberi Oku <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}