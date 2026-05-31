import { services } from '@/lib/data';
import { PhoneCall, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Hizmetlerimiz | Yedek Parça Tedariği',
  description: 'Darıca ve Kocaeli çevresinde kombi anakart satışı, beyaz eşya yedek parça temini ve teknik servislere özel toptan parça satış hizmetlerimiz.',
};

export default function HizmetlerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Tedarik Hizmetlerimiz</h1>
        <p className="text-slate-600 text-lg">
          Hem bireysel müşterilerimiz hem de bölgedeki teknik servisler için hızlı, geniş stoklu ve güvenilir yedek parça satışımız mevcuttur.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h2>
            <p className="text-slate-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 text-white rounded-3xl p-8 md:p-12 text-center flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-4">Özel Bir Parçaya mı İhtiyacınız Var?</h3>
        <p className="text-blue-200 mb-8 max-w-2xl">
          Aradığınız parça stoklarımızda olmasa bile geniş tedarik ağımız sayesinde kısa sürede temin ediyoruz. Hemen WhatsApp'tan parça kodunu veya fotoğrafını gönderin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="tel:05525843073" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <PhoneCall size={20} /> 0552 584 30 73
          </a>
          <a href="https://wa.me/905525843073" target="_blank" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            WhatsApp'tan Parça Sor
          </a>
        </div>
      </div>
    </div>
  );
}