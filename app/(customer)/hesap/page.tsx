'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  FileText,
  MapPin,
  Building2,
  LogOut,
  Sparkles,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Lock
} from 'lucide-react';

export default function MusteriHesapPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isB2B } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'currentAccount' | 'invoices'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [cariAccount, setCariAccount] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Cari Ödeme Modalı
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/giris');
      return;
    }

    if (user) {
      // Siparişleri çek
      fetch('/api/v1/orders')
        .then(r => r.json())
        .then(d => {
          if (d.orders) setOrders(d.orders);
        })
        .catch(() => {});

      // B2B ise cari hesabı çek
      if (isB2B && user.company) {
        fetch('/api/v1/current-account')
          .then(r => r.json())
          .then(d => {
            if (d.account) setCariAccount(d.account);
          })
          .catch(() => {})
          .finally(() => setLoadingData(false));
      } else {
        setLoadingData(false);
      }
    }
  }, [user, authLoading, isB2B, router]);

  const handleInitCariPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    setPayLoading(true);
    try {
      const res = await fetch('/api/v1/current-account/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ödeme başlatılamadı');

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err: any) {
      alert(err.message || 'Ödeme başlatılamadı');
      setPayLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* ÜST BAŞLIK ALANI */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20">
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900">{user?.name}</h1>
                {isB2B && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {user?.company?.customerGroup?.name || 'Onaylı Bayi'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{user?.email} • {user?.phone || 'Telefon Kayıtlı Değil'}</p>
              {user?.company && (
                <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1">
                  <Building2 size={13} className="text-blue-600" /> {user.company.legalName} (Vergi No: {user.company.taxNo})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/urunler"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
            >
              Kataloğa Git &amp; Sipariş Ver
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* ANA PANEL DÜZENİ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SOL MENÜ (3 Kolon) */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-1 text-xs font-bold sticky top-24">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutDashboard size={18} />
                <span>Genel Bakış</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition-colors ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Package size={18} />
                  <span>Siparişlerim</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {orders.length}
                </span>
              </button>

              {isB2B && (
                <button
                  onClick={() => setActiveTab('currentAccount')}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-colors ${activeTab === 'currentAccount' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    <span>Cari Hesabım &amp; Ekstre</span>
                  </div>
                  {cariAccount && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-colors ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileText size={18} />
                <span>e-Faturalarım</span>
              </button>

            </div>
          </aside>

          {/* SAĞ İÇERİK (9 Kolon) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* 1. GENEL BAKIŞ (DASHBOARD) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* B2B Cari Metrik Kartları */}
                {isB2B && cariAccount && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cari Kredi Limiti</div>
                      <div className="text-2xl font-black text-slate-900">{cariAccount.creditLimit.toLocaleString('tr-TR')} ₺</div>
                      <div className="text-[11px] text-slate-500 mt-1">Admin tarafından tanımlanan limit</div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Güncel Borç Bakiyesi</div>
                      <div className="text-2xl font-black text-rose-600">{cariAccount.currentBalance.toLocaleString('tr-TR')} ₺</div>
                      <button
                        onClick={() => { setPayAmount(String(cariAccount.currentBalance)); setShowPayModal(true); }}
                        className="mt-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <CreditCard size={13} /> Online Ödeme Yap
                      </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kullanılabilir Limit</div>
                      <div className="text-2xl font-black text-emerald-600">{cariAccount.availableLimit.toLocaleString('tr-TR')} ₺</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">Cariyle sipariş verilebilir</div>
                    </div>
                  </div>
                )}

                {/* Son Siparişler Tablosu */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <h2 className="text-base font-black text-slate-900">Son Siparişlerim</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Tümünü Gör
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Henüz verilmiş bir siparişiniz bulunmuyor.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 4).map((order: any) => (
                        <div key={order.id} className="py-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-slate-900 font-mono">#{order.orderNo}</div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')} • {order.items?.length || 1} Kalem
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900">
                              {Number(order.grandTotal).toLocaleString('tr-TR')} {order.currency}
                            </div>
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 2. SİPARİŞLERİM */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">
                  Tüm Sipariş Geçmişi
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Henüz kayıtlı bir siparişiniz bulunmamaktadır.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                          <div>
                            <div className="text-sm font-black text-slate-900 font-mono">Sipariş No: #{order.orderNo}</div>
                            <div className="text-xs text-slate-500 font-medium">
                              Tarih: {new Date(order.createdAt).toLocaleString('tr-TR')} | Ödeme: {order.paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Hesap' : 'Kredi Kartı'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black uppercase">
                              {order.status}
                            </span>
                            <div className="text-base font-black text-blue-600">
                              {Number(order.grandTotal).toLocaleString('tr-TR')} {order.currency}
                            </div>
                          </div>
                        </div>

                        {/* Kalemler */}
                        <div className="divide-y divide-slate-100 text-xs">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="py-2 flex justify-between">
                              <span className="font-bold text-slate-800">{item.quantity}x {item.name} <span className="text-slate-400 font-mono">({item.sku})</span></span>
                              <span className="font-bold text-slate-900">{Number(item.lineGross).toLocaleString('tr-TR')} {item.currency}</span>
                            </div>
                          ))}
                        </div>

                        {/* Fatura & Kargo Linkleri */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
                          <div className="flex items-center gap-4">
                            {order.shipments && order.shipments[0] && (
                              <span className="text-slate-600 flex items-center gap-1">
                                <Truck size={14} className="text-blue-600" /> Takip: <strong className="font-mono text-slate-900">{order.shipments[0].trackingNumber}</strong>
                              </span>
                            )}
                          </div>

                          {order.invoices && order.invoices[0] && (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <FileText size={14} /> Fatura: {order.invoices[0].number}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. CARİ HESABIM & EKSTRE (B2B) */}
            {activeTab === 'currentAccount' && isB2B && cariAccount && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Cari Hesap Ekstresi</h2>
                    <p className="text-xs text-slate-500">Tüm borç, alacak ve Sanal POS ödeme hareketleriniz</p>
                  </div>

                  <button
                    onClick={() => { setPayAmount(String(cariAccount.currentBalance)); setShowPayModal(true); }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <CreditCard size={16} /> Sanal POS İle Cari Ödeme Yap
                  </button>
                </div>

                {/* Bakiye Özeti */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold">Tanımlı Kredi Limiti:</span>
                    <strong className="text-base text-slate-900 font-black">{cariAccount.creditLimit.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Toplam Borç Bakiyesi:</span>
                    <strong className="text-base text-rose-600 font-black">{cariAccount.currentBalance.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Kalan Kullanılabilir Limit:</span>
                    <strong className="text-base text-emerald-600 font-black">{cariAccount.availableLimit.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                </div>

                {/* Hareketler Defteri (Ledger) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="p-3">Tarih</th>
                        <th className="p-3">İşlem Açıklaması</th>
                        <th className="p-3">Tür</th>
                        <th className="p-3 text-right">Tutar</th>
                        <th className="p-3 text-right">Kalan Bakiye</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {cariAccount.transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500">{new Date(t.createdAt).toLocaleString('tr-TR')}</td>
                          <td className="p-3 font-bold text-slate-800">{t.note || (t.orderNo ? `Sipariş #${t.orderNo}` : 'Cari Hareket')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${t.type === 'DEBIT' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {t.type === 'DEBIT' ? 'BORÇ' : 'ALACAK / TAHSİLAT'}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-bold ${t.type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {t.type === 'DEBIT' ? `+${t.amount.toLocaleString('tr-TR')} ₺` : `-${t.amount.toLocaleString('tr-TR')} ₺`}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {t.balanceAfter.toLocaleString('tr-TR')} ₺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* 4. e-FATURALAR */}
            {activeTab === 'invoices' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">
                  Resmi e-Fatura / e-Arşiv Faturalarım
                </h2>
                
                <div className="divide-y divide-slate-100 text-xs">
                  {orders.filter(o => o.invoices && o.invoices.length > 0).map((order: any) => {
                    const inv = order.invoices[0];
                    return (
                      <div key={inv.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Fatura No: {inv.number}</div>
                          <div className="text-slate-400 mt-0.5">
                            Sipariş: #{order.orderNo} • {new Date(inv.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-800">
                            {Number(order.grandTotal).toLocaleString('tr-TR')} {order.currency}
                          </span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
                            PDF Görüntüle
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* CARİ BORÇ ÖDEME POPUP MODALI */}
      {showPayModal && cariAccount && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2">Cari Hesaba Ödeme Yap</h3>
            <p className="text-xs text-slate-500 mb-6">
              Sanal POS üzerinden istediğiniz tutarda ödeme yaparak cari borcunuzu anında kapatabilirsiniz.
            </p>

            <form onSubmit={handleInitCariPayment} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Mevcut Borç Bakiyesi</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-rose-600">
                  {cariAccount.currentBalance.toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Ödemek İstediğiniz Tutar (TL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Örn: 25000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  {payLoading ? 'Hazırlanıyor...' : 'Sanal POS İle Öde'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
