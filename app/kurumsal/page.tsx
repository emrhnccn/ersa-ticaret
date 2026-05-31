'use client';
import { Store, ShieldCheck, Truck, X } from 'lucide-react';
import { useState } from 'react';

export default function KurumsalPage() {
  const photos = Array.from({ length: 20 }, (_, i) => `/magaza/${i + 1}.jpeg`);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- YENİ: KOYU VE GÖSTERİŞLİ TEPE ALANI (HERO) --- */}
      <div className="bg-slate-900 pt-20 pb-40 relative overflow-hidden">
        {/* Arka plan süsleri */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[100%] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 text-blue-400 rounded-2xl mb-6 backdrop-blur-sm border border-white/10 shadow-lg">
            <Store size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
            Ersa Ticaret'e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Hoş Geldiniz</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            Yılların getirdiği tecrübe ve geniş stok ağımızla, beyaz eşya ve kombi yedek parça sektöründe bölgenin en güvenilir tedarikçisi olmaktan gurur duyuyoruz.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-slate-200 font-medium bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="text-emerald-400" size={20} /> %100 Orijinal Parça
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-medium bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm">
              <Truck className="text-blue-400" size={20} /> Hızlı Tedarik Ağı
            </div>
          </div>
        </div>
      </div>

      {/* --- İÇERİK ALANI (TAŞMA EFEKTİ İLE) --- */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-24 w-full mb-20">
        
        {/* KURUCU (SADIK AKGÜMÜŞ) KARTI */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-900/10 border border-slate-100 mb-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/80 rounded-full blur-3xl -mr-20 -mt-20 z-0 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />

          <div className="relative z-10 shrink-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-slate-300 relative">
              <img
                src="/sadik-bey.jpg" 
                alt="Sadık Akgümüş"
                className="w-full h-full object-cover bg-slate-100"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=Sadik+Akgumus&background=0D8ABC&color=fff&size=256&font-size=0.33";
                }}
              />
            </div>
            <div className="absolute bottom-2 md:bottom-4 right-0 md:right-2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md border-2 border-white">
              Kurucu
            </div>
          </div>

          <div className="relative z-10 text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Sadık Akgümüş</h2>
            <p className="text-blue-600 font-semibold mb-4 text-sm md:text-base uppercase tracking-wider">Ersa Ticaret İşletme Sahibi</p>
            <p className="text-slate-600 leading-relaxed text-lg">
              Yıllarını ısıtma, soğutma ve beyaz eşya sektörüne adamış olan Sadık Akgümüş, Ersa Ticaret'in temellerini <strong>"dürüst esnaflık ve karşılıklı güven"</strong> ilkesiyle atmıştır. Bölgedeki teknik servislerin ve bireysel müşterilerin parça ihtiyacını en hızlı şekilde çözmeyi misyon edinen Akgümüş, tecrübesiyle sektörde güvenilir bir çözüm ortağı olmaya devam etmektedir.
            </p>
          </div>
        </div>

        {/* --- VİZYON / DUVAR TABLOLARI --- */}
        <div className="relative py-16 md:py-20 rounded-[2.5rem] bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-200 shadow-inner overflow-hidden">
          
          <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%2394a3b8\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
          
          <div className="relative max-w-[90rem] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              
              {/* 1. PANEL: BİZ */}
              <div className="relative bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 hover:-translate-y-1 transition-transform duration-500">
                
                <div className="hidden md:block absolute top-6 left-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                <div className="hidden md:block absolute top-6 right-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                <div className="hidden md:block absolute bottom-6 left-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                <div className="hidden md:block absolute bottom-6 right-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>

                <div className="flex items-center justify-center md:w-1/4 shrink-0">
                  <span className="text-8xl xl:text-[9rem] font-black leading-none text-slate-900 tracking-tighter" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>BİZ</span>
                </div>

                <div className="flex flex-col justify-center w-full md:w-3/4 space-y-1 md:space-y-1.5 text-center md:text-left select-none">
                  <p className="text-xl md:text-[2.2rem] xl:text-[2.6rem] leading-none font-black tracking-tighter text-slate-900 uppercase">ÇEVİK BİR TAKIMIZ</p>
                  <p className="text-base md:text-[1.4rem] xl:text-[1.65rem] leading-none font-semibold italic tracking-tight text-slate-700 uppercase">HER ZAMAN POZİTİF BAKARIZ</p>
                  <p className="text-lg md:text-[1.8rem] xl:text-[2.1rem] leading-none font-extrabold tracking-tight text-slate-800 uppercase">İŞİMİZİ TUTKUYLA YAPARIZ</p>
                  <p className="text-base md:text-[1.6rem] xl:text-[1.85rem] leading-none font-black italic tracking-tighter text-slate-900 uppercase">DEĞERLERİMİZE BAĞLIYIZ</p>
                  <p className="text-2xl md:text-[2.4rem] xl:text-[2.8rem] leading-none font-black tracking-normal text-slate-900 uppercase">SÖZÜMÜZÜ TUTARIZ</p>
                  <p className="text-lg md:text-[1.8rem] xl:text-[2.15rem] leading-none font-bold italic tracking-tighter text-slate-800 uppercase">PROAKTİF YAKLAŞIRIZ</p>
                  <p className="text-sm md:text-[1.3rem] xl:text-[1.5rem] leading-none font-bold tracking-wide text-slate-700 uppercase">YENİLİKLERİN PEŞİNDEN KOŞARIZ</p>
                  <p className="text-2xl md:text-[2.6rem] xl:text-[3.2rem] leading-none font-black italic tracking-tighter text-slate-900 uppercase">ÇÖZÜM ODAKLIYIZ</p>
                  <p className="text-lg md:text-[1.8rem] xl:text-[2.15rem] leading-none font-bold tracking-tight text-slate-800 uppercase">ZORLUKLARA DAYANIRIZ</p>
                  <p className="text-xs md:text-[1.1rem] xl:text-[1.35rem] leading-none font-black italic tracking-tight text-slate-700 uppercase">KARARLARIMIZI #HEPBİRLİKTE ALIRIZ</p>
                  <p className="text-base md:text-[1.6rem] xl:text-[1.9rem] leading-none font-extrabold tracking-tight text-slate-900 uppercase">BAŞARILARIMIZI KEYİFLE KUTLARIZ</p>
                </div>
              </div>

              {/* 2. PANEL: İLKELER */}
              <div className="relative bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 hover:-translate-y-1 transition-transform duration-500">
                
                <div className="hidden md:block absolute top-6 left-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                <div className="hidden md:block absolute top-6 right-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                <div className="hidden md:block absolute bottom-6 left-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                <div className="hidden md:block absolute bottom-6 right-6 w-3 h-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>

                <div className="flex items-center justify-center md:w-1/4 shrink-0">
                  <span className="text-7xl xl:text-[7rem] font-black leading-none text-slate-900 tracking-tighter" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>İLKELER</span>
                </div>

                <div className="flex flex-col justify-center w-full md:w-3/4 space-y-1.5 md:space-y-2 text-center md:text-left select-none">
                  <p className="text-lg md:text-[1.5rem] xl:text-[1.7rem] leading-none font-black tracking-tight text-slate-900 uppercase">STRATEJİK DÜŞÜNÜR, PLANLI HAREKET EDERİZ</p>
                  <p className="text-base md:text-[1.2rem] xl:text-[1.3rem] leading-none font-semibold italic tracking-tight text-slate-700 uppercase">KALİTEYİ HER SÜRECİMİZİN MERKEZİNE KOYARIZ</p>
                  <p className="text-lg md:text-[1.5rem] xl:text-[1.7rem] leading-none font-extrabold tracking-tight text-slate-800 uppercase">SORUMLULUK ALIR, SONUÇ ODAKLI ÇALIŞIRIZ</p>
                  <p className="text-base md:text-[1.3rem] xl:text-[1.4rem] leading-none font-black italic tracking-tighter text-slate-900 uppercase">İŞİMİZE DEĞER KATAR, FARK YARATAN ÇÖZÜMLER ÜRETİRİZ</p>
                  <p className="text-xl md:text-[1.6rem] xl:text-[1.8rem] leading-none font-black tracking-tighter text-slate-900 uppercase">GÜVENİLİRLİK VE ŞEFFAFLIK TEMEL PRENSİPLERİMİZDİR</p>
                  <p className="text-base md:text-[1.2rem] xl:text-[1.35rem] leading-none font-bold italic tracking-tighter text-slate-800 uppercase">ZAMANI ETKİN KULLANIR, VERİMLİLİĞİ ÖN PLANDA TUTARIZ</p>
                  <p className="text-sm md:text-[1.1rem] xl:text-[1.2rem] leading-none font-bold tracking-tight text-slate-700 uppercase">YENİLİKÇİ BAKIŞ AÇISIYLA SÜREKLİ İLERLEMEYİ HEDEFLERİZ</p>
                  <p className="text-lg md:text-[1.4rem] xl:text-[1.6rem] leading-none font-black italic tracking-tight text-slate-900 uppercase">KURUMSAL STANDARTLARA BAĞLI SÜRDÜRÜLEBİLİR BAŞARI SAĞLARIZ</p>
                  <p className="text-base md:text-[1.3rem] xl:text-[1.5rem] leading-none font-bold tracking-tight text-slate-800 uppercase">İŞ BİRLİĞİ İLE DAHA GÜÇLÜ SONUÇLAR ELDE EDERİZ</p>
                  <p className="text-sm md:text-[1.2rem] xl:text-[1.3rem] leading-none font-black italic tracking-tight text-slate-700 uppercase">PROFESYONELLİĞİ HER ALANDA ÖNCELİK HALİNE GETİRİRİZ</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* --- YENİ KOYU BANT: FOTOĞRAF GALERİSİ --- */}
      <div className="bg-slate-900 py-20 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">Mağazamızdan Kareler</h2>
            <p className="text-slate-400">Dükkanımızı ve geniş ürün yelpazemizi yakından inceleyin.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 shadow-lg border border-slate-700 hover:border-slate-500 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-500/20 transition-colors z-10" />
                <img 
                  src={photo} 
                  alt={`Ersa Ticaret Mağaza Görseli ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BÜYÜTÜLMÜŞ FOTOĞRAF EKRANI (LIGHTBOX) */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 md:p-10 transition-all duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedPhoto} 
            alt="Büyütülmüş Görsel" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10 transform scale-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

    </div>
  );
}