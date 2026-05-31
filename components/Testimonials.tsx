import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Ahmet Usta (Kombi Servisi)",
    text: "Darıca'da aradığım tüm kombi kartlarını anında bulabildiğim tek yer. Fiyatları da toptancı olduğu için çok uygun.",
    rating: 5,
  },
  {
    name: "Mehmet Y.",
    text: "Çamaşır makinesinin pompası bozulmuştu, sağ olsunlar kodundan anında bulup verdiler. Güvenilir esnaf.",
    rating: 5,
  },
  {
    name: "Hakan T. (Teknik Servis)",
    text: "Sabah sipariş geçiyorum, anında malzemeleri hazırlıyorlar. Kocaeli çevresinde böyle parça stoğu olan yer az.",
    rating: 5,
  },
  {
    name: "Ayşe K.",
    text: "Buzdolabı termostatı için gitmiştik. İlgilendiler, doğru parçayı verdiler. WhatsApp'tan çok hızlı dönüyorlar.",
    rating: 5,
  },
  {
    name: "Kemal Demir",
    text: "Darıca'nın en köklü yedek parçacısı. Ne zaman bir sensör, kart lazım olsa Ersa Ticaret'te buluyorum.",
    rating: 5,
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">Müşterilerimiz ve Ustalarımız Ne Diyor?</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">Yıllardır Kocaeli ve Darıca bölgesindeki yüzlerce bireysel müşteriye ve teknik servise güvenle yedek parça tedarik ediyoruz.</p>
      </div>

      {/* CSS Mask ile kenarları şeffaflaştırılmış kayan bant alanı */}
      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        
        {/* 1. Dizi */}
        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-marquee">
          {reviews.map((review, index) => (
            <li key={index} className="w-[350px] bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col shrink-0">
              <div className="flex gap-1 mb-3 text-amber-400">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow italic">"{review.text}"</p>
              <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
              <span className="text-xs text-blue-600 font-medium mt-1">Google Yorumu</span>
            </li>
          ))}
        </ul>
        
        {/* Kusursuz döngü (infinite loop) için 2. Dizi (Kopya) */}
        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-marquee" aria-hidden="true">
          {reviews.map((review, index) => (
            <li key={`copy-${index}`} className="w-[350px] bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col shrink-0">
              <div className="flex gap-1 mb-3 text-amber-400">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow italic">"{review.text}"</p>
              <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
              <span className="text-xs text-blue-600 font-medium mt-1">Google Yorumu</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}