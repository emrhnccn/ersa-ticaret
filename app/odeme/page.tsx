'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock
} from 'lucide-react';

export default function OdemePage() {
  const router = useRouter();
  const { cart, getTotals, clearCart, currency } = useCart();
  const { user, isB2B } = useAuth();
  const totals = getTotals();

  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'CURRENT_ACCOUNT'>('CREDIT_CARD');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Kocaeli');
  const [district, setDistrict] = useState('Gebze');
  const [taxNo, setTaxNo] = useState(user?.company?.taxNo || '');
  const [taxOffice, setTaxOffice] = useState(user?.company?.taxOffice || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cariAccount, setCariAccount] = useState<any>(null);

  // B2B Cari hesap bilgilerini çek
  useEffect(() => {
    if (isB2B && user?.company) {
      fetch('/api/v1/current-account')
        .then(r => r.json())
        .then(d => {
          if (d.account) setCariAccount(d.account);
        })
        .catch(() => {});
    }
  }, [isB2B, user]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
        currency,
        address: {
          recipientName,
          recipientPhone,
          line1: addressLine,
          city,
          district,
          taxNo: taxNo || undefined,
          taxOffice: taxOffice || undefined,
        },
        notes,
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sipariş oluşturulamadı');
      }

      clearCart();

      // Sanal POS yönlendirmesi veya Başarı sayfası
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/hesap?orderSuccess=${data.order?.orderNo || 'true'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sepetiniz Boş</h2>
        <Link href="/urunler" className="text-blue-600 font-bold hover:underline">
          Kataloğa Dön
        </Link>
      </div>
    );
  }

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        <Link
          href="/sepet"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft size={14} className="mr-1.5" /> Sepete Dön
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
          Güvenli Ödeme &amp; Sipariş Onayı
        </h1>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl mb-6 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SOL TARAF: ADRES VE ÖDEME YÖNTEMİ (8 Kolon) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. TESLİMAT & FATURA BİLGİLERİ */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Truck size={18} className="text-blue-600" /> 1. Teslimat &amp; Fatura Adresi
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Alıcı Adı / Yetkili Kişi *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">İletişim Telefonu *</label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Açık Adres *</label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Mahalle, Cadde, Sokak, Kapı No vb."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">İl *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">İlçe</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Kurumsal Fatura Bilgileri */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" /> Kurumsal e-Fatura Bilgileri (Opsiyonel)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Vergi Numarası / TCKN</label>
                    <input
                      type="text"
                      value={taxNo}
                      onChange={(e) => setTaxNo(e.target.value)}
                      placeholder="Vergi No veya TCKN"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      placeholder="Örn: Gebze VD"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* 2. ÖDEME YÖNTEMİ SEÇİMİ */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" /> 2. Ödeme Yöntemi
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Seçenek 1: Kredi Kartı / Sanal POS */}
                <label
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${paymentMethod === 'CREDIT_CARD' ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                      <CreditCard size={20} />
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setPaymentMethod('CREDIT_CARD')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">Kredi / Banka Kartı</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Sanal POS ile 3D Secure güvenli ödeme</div>
                  </div>
                </label>

                {/* Seçenek 2: B2B Cari Hesap */}
                <label
                  onClick={() => {
                    if (isB2B && cariAccount) setPaymentMethod('CURRENT_ACCOUNT');
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${isB2B && cariAccount ? (paymentMethod === 'CURRENT_ACCOUNT' ? 'border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-500/10 cursor-pointer' : 'border-slate-200 hover:border-slate-300 cursor-pointer') : 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    {isB2B && cariAccount ? (
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'CURRENT_ACCOUNT'}
                        onChange={() => setPaymentMethod('CURRENT_ACCOUNT')}
                        className="w-4 h-4 text-emerald-600"
                      />
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Sadece B2B</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">B2B Cari Hesap Limiti</div>
                    {isB2B && cariAccount ? (
                      <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        Kalan Limit: {cariAccount.availableLimit.toLocaleString('tr-TR')} ₺
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 mt-0.5">Onaylı bayilik hesabı gereklidir</div>
                    )}
                  </div>
                </label>

              </div>

              {/* Sipariş Notu */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sipariş Notu (Opsiyonel)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kargo şubesi, montaj notu vb."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

            </div>

          </div>

          {/* SAĞ TARAF: ÖZET VE ONAY BUTONU (4 Kolon) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 sticky top-28 space-y-6">
              
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                Ödenecek Tutar
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Ara Toplam (KDV Hariç)</span>
                  <strong className="text-slate-800 font-bold">
                    {totals.subtotalExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Hesaplanan KDV (%20)</span>
                  <strong className="text-slate-800 font-bold">
                    {totals.vatTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Kargo</span>
                  <strong className="text-emerald-600 font-bold">ÜCRETSİZ</strong>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900">Genel Toplam</span>
                  <span className="text-2xl font-black text-blue-600">
                    {totals.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Lock size={12} className="text-emerald-600" /> Güvenli Ödeme Bildirimi
                </div>
                <p>Kart bilgileriniz sunucularımızda saklanmaz. PCI DSS uyumlu Sanal POS üzerinden işlenir.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/25 active:scale-95 text-sm"
              >
                {loading ? 'İşleniyor...' : (paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Hesapla Onayla' : 'Ödeme Adımına Geç')}
              </button>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
