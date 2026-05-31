'use client';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- KOYU TEPE (HERO) EKRANI --- */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[80px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-blue-500/30 shadow-lg">
            <MapPin size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Bize Ulaşın</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl">
            Yedek parça stok durumu, teknik destek veya toptan alımlar için bizimle iletişime geçin. Dükkanımızı ziyaret ederek parçaları yakından inceleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* --- İÇERİK ALANI --- */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-16 w-full pb-20">
        
        {/* ÜST BÖLÜM: BİLGİLER VE FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Sol Taraf: İletişim Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-900/5 h-full">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">İletişim Bilgileri</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Telefon</p>
                    <a href="tel:+905525843073" className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors">+90 552 584 30 73</a>
                  </div>
                </div>

                {/* GÜNCELLENEN TAM AÇIK ADRES (SEO İÇİN ÖNEMLİ) */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Adres</p>
                    <p className="text-base font-bold text-slate-800 leading-relaxed">
                      Nenehatun, Battal Gazi Cd. No:139/A<br/>41700 Darıca / Kocaeli
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Çalışma Saatleri</p>
                    <p className="text-base font-bold text-slate-800">Pzt - Cmt: 08:30 - 19:00</p>
                    <p className="text-base font-bold text-slate-800 text-blue-600">Pazar: 13:00 - 17:00</p>
                  </div>
                </div>
              </div>

              {/* Dev WhatsApp Butonu */}
              <a 
                href="https://wa.me/905525843073?text=Merhaba,%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                <MessageCircle size={22} /> WhatsApp'tan Yazın
              </a>
            </div>
          </div>

          {/* Sağ Taraf: İletişim Formu */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-900/5 h-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Bize Mesaj Gönderin</h3>
              <p className="text-slate-500 mb-8">Parça talepleriniz veya sorularınız için aşağıdaki formu doldurabilirsiniz. Size en kısa sürede dönüş yapacağız.</p>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Adınız Soyadınız</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Usta Ahmet" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Telefon Numaranız</label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="0555 555 55 55" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Konu</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700">
                    <option>Parça Stok Sorgulama</option>
                    <option>Toptan Fiyat Talebi</option>
                    <option>Teknik Destek / Soru</option>
                    <option>Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mesajınız</label>
                  <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" placeholder="Aradığınız parçanın kodunu veya sorunuzu buraya yazın..."></textarea>
                </div>

                <button className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/30 active:scale-95 ml-auto">
                  <Send size={20} /> Mesajı Gönder
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- HARİTA VE YOL TARİFİ ALANI --- */}
        <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-200 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-4 md:px-0">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Mağazamızı Ziyaret Edin</h3>
              <p className="text-slate-500">Darıca'daki dükkanımıza gelerek yedek parçaları yerinde inceleyebilirsiniz.</p>
            </div>
            {/* GÜNCELLENEN YOL TARİFİ LİNKİ */}
            <a 
              href="https://maps.google.com/?q=Nenehatun,+Battal+Gazi+Cd.+No:139/A,+41700+Darıca/Kocaeli" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg active:scale-95 whitespace-nowrap w-full md:w-auto justify-center"
            >
              <MapPin size={20} /> Yol Tarifi Al
            </a>
          </div>
          
          {/* GÜNCELLENEN GOOGLE MAPS İFRAME KODU (Tam Adres Konumu) */}
          <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 relative">
            <iframe 
              src="https://maps.google.com/maps?q=Nenehatun,+Battal+Gazi+Cd.+No:139/A,+41700+Darıca/Kocaeli&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}