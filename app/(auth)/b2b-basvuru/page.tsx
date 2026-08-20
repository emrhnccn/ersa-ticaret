'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function B2BBasvuruPage() {
  const [legalName, setLegalName] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Kocaeli');
  const [district, setDistrict] = useState('Gebze');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/b2b-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalName,
          taxNo,
          taxOffice,
          name,
          phone,
          email,
          password,
          addressLine,
          city,
          district,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Başvuru gönderilemedi');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* ÜST BAŞLIK */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold mb-3 border border-amber-500/30">
            <Sparkles size={14} /> Kurumsal Bayilik Avantajları
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            B2B Bayi Başvuru Formu
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-lg mx-auto">
            Teknik servisler ve toptancılar için özel iskonto grupları, vadeli cari hesap ve öncelikli kargo avantajlarından yararlanın.
          </p>
        </div>

        {/* FORM KARTI */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Başvurunuz Alındı!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Bayilik başvurunuz sistemimize kaydedilmiştir. Bilgileriniz onaylandıktan sonra tanımlanan özel iskonto oranınız ve cari limitiniz ile sisteme giriş yapabilirsiniz.
              </p>
              <div className="pt-4">
                <Link
                  href="/giris"
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl inline-block text-xs transition-colors"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* 1. Şirket Bilgileri */}
              <div>
                <div className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" /> Şirket &amp; Vergi Bilgileri
                </div>
                
                <div className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="block text-slate-700 mb-1">Firma Resmi Ünvanı *</label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="Örn: ABC Isı ve Soğutma Sistemleri Ltd. Şti."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">Vergi Numarası *</label>
                      <input
                        type="text"
                        required
                        value={taxNo}
                        onChange={(e) => setTaxNo(e.target.value)}
                        placeholder="10 Haneli Vergi No"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Vergi Dairesi *</label>
                      <input
                        type="text"
                        required
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        placeholder="Örn: Gebze VD"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Yetkili & Giriş Bilgileri */}
              <div>
                <div className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" /> Yetkili &amp; Hesap Bilgileri
                </div>

                <div className="space-y-3 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">Yetkili Adı Soyadı *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ad Soyad"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">İletişim Cep Telefonu *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">E-Posta (Giriş İçin) *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="bayi@firma.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Hesap Şifresi *</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Adres Bilgileri */}
              <div>
                <div className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Firma Adresi
                </div>

                <div className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="block text-slate-700 mb-1">Açık Adres *</label>
                    <textarea
                      required
                      rows={2}
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Firma açık adresi..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">İl *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">İlçe</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/25 active:scale-95 text-sm"
              >
                <span>{loading ? 'Başvuru Gönderiliyor...' : 'Bayilik Başvurusunu Tamamla'}</span>
                <ArrowRight size={16} />
              </button>

            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Zaten hesabınız var mı?{' '}
            <Link href="/giris" className="text-blue-600 font-bold hover:underline">
              Giriş Yapın
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
