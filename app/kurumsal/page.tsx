'use client';
import { ShieldCheck, Truck, Clock, MessageCircle, X, Eye } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface TourPhoto {
  src: string;
  title: string;
  desc: string;
}

const STORE_TOUR_PHOTOS: TourPhoto[] = [
  { src: '/magaza/1.jpeg', title: 'Kombi Elektronik Anakart Raf Sistemi', desc: 'Vaillant, Demirdöküm, Bosch ve E.C.A dahil 800+ farklı model anakart rafta hazır.' },
  { src: '/magaza/4.jpeg', title: 'Beyaz Eşya Motor & Pompa Reyonu', desc: 'Çamaşır ve bulaşık makinesi sirkülasyon pompaları, ventil grupları ve tahliye motorları.' },
  { src: '/magaza/7.jpeg', title: 'Darıca Satış & Usta Karşılama Tezgahı', desc: 'Bölgedeki kombi ve beyaz eşya servislerinin günlük parça temin merkezi.' },
  { src: '/magaza/10.jpeg', title: 'Test & Kalite Kontrol Masası', desc: 'Tüm elektronik kartlar ve bobinler usta eline geçmeden önce voltaj ve röle testinden geçer.' },
  { src: '/magaza/14.jpeg', title: 'Sensör, Vana & Conta Çekmeceleri', desc: 'NTC sensörler, 3 yollu vana motorları, prosestatlar ve emniyet ventilleri.' },
  { src: '/magaza/18.jpeg', title: 'Günlük Kargo & Hızlı Sevkiyat Masası', desc: 'Saat 16:00\'a kadar verilen siparişler aynı gün Türkiye\'nin her yerine kargolanır.' },
];

