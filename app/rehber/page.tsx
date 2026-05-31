'use client';
import Link from 'next/link';
import { BookOpen, AlertTriangle, Settings, CheckCircle, ChevronRight, Wrench } from 'lucide-react';

export default function RehberPage() {
  const guides = [
    {
      title: "Kombi Anakart Arıza Kodları",
      description: "Demirdöküm, Bosch ve Vaillant kombilerde en sık karşılaşılan anakart arıza kodları ve çözümleri.",
      icon: <AlertTriangle size={28} className="text-amber-500" />,
      bg: "bg-amber-50",
      category: "Kombi",
      slug: "#" // İleride burası "/rehber/kombi-anakart-ariza-kodlari" olacak
    },
    {
      title: "Orijinal vs. Yan Sanayi Parça",
      description: "Hangi durumlarda orijinal parça kullanılmalı? Yan sanayi parçaların avantajları ve riskleri nelerdir?",
      icon: <CheckCircle size={28} className="text-emerald-500" />,
      bg: "bg-emerald-50",
      category: "Genel Bilgi",
      slug: "#"
    },
    {
      title: "Bulaşık Makinesi Pompa Seçimi",
      description: "Makinenize uyumlu doğru sirkülasyon pompasını seçerken dikkat etmeniz gereken güç ve soket detayları.",
      icon: <Settings size={28} className="text-blue-500" />,
      bg: "bg-blue-50",
      category: "Beyaz Eşya",
      slug: "#"
    },
    {
      title: "Kombi Sensör Testi Nasıl Yapılır?",
      description: "NTC sensörlerin sağlamlık testini multimetre ile nasıl yapabileceğinizi adım adım anlattık.",
      icon: <Wrench size={28} className="text-indigo-500" />,
      bg: "bg-indigo-50",
      category: "Teknik Servis",
      slug: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- KOYU TEPE (HERO) EKRANI --- */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-blue-500/30 shadow-lg">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Yedek Parça Rehberi</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl">Ustalar ve son kullanıcılar için teknik bilgiler, arıza çözüm rehberleri ve parça seçim tüyoları.</p>
        </div>
      </div>

      {/* --- İÇERİK ALANI --- */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-16 w-full pb-20">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {guides.map((guide, index) => (
            // DİKKAT: Artık tüm kart "Link" etiketiyle sarılı olduğu için her yeri tıklanabilir oldu.
            <Link href={guide.slug} key={index} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-900/5 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group flex flex-col h-full">
              
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 ${guide.bg} rounded-2xl flex items-center justify-center`}>
                  {guide.icon}
                </div>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {guide.category}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {guide.title}
              </h3>
              
              <p className="text-slate-500 leading-relaxed flex-1 mb-8">
                {guide.description}
              </p>

              {/* Tıklanabilir Görünümdeki Oku Butonu */}
              <div className="flex items-center text-blue-600 font-bold text-sm mt-auto">
                Rehberi Oku <ChevronRight size={18} className="ml-1 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Alt Kısım Destek Kartı */}
        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none" />
          
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-white mb-2">Aradığınız bilgiyi bulamadınız mı?</h3>
            <p className="text-slate-300 text-lg">Teknik ekibimize WhatsApp üzerinden ulaşıp anında destek alabilirsiniz.</p>
          </div>
          
          <a 
            href="https://wa.me/905525843073"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 whitespace-nowrap px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            Teknik Destek İste
          </a>
        </div>

      </div>
    </div>
  );
}