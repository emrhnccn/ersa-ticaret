'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

function PosSimulationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'TRY';
  const purpose = searchParams.get('purpose') || 'ORDER';

  const [cardNumber, setCardNumber] = useState('5400 0000 0000 0000');
  const [cardHolder, setCardHolder] = useState('AHMET CINAR');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (status: 'SUCCESS' | 'FAILED') => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/payments/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amount: parseFloat(amount),
          currency,
          purpose,
          status: status === 'SUCCESS' ? 'PAID' : 'FAILED',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ödeme reddedildi');
      }

      if (purpose === 'CURRENT_ACCOUNT') {
        router.push('/hesap?paymentSuccess=true');
      } else {
        router.push('/hesap?orderSuccess=true');
      }
    } catch (err: any) {
      setError(err.message || 'İşlem başarısız');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200">
        
        {/* Üst Logo ve Güvenlik */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2 font-black text-slate-800 tracking-tight">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">
              POS
            </div>
            <span>3D SECURE GÜVENLİ ÖDEME</span>
          </div>
          <ShieldCheck size={24} className="text-emerald-500" />
        </div>

        {/* Tutar Göstergesi */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Ödenecek Tutar
          </div>
          <div className="text-3xl font-black text-slate-900">
            {parseFloat(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            İşlem: {purpose === 'CURRENT_ACCOUNT' ? 'Cari Hesap Bakiye Ödemesi' : 'Sipariş Ödemesi'}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl mb-4 text-xs flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Kart Formu */}
        <div className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">Kart Numarası</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Kart Üzerindeki İsim</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Son Kullanma (AA/YY)</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-center"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">CVV / Güvenlik Kodu</label>
              <input
                type="password"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-center"
              />
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => handlePay('SUCCESS')}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 active:scale-95 text-sm"
          >
            <Lock size={16} /> {loading ? 'Ödeme Onaylanıyor...' : '3D Secure İle Ödemeyi Onayla'}
          </button>

          <button
            onClick={() => handlePay('FAILED')}
            disabled={loading}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
          >
            İşlemi İptal Et / Başarısız Simülasyonu
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OdemeSimulasyonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <PosSimulationContent />
    </Suspense>
  );
}
