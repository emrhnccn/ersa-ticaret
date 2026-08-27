'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Printer,
  Search,
  ShoppingCart,
  Zap,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Percent,
  TrendingUp,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface QuickOrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  product?: any;
}

export default function MusteriHesapPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isB2B } = useAuth();
  const { addToCart, addMultipleToCart } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'quickOrder' | 'currentAccount' | 'invoices'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [cariAccount, setCariAccount] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Cari Ödeme Modalı
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Cari Hareket Filtresi
  const [cariFilter, setCariFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');

  // Proforma / Fiş Yazdırma Modalı
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<any | null>(null);

  // Hızlı Ürün Arama (Dashboard İçi)
  const [dashSearchQuery, setDashSearchQuery] = useState('');
  const [dashSearchResults, setDashSearchResults] = useState<any[]>([]);
  const [dashSearchLoading, setDashSearchLoading] = useState(false);

  // Hızlı Sipariş Fişi Satırları
  const [quickRows, setQuickRows] = useState<QuickOrderItem[]>([
    { id: '1', sku: '', name: '', quantity: 1, price: 0 },
    { id: '2', sku: '', name: '', quantity: 1, price: 0 },
    { id: '3', sku: '', name: '', quantity: 1, price: 0 },
  ]);
  const [bulkInputText, setBulkInputText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/giris');
      return;
    }

    if (user) {
      // 1. Siparişleri çek
      fetch('/api/v1/orders')
        .then(r => r.json())
        .then(d => {
          if (d.orders) setOrders(d.orders);
        })
        .catch(() => {});

      // 2. B2B ise cari hesabı çek
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

  // Dashboard içi hızlı arama
  useEffect(() => {
    if (!dashSearchQuery.trim() || dashSearchQuery.length < 2) {
      setDashSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setDashSearchLoading(true);
      fetch(`/api/v1/products?search=${encodeURIComponent(dashSearchQuery)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setDashSearchResults(data.items || []);
        })
        .catch(() => {})
        .finally(() => setDashSearchLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [dashSearchQuery]);

  // Sık Alınan Ürünleri Sipariş Geçmişinden Grupla
  const frequentlyOrderedProducts = useMemo(() => {
    const map = new Map<string, { product: any; count: number; lastQty: number; sku: string; name: string }>();
    for (const order of orders) {
      for (const item of (order.items || [])) {
        const key = item.productId || item.sku;
        if (!key) continue;
        const existing = map.get(key);
        if (existing) {
          existing.count += Number(item.quantity);
        } else {
          map.set(key, {
            product: item.product || {
              id: item.productId || item.sku,
              name: item.name,
              sku: item.sku,
              priceQuote: { unitNetExVat: Number(item.unitNetExVat), lineGross: Number(item.lineGross), displayCurrency: item.currency || 'TRY' },
            },
            count: Number(item.quantity),
            lastQty: Number(item.quantity),
            sku: item.sku,
            name: item.name,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [orders]);

  // 1-Click Re-Order (Siparişi Tekrarla)
  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) {
      showToast('❌ Bu siparişte eklenecek ürün bulunamadı');
      return;
    }

    const itemsToAdd = order.items.map((item: any) => {
      const prod = item.product || {
        id: item.productId || item.sku,
        slug: item.product?.slug || item.sku,
        name: item.name,
        sku: item.sku,
        priceQuote: {
          unitNetExVat: Number(item.unitNetExVat),
          lineGross: Number(item.lineGross),
          displayCurrency: item.currency || 'TRY',
        },
      };
      return {
        product: prod,
        qty: Number(item.quantity) || 1,
      };
    });

    addMultipleToCart(itemsToAdd);
    showToast(`✓ #${order.orderNo} siparişindeki ${itemsToAdd.length} ürün güncel fiyatlarla sepete eklendi!`);
    router.push('/sepet');
  };

  // Hızlı Sipariş Fişi - Satır Arama & Güncelleme
  const handleSearchRowSku = async (index: number, query: string) => {
    const updated = [...quickRows];
    updated[index].sku = query;
    setQuickRows(updated);

    if (query.length >= 3) {
      try {
        const res = await fetch(`/api/v1/products?search=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const found = data.items[0];
          updated[index].name = found.name;
          updated[index].price = found.priceQuote?.unitNetExVat || found.salePrice || 0;
          updated[index].product = found;
          setQuickRows([...updated]);
        }
      } catch {}
    }
  };

  // Hızlı Sipariş Fişini Sepete Ekle
  const handleAddQuickRowsToCart = () => {
    const validRows = quickRows.filter(r => r.product && r.quantity > 0);
    if (validRows.length === 0) {
      showToast('❌ Lütfen en az bir geçerli parça seçiniz');
      return;
    }

    const itemsToAdd = validRows.map(r => ({
      product: r.product,
      qty: r.quantity,
    }));

    addMultipleToCart(itemsToAdd);
    showToast(`✓ Hızlı sipariş fişinizdeki ${validRows.length} kalem sepete aktarıldı!`);
    router.push('/sepet');
  };

  // Toplu Metin Ayrıştırma (Örn: SKU Adet formatı)
  const handleProcessBulkInput = async () => {
    const lines = bulkInputText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedRows: QuickOrderItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/[\s,;:\t]+/);
      const sku = parts[0];
      const qty = parseInt(parts[1]) || 1;
      parsedRows.push({
        id: String(Date.now() + i),
        sku,
        name: 'Aranıyor...',
        quantity: qty,
        price: 0,
      });
    }

    setQuickRows(parsedRows);
    setShowBulkModal(false);
    showToast(`✓ ${parsedRows.length} satır ayrıştırıldı, parçalar taranıyor.`);

    // Arka planda ürünleri doldur
    for (let i = 0; i < parsedRows.length; i++) {
      try {
        const res = await fetch(`/api/v1/products?search=${encodeURIComponent(parsedRows[i].sku)}&limit=1`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const found = data.items[0];
          parsedRows[i].name = found.name;
          parsedRows[i].price = found.priceQuote?.unitNetExVat || found.salePrice || 0;
          parsedRows[i].product = found;
          setQuickRows([...parsedRows]);
        }
      } catch {}
    }
  };

  // Cari Ödeme Başlatma
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

  // Sipariş Durumu Stepper Fonksiyonu
  const getOrderStep = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'PREPARING' || s === 'APPROVED') return 2;
    if (s === 'CANCELLED' || s === 'REJECTED') return -1;
    return 1; // PENDING
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-mono">
        Kullanıcı Oturumu Doğrulanıyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ADMİN HIZLI GEÇİŞ ÇUBUĞU */}
        {user?.role === 'ADMIN' && (
          <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                👑
              </div>
              <div>
                <div className="font-black text-sm text-white">Sistem Yöneticisi (Admin) Hesabı</div>
                <div className="text-xs text-slate-400">Yedek parça stoğu ve içerik yönetimi için yönetim paneline geçin.</div>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition-all shrink-0"
            >
              Yönetim Paneline Git →
            </Link>
          </div>
        )}

        {/* MÜŞTERİ BAŞLIK VE KÜNYE KARTI */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-slate-900 text-amber-300 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border border-slate-700 font-mono">
              {user?.company?.legalName ? user.company.legalName[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'M')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900">
                  {user?.company?.legalName || user?.name}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Yetkili: <strong>{user?.name}</strong> • {user?.email} • {user?.phone || 'Telefon Kayıtlı Değil'}
              </p>
              {user?.company && (
                <div className="flex items-center gap-3 text-xs text-slate-600 font-mono mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Building2 size={13} className="text-pcb-900" /> Vergi No: {user.company.taxNo}
                  </span>
                  {user.company.taxOffice && <span>VD: {user.company.taxOffice}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 flex-wrap">
            <button
              onClick={() => setActiveTab('quickOrder')}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Zap size={15} className="text-amber-600 fill-amber-600" /> Hızlı Sipariş Fişi
            </button>
            <Link
              href="/urunler"
              className="px-5 py-2.5 bg-slate-900 hover:bg-pcb-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Package size={15} /> Parça Kataloğu
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>

        {/* ANA PANEL GRID DÜZENİ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SOL B2B MENÜ (3 Kolon) */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-1.5 text-xs font-bold sticky top-24">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'text-copper-400' : ''} />
                <span>Genel Bakış &amp; Stok</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                  activeTab === 'orders'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className={activeTab === 'orders' ? 'text-copper-400' : ''} />
                  <span>Siparişlerim &amp; Tekrar</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-slate-800 text-copper-300' : 'bg-slate-100 text-slate-600'}`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('quickOrder')}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                  activeTab === 'quickOrder'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap size={18} className={activeTab === 'quickOrder' ? 'text-amber-400' : 'text-amber-500'} />
                  <span>Hızlı Sipariş Fişi</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-800 font-black">
                  SKU
                </span>
              </button>

              {isB2B && (
                <button
                  onClick={() => setActiveTab('currentAccount')}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                    activeTab === 'currentAccount'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className={activeTab === 'currentAccount' ? 'text-copper-400' : ''} />
                    <span>Cari Hesabım &amp; Ekstre</span>
                  </div>
                  {cariAccount && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText size={18} className={activeTab === 'invoices' ? 'text-copper-400' : ''} />
                <span>e-Faturalarım</span>
              </button>

            </div>
          </aside>

          {/* SAĞ İÇERİK (9 Kolon) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* ========================================================
                1. GENEL BAKIŞ (DASHBOARD)
               ======================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Cari Finansal Kartlar (B2B) */}
                {isB2B && cariAccount && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Cari Kredi Limiti
                      </div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {cariAccount.creditLimit.toLocaleString('tr-TR')} ₺
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Tanımlı açık hesap vadeniz</div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Güncel Borç Bakiyesi
                      </div>
                      <div className="text-2xl font-black text-rose-600 font-mono">
                        {cariAccount.currentBalance.toLocaleString('tr-TR')} ₺
                      </div>
                      <button
                        onClick={() => { setPayAmount(String(cariAccount.currentBalance)); setShowPayModal(true); }}
                        className="mt-2 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <CreditCard size={13} /> Sanal POS ile Kapat
                      </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Kullanılabilir Limit
                      </div>
                      <div className="text-2xl font-black text-emerald-600 font-mono">
                        {cariAccount.availableLimit.toLocaleString('tr-TR')} ₺
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">Cariyle sipariş verebilirsiniz</div>
                    </div>
                  </div>
                )}

                {/* Bayi Avantajları & İskonto Karnesi */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-mono font-bold mb-2 border border-blue-500/30">
                        <Sparkles size={13} /> ERSA TİCARET ONLİNE YEDEK PARÇA
                      </div>
                      <h3 className="text-lg font-black text-white">
                        {user?.company?.legalName || user?.name || 'Kayıtlı Müşteri Hesabı'}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        Tüm kombi anakartları ve beyaz eşya parçalarında geniş ürün kataloğu ve anında stok danışma desteğimiz aktiftir.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Vadeli Cari</div>
                        <div className="text-sm font-black text-emerald-400">Aktif</div>
                      </div>
                      <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Hızlı Sevkiyat</div>
                        <div className="text-sm font-black text-amber-400">Aynı Gün</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard İçi Canlı Parça Arama ve Anında Sepete Ekleme */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Hızlı Parça Arama &amp; Stok Sorgu</h3>
                      <p className="text-xs text-slate-500">Katalog sayfasına gitmeden anında parça bulun ve sepete atın</p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={dashSearchQuery}
                      onChange={(e) => setDashSearchQuery(e.target.value)}
                      placeholder="OEM Kodu veya parça adı yazın (Örn: 10021972 veya Vaillant kart)..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-pcb-700"
                    />
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  </div>

                  {/* Arama Sonuçları Listesi */}
                  {dashSearchResults.length > 0 && (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                      {dashSearchResults.map((prod: any) => (
                        <div key={prod.id} className="p-3 bg-slate-50/50 hover:bg-slate-100/80 flex items-center justify-between gap-4 text-xs transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                              <Image
                                src={prod.images?.[0]?.url || 'https://placehold.co/100x100'}
                                alt={prod.name}
                                fill
                                unoptimized
                                className="object-contain p-1"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{prod.name}</div>
                              <div className="text-[11px] font-mono text-copper-600 font-bold">OEM: {prod.sku}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right font-mono">
                              <div className="font-black text-slate-900">
                                {(prod.priceQuote?.unitNetExVat || prod.salePrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ + KDV
                              </div>
                              <span className="text-[10px] text-emerald-700 font-bold">Stokta Var</span>
                            </div>
                            <button
                              onClick={() => {
                                addToCart(prod, 1);
                                showToast(`✓ "${prod.name}" sepete eklendi`);
                              }}
                              className="px-3 py-2 bg-slate-900 hover:bg-pcb-900 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                            >
                              <ShoppingCart size={13} /> Ekle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sık Alınan Parçalar Widget'ı */}
                {frequentlyOrderedProducts.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-copper-50 text-copper-700 flex items-center justify-center font-bold">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Sık Sipariş Ettiğiniz Parçalar</h3>
                          <p className="text-[11px] text-slate-500">En çok tükettiğiniz ürünleri tek tıkla tekrar sepete atın</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {frequentlyOrderedProducts.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</div>
                            <div className="text-[10px] font-mono text-copper-600 font-bold">OEM: {item.sku}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Toplam Alım: {item.count} adet</div>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(item.product, item.lastQty || 1);
                              showToast(`✓ "${item.name}" sepete eklendi (${item.lastQty || 1} adet)`);
                            }}
                            className="px-3 py-2 bg-slate-900 hover:bg-pcb-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all shadow-sm"
                          >
                            <RefreshCw size={12} /> {item.lastQty || 1} Adet Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Son Siparişler Özeti (Tek Tıkla Re-Order Butonlu) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <h2 className="text-base font-black text-slate-900">Son Siparişler</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-pcb-900 hover:underline"
                    >
                      Tümünü Gör ({orders.length})
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Henüz verilmiş bir siparişiniz bulunmuyor.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 3).map((order: any) => (
                        <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 font-mono">#{order.orderNo}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')} • {order.items?.length || 1} Kalem Ürün
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-left sm:text-right font-mono">
                              <div className="text-base font-black text-slate-900">
                                {Number(order.grandTotal).toLocaleString('tr-TR')} {order.currency}
                              </div>
                            </div>
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                              title="Bu siparişteki tüm ürünleri sepete aktar"
                            >
                              <RefreshCw size={13} /> Tekrarla
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================
                2. SİPARİŞLERİM & 1-CLICK RE-ORDER HUB
               ======================================================== */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Tüm Sipariş Geçmişi</h2>
                    <p className="text-xs text-slate-500">Geçmiş siparişlerinizi inceleyin, durumlarını takip edin veya tek tıkla tekrarlayın</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Henüz kayıtlı bir siparişiniz bulunmamaktadır.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any) => {
                      const currentStep = getOrderStep(order.status);

                      return (
                        <div key={order.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5">
                          
                          {/* Sipariş Başlığı & Aksiyonlar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-black text-slate-900 font-mono">Sipariş No: #{order.orderNo}</span>
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-black uppercase">
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium mt-1">
                                Tarih: {new Date(order.createdAt).toLocaleString('tr-TR')} • Ödeme: {order.paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Hesap' : 'Kredi Kartı'}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* 1-Click Re-Order Butonu */}
                              <button
                                onClick={() => handleReorder(order)}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                              >
                                <RefreshCw size={14} /> Bu Siparişi Tekrarla
                              </button>

                              {/* Proforma / Fiş Yazdır Butonu */}
                              <button
                                onClick={() => setSelectedOrderForPrint(order)}
                                className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <Printer size={14} /> Fiş / Yazdır
                              </button>
                            </div>
                          </div>

                          {/* Sipariş Durumu Görsel Stepper */}
                          <div className="py-2">
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              <div className={`p-2 rounded-xl border ${currentStep >= 1 ? 'bg-pcb-50 border-pcb-200 text-pcb-900 font-black' : 'bg-white border-slate-200 text-slate-400'}`}>
                                1. Alındı
                              </div>
                              <div className={`p-2 rounded-xl border ${currentStep >= 2 ? 'bg-pcb-50 border-pcb-200 text-pcb-900 font-black' : 'bg-white border-slate-200 text-slate-400'}`}>
                                2. Hazırlanıyor
                              </div>
                              <div className={`p-2 rounded-xl border ${currentStep >= 3 ? 'bg-pcb-50 border-pcb-200 text-pcb-900 font-black' : 'bg-white border-slate-200 text-slate-400'}`}>
                                3. Kargoda
                              </div>
                              <div className={`p-2 rounded-xl border ${currentStep >= 4 ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-black' : 'bg-white border-slate-200 text-slate-400'}`}>
                                4. Teslim Edildi
                              </div>
                            </div>
                          </div>

                          {/* Kalemler Tablosu */}
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                                <div>
                                  <span className="font-bold text-slate-900">{item.quantity}x {item.name}</span>
                                  <span className="text-copper-600 font-mono font-bold ml-2">OEM: {item.sku}</span>
                                </div>
                                <div className="font-mono font-black text-slate-900">
                                  {Number(item.lineGross).toLocaleString('tr-TR')} {item.currency}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Kargo Takip & Fatura Bilgisi */}
                          <div className="pt-2 flex items-center justify-between flex-wrap gap-4 text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-4">
                              {order.shipments && order.shipments[0] && (
                                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200">
                                  <Truck size={14} /> Takip No: <strong className="font-mono">{order.shipments[0].trackingNumber}</strong>
                                </span>
                              )}
                            </div>

                            <div className="text-right font-mono">
                              <span className="text-slate-500 font-sans font-medium mr-2">Genel Toplam (KDV Dahil):</span>
                              <span className="text-base font-black text-slate-900">
                                {Number(order.grandTotal).toLocaleString('tr-TR')} {order.currency}
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                3. HIZLI SİPARİŞ FİŞİ (QUICK SKU ORDER MATRIX)
               ======================================================== */}
            {activeTab === 'quickOrder' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Zap size={20} className="text-amber-500 fill-amber-500" />
                      Hızlı Parça Sipariş Fişi (SKU Matrisi)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Katalogda aramadan doğrudan OEM parça kodlarını yazarak çoklu sipariş oluşturun.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet size={15} /> Toplu Kod Yapıştır
                  </button>
                </div>

                {/* Dinamik Sipariş Satırları */}
                <div className="space-y-3">
                  <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-mono font-bold text-slate-400 px-3">
                    <div className="col-span-4">OEM Parça Kodu / Ara</div>
                    <div className="col-span-4">Parça Adı</div>
                    <div className="col-span-2">Adet</div>
                    <div className="col-span-2 text-right">Net Fiyat</div>
                  </div>

                  {quickRows.map((row, idx) => (
                    <div key={row.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                      
                      {/* SKU Input */}
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={row.sku}
                          onChange={(e) => handleSearchRowSku(idx, e.target.value)}
                          placeholder="Örn: 10021972"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-pcb-700 uppercase"
                        />
                      </div>

                      {/* Parça Adı */}
                      <div className="sm:col-span-4 font-bold text-slate-700 truncate">
                        {row.name || <span className="text-slate-400 font-normal italic">Kodu giriniz</span>}
                      </div>

                      {/* Adet */}
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => {
                            const updated = [...quickRows];
                            updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                            setQuickRows(updated);
                          }}
                          className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-black text-slate-900 text-center"
                        />
                      </div>

                      {/* Tutar & Sil */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 font-mono font-black text-slate-900">
                        <span>{(row.price * row.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        <button
                          onClick={() => setQuickRows(quickRows.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Butonlar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setQuickRows([...quickRows, { id: String(Date.now()), sku: '', name: '', quantity: 1, price: 0 }])}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus size={15} /> + Yeni Satır Ekle
                  </button>

                  <button
                    onClick={handleAddQuickRowsToCart}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-pcb-900 text-white font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center active:scale-95"
                  >
                    <ShoppingCart size={16} /> Tüm Fişi Sepete Ekle &amp; Siparişi Onayla
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================
                4. CARİ HESABIM & EKSTRE (B2B)
               ======================================================== */}
            {activeTab === 'currentAccount' && isB2B && cariAccount && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Cari Hesap Ekstresi</h2>
                    <p className="text-xs text-slate-500">Borç, sipariş ve tahsilat hareketlerinizin resmi dökümü</p>
                  </div>

                  <button
                    onClick={() => { setPayAmount(String(cariAccount.currentBalance)); setShowPayModal(true); }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <CreditCard size={16} /> Sanal POS ile Cari Borç Öde
                  </button>
                </div>

                {/* Bakiye Özeti */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block font-sans font-bold">Tanımlı Limit:</span>
                    <strong className="text-base text-slate-900 font-black">{cariAccount.creditLimit.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans font-bold">Borç Bakiyesi:</span>
                    <strong className="text-base text-rose-600 font-black">{cariAccount.currentBalance.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans font-bold">Kullanılabilir Limit:</span>
                    <strong className="text-base text-emerald-600 font-black">{cariAccount.availableLimit.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                </div>

                {/* Filtreleme */}
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() => setCariFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${cariFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Tüm Hareketler
                  </button>
                  <button
                    onClick={() => setCariFilter('DEBIT')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${cariFilter === 'DEBIT' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Yalnızca Borçlar (Siparişler)
                  </button>
                  <button
                    onClick={() => setCariFilter('CREDIT')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${cariFilter === 'CREDIT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Yalnızca Tahsilatlar
                  </button>
                </div>

                {/* Hareketler Defteri */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase font-mono">
                        <th className="p-3">Tarih</th>
                        <th className="p-3">İşlem Açıklaması</th>
                        <th className="p-3">Tür</th>
                        <th className="p-3 text-right">Tutar</th>
                        <th className="p-3 text-right">Kalan Bakiye</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {cariAccount.transactions
                        .filter((t: any) => cariFilter === 'ALL' || (cariFilter === 'DEBIT' && t.type === 'DEBIT') || (cariFilter === 'CREDIT' && t.type === 'CREDIT'))
                        .map((t: any) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500 font-mono">{new Date(t.createdAt).toLocaleString('tr-TR')}</td>
                            <td className="p-3 font-bold text-slate-800">{t.note || (t.orderNo ? `Sipariş #${t.orderNo}` : 'Cari Hareket')}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${t.type === 'DEBIT' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {t.type === 'DEBIT' ? 'BORÇ' : 'TAHSİLAT'}
                              </span>
                            </td>
                            <td className={`p-3 text-right font-bold font-mono ${t.type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
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

            {/* ========================================================
                5. e-FATURALARIM
               ======================================================== */}
            {activeTab === 'invoices' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">
                  Resmi e-Fatura / e-Arşiv Belgeleri
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
                          <span className="font-black text-slate-800 font-mono">
                            {Number(order.grandTotal).toLocaleString('tr-TR')} {order.currency}
                          </span>
                          <button
                            onClick={() => setSelectedOrderForPrint(order)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-pcb-900 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                          >
                            <Printer size={13} /> Yazdır / İncele
                          </button>
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

      {/* TOPLU KOD YAPIŞTIRMA MODALI */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Toplu Parça Kodu Yapıştır</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Her satıra bir parça kodu ve adet yazın (Örn: <code>GARANTIIS-10021972 5</code>).
            </p>

            <textarea
              rows={6}
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder="10021972 5&#10;VAIL-7281 2&#10;BSH-9102 10"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:bg-white focus:outline-none focus:border-pcb-700"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                İptal
              </button>
              <button
                onClick={handleProcessBulkInput}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-pcb-900 text-white text-xs font-bold rounded-xl"
              >
                Listeyi Ayrıştır &amp; Doldur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFORMA / FİŞ YAZDIRMA MODALI */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Yazdırma Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">ERSA TİCARET</h3>
                <div className="text-xs text-slate-500 font-mono">ONLİNE YEDEK PARÇA SİPARİŞ &amp; TEKLİF FİŞİ</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-pcb-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Printer size={14} /> Yazdır
                </button>
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Fiş Detayları */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <strong className="text-slate-400 block font-mono">MÜŞTERİ BİLGİSİ:</strong>
                <div className="font-bold text-slate-900 mt-1">{user?.company?.legalName || user?.name}</div>
                <div className="text-slate-600">Vergi No: {user?.company?.taxNo || '-'}</div>
              </div>
              <div className="text-right font-mono">
                <strong className="text-slate-400 block">SİPARİŞ DETAYI:</strong>
                <div className="font-bold text-slate-900 mt-1">No: #{selectedOrderForPrint.orderNo}</div>
                <div className="text-slate-600">Tarih: {new Date(selectedOrderForPrint.createdAt).toLocaleDateString('tr-TR')}</div>
              </div>
            </div>

            {/* Kalemler Tablosu */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono font-bold text-slate-500">
                  <tr>
                    <th className="p-3">OEM / Parça</th>
                    <th className="p-3 text-center">Adet</th>
                    <th className="p-3 text-right">Birim Net</th>
                    <th className="p-3 text-right">KDV Dahil Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrderForPrint.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[10px] font-mono text-copper-600">{it.sku}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{it.quantity}</td>
                      <td className="p-3 text-right font-mono">{Number(it.unitNetExVat).toLocaleString('tr-TR')} ₺</td>
                      <td className="p-3 text-right font-mono font-black text-slate-900">{Number(it.lineGross).toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Toplam Bilgisi */}
            <div className="flex justify-end text-xs font-mono">
              <div className="w-64 space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between font-black text-sm pt-1 text-slate-900">
                  <span>Ödenecek Tutar:</span>
                  <span>{Number(selectedOrderForPrint.grandTotal).toLocaleString('tr-TR')} {selectedOrderForPrint.currency}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CARİ BORÇ ÖDEME POPUP MODALI */}
      {showPayModal && cariAccount && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Cari Hesaba Ödeme Yap</h3>
            <p className="text-xs text-slate-500">
              Sanal POS üzerinden istediğiniz tutarda ödeme yaparak cari borcunuzu anında kapatabilirsiniz.
            </p>

            <form onSubmit={handleInitCariPayment} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Mevcut Borç Bakiyesi</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-rose-600 font-mono">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:bg-white focus:outline-none focus:border-pcb-700 font-mono"
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