export default function KurumsalPage() {
  const allPhotos = Array.from({ length: 20 }, (_, i) => `/magaza/${i + 1}.jpeg`);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showAllGallery, setShowAllGallery] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. TEKNİK ATÖLYE & BLUEPRINT HERO */}
      <div className="bg-slate-950 bg-blueprint-grid pt-20 pb-36 relative overflow-hidden border-b border-slate-800">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pcb-900/60 border border-pcb-700/60 rounded-full text-emerald-400 text-xs font-bold font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DARICA / KOCAELİ MERKEZ DEPO
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight">
            15 Yıllık Esnaf Güveniyle <br className="hidden sm:inline" />
            <span className="text-copper-400">Teknik Parça &amp; Elektronik Kart Üssü</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Kombi anakartlarından beyaz eşya motorlarına; ustanın dilinden anlayan esnaflık, doğru teşhis ve doğrudan toptan tedarik güvencesi.
          </p>
        </div>
      </div>

      {/* 2. İÇERİK ALANI */}
      <div className="max-w-6xl mx-auto px-4 relative z-20 -mt-20 w-full mb-20">
        {/* KURUCU (SADIK AKGÜMÜŞ) KARTI */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200/80 mb-16 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="relative shrink-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md relative bg-slate-100">
              <Image
                src="/sadik-bey.jpg"
                alt="Sadık Akgümüş - Ersa Ticaret Kurucusu"
                fill
                sizes="(max-width: 768px) 144px, 176px"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-copper-300 text-[11px] font-mono font-bold px-3 py-1 rounded-lg border border-slate-700 shadow">
              Kurucu &amp; Usta
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="text-xs font-bold text-copper-600 uppercase tracking-widest mb-1 font-mono">
              BÖLGENİN GÜVENİLİR YEDEK PARÇA ESNAFI
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Sadık Akgümüş</h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Yıllarını kombi, beyaz eşya ve ısıtma sektörünün mutfağında geçiren Sadık Akgümüş, Ersa Ticaret&apos;i <strong>&ldquo;parçayı satan değil, arızayı çözen esnaf&rdquo;</strong> anlayışıyla kurmuştur. Darıca&apos;daki mağazamızda teknik servis ustalarına ve bölge halkına sadece parça vermiyor; doğru teşhis ve uyumlu soket teyidiyle sahada zaman kaybını önlüyoruz.
            </p>
          </div>
        </div>

        {/* 3. 4 SOMUT ESNAFLIK & TOPTANCI İLKESİ */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold text-pcb-900 bg-pcb-50 px-3 py-1 rounded-md border border-pcb-200 uppercase tracking-wider">
              Çalışma Felsefemiz
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
              Sözümüzü Laf ile Değil, Sahada Tutarız
            </h3>
            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl mx-auto">
              Kurumsal sloganlar yerine teknik servislerin her gün yaşadığı problemlere 4 net taahhüt sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İlke 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:border-pcb-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-pcb-50 text-pcb-900 flex items-center justify-center mb-4 border border-pcb-200 font-bold">
                <Clock size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">
                1. Bugün Sipariş, Bugün Elden &amp; Depodan Teslim
              </h4>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Müşterisinin kombisi kış günü duran teknik servisi bekletmeyiz. Darıca, Gebze ve Çayırova bölgesindeki acil parça ihtiyaçlarını dakikalar içinde raftan teslim ediyoruz.
              </p>
            </div>

            {/* İlke 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:border-copper-600 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-copper-50 text-copper-700 flex items-center justify-center mb-4 border border-copper-200 font-bold">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">
                2. Doğru Teşhis, Birebir Uyum Garantisi
              </h4>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                &ldquo;Bu kart uyar mı?&rdquo; tereddüdünü bitiriyoruz. Cihaz modeli ve seri numarasını teyit ederek doğru revizyonlu kartı verir, ustanın sahada ikinci kez gitmesini önleriz.
              </p>
            </div>

            {/* İlke 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:border-pcb-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 font-bold">
                <Truck size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">
                3. Doğrudan Toptancı Fiyatı &amp; Şeffaf İskonto
              </h4>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Aracı ve komisyoncu olmadan doğrudan birinci el toptan fiyatlarla çalışırız. B2B anlaşmalı bayilerimize net iskonto ve vadeli cari hesap kolaylığı sağlarız.
              </p>
            </div>

            {/* İlke 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200 font-bold">
                <MessageCircle size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">
                4. Usta Ustayı Anlar: WhatsApp&apos;tan Fotoğraf Atın
              </h4>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Kodu silinmiş veya yanmış kartın fotoğrafını WhatsApp hattımıza göndermeniz yeterli. Ekibimiz parçayı anında tanır, muadilini ve stok durumunu hemen iletir.
              </p>
            </div>
          </div>
        </div>

        {/* 4. MAĞAZADA BİR TUR */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-copper-600 uppercase tracking-wider">
                Fiziki Stoklarımız
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                Mağazada Bir Tur
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-1">
                Darıca mağazamızdaki 3.600+ parça stoğunu ve çalışma alanlarımızı keşfedin.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAllGallery(!showAllGallery)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-pcb-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Eye size={15} />
              {showAllGallery ? 'Turu Kısalt' : 'Tüm 20 Mağaza Fotoğrafını Gör'}
            </button>
          </div>

          {/* 6 Hikayeli Kare */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORE_TOUR_PHOTOS.map((tour, index) => (
              <div
                key={index}
                onClick={() => setSelectedPhoto(tour.src)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-pcb-700 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                  <Image
                    src={tour.src}
                    alt={tour.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-copper-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    0{index + 1}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-pcb-900 transition-colors">
                    {tour.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {tour.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tüm 20 Fotoğraf Genişletilmiş Görünümü */}
          {showAllGallery && (
            <div className="mt-10 p-6 bg-slate-900 rounded-3xl border border-slate-800 animate-in fade-in duration-300">
              <div className="text-white font-bold text-base mb-4 flex items-center justify-between">
                <span>Tüm Mağaza Arşivi (20 Fotoğraf)</span>
                <span className="text-xs text-slate-400 font-mono font-normal">Tıklayarak büyütebilirsiniz</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {allPhotos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-copper-400 transition-all hover:scale-105"
                  >
                    <Image
                      src={photo}
                      alt={`Ersa Ticaret Mağaza Fotoğrafı ${i + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover opacity-80 hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 md:p-10"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={28} />
          </button>
          <div className="relative w-full max-w-4xl h-[75vh] max-h-[800px]">
            <Image
              src={selectedPhoto}
              alt="Büyütülmüş Görsel"
              fill
              unoptimized
              sizes="90vw"
              className="object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}