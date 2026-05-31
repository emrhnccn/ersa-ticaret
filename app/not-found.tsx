import Link from 'next/link';
import { Home, MessageCircle, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] bg-slate-50 flex flex-col items-center justify-center px-4 py-20 selection:bg-blue-200">
      
      {/* İkon Bölümü */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full" />
        <div className="w-28 h-28 bg-white border border-slate-100 shadow-2xl rounded-[2rem] flex items-center justify-center relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>
          <AlertCircle size={56} className="text-blue-600" />
        </div>
      </div>

      {/* Metin İçeriği */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">
        Eyvah! <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Parça Bulunamadı</span>
      </h1>
      
      <p className="text-slate-500 text-lg md:text-xl text-center max-w-2xl mb-12 leading-relaxed">
        Aradığınız yedek parçanın linki değişmiş veya sistemden kaldırılmış olabilir. 
        Ama hiç dert etmeyin; <strong className="text-slate-700">binlerce çeşit parçamız depoda!</strong> Hemen fotoğrafını atın, raftan bulalım.
      </p>

      {/* Yönlendirme Butonları */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        
        {/* WhatsApp'a Kurtarma Aksiyonu */}
        <a 
          href="https://wa.me/905525843073?text=Merhaba,%20sitenizde%20aradığım%20bir%20parçayı%20bulamadım.%20Stok%20sorgulamak%20istiyorum."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-emerald-500/30 active:scale-95"
        >
          <MessageCircle size={22} />
          WhatsApp'tan Bize Sorun
        </a>

        {/* Ana Sayfaya Dönüş */}
        <Link 
          href="/"
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm active:scale-95"
        >
          <Home size={22} />
          Ana Sayfaya Dön
        </Link>
        
      </div>
    </div>
  );
}