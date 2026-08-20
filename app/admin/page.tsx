'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Building2,
  Tags,
  FileSpreadsheet,
  Settings,
  Plus,
  Edit,
  Trash2,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Search,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'rules' | 'products' | 'audit'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [priceRules, setPriceRules] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Yeni Fiyat Kuralı Ekleme Form State
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('GROUP_PERCENT');
  const [ruleGroupId, setRuleGroupId] = useState('GROUP_A');
  const [ruleDiscount, setRuleDiscount] = useState('15');
  const [rulePriority, setRulePriority] = useState('5');

  // Şirket Düzenleme State
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, compRes, ruleRes, prodRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard').then(r => r.json()),
        fetch('/api/v1/admin/companies').then(r => r.json()),
        fetch('/api/v1/admin/price-rules').then(r => r.json()),
        fetch('/api/v1/products?limit=50').then(r => r.json()),
      ]);

      setDashboardData(dashRes);
      if (compRes.companies) setCompanies(compRes.companies);
      if (ruleRes.rules) setPriceRules(ruleRes.rules);
      if (prodRes.items) setProducts(prodRes.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/giris');
      return;
    }
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, authLoading, router]);

  const handleUpdateCompany = async (companyId: string, status: string, creditLimit?: number) => {
    try {
      await fetch('/api/v1/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status, creditLimit }),
      });
      loadData();
      setEditingCompany(null);
    } catch (err) {
      alert('Şirket güncellenemedi');
    }
  };

  const handleCreatePriceRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/admin/price-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ruleName,
          type: ruleType,
          priority: parseInt(rulePriority),
          discountPercent: parseFloat(ruleDiscount),
        }),
      });
      setShowAddRuleModal(false);
      loadData();
    } catch (err) {
      alert('Fiyat kuralı eklenemedi');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        Admin Paneli Yükleniyor...
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
            E
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider">ERSA<span className="text-blue-500">ADMIN</span></h1>
            <div className="text-[10px] text-slate-400 font-bold uppercase">B2B Yönetim Merkezi</div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            <span>Kontrol Paneli</span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'companies' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Building2 size={18} />
              <span>B2B Bayiler &amp; Şirketler</span>
            </div>
            {metrics.pendingCompanies > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {metrics.pendingCompanies}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'rules' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Tags size={18} />
            <span>Fiyatlandırma Motoru</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Package size={18} />
            <span>Ürün &amp; Stok Yönetimi</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'audit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileSpreadsheet size={18} />
            <span>Audit Denetim Logları</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-colors text-xs font-bold"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* SAĞ ANA İÇERİK ALANI */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Üst Header */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shadow-sm">
          <div>
            <h2 className="text-base font-black text-white capitalize">
              {activeTab === 'overview' && 'Genel İstatistikler'}
              {activeTab === 'companies' && 'B2B Bayi ve Şirket Yönetimi'}
              {activeTab === 'rules' && 'B2B Fiyatlandırma Kuralları'}
              {activeTab === 'products' && 'Ürün Kataloğu & Stok'}
              {activeTab === 'audit' && 'Sistem Güvenlik & İşlem Logları'}
            </h2>
            <div className="text-[11px] text-slate-400">Ersa Ticaret B2B + B2C Hibrit Platformu</div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              Mağazaya Git
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                A
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-black text-white">{user?.name}</div>
                <div className="text-blue-400 text-[10px]">Sistem Yöneticisi</div>
              </div>
            </div>
          </div>
        </header>

        {/* İÇERİK SEKMELERİ */}
        <div className="p-8 space-y-8">
          
          {/* 1. OVERVIEW (GENEL BAKIŞ) */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Metrik Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center font-bold">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold">Toplam Aktif Ürün</div>
                    <div className="text-2xl font-black text-white">{metrics.totalProducts || 156}</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center font-bold">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold">Kayıtlı B2B Şirket</div>
                    <div className="text-2xl font-black text-white">{metrics.totalCompanies || 2}</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center font-bold">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold">Bekleyen Bayi Başvurusu</div>
                    <div className="text-2xl font-black text-amber-400">{metrics.pendingCompanies || 0}</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center font-bold">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold">Toplam Ciro</div>
                    <div className="text-2xl font-black text-white">{(metrics.totalRevenue || 0).toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>

              </div>

              {/* Son Siparişler Tablosu */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-black text-white text-base">Son Gelen Siparişler</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase">
                        <th className="p-4">Sipariş No</th>
                        <th className="p-4">Alıcı / Firma</th>
                        <th className="p-4">Tür</th>
                        <th className="p-4">Ödeme Yöntemi</th>
                        <th className="p-4">Durum</th>
                        <th className="p-4 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {dashboardData?.recentOrders?.map((o: any) => (
                        <tr key={o.id} className="hover:bg-slate-800/50">
                          <td className="p-4 font-mono font-bold text-blue-400">#{o.orderNo}</td>
                          <td className="p-4 font-bold text-white">{o.buyer}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${o.buyerType === 'B2B' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                              {o.buyerType}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-medium">
                            {o.paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Hesap' : 'Sanal POS'}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-black uppercase text-[10px]">
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-black text-white">
                            {o.grandTotal.toLocaleString('tr-TR')} {o.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. B2B ŞİRKETLER & BAYİLER */}
          {activeTab === 'companies' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden space-y-6">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-base">B2B Bayi ve Şirket Listesi</h3>
                  <p className="text-xs text-slate-400">Bayilik onayları, iskonto grupları ve cari limit yönetimi</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-4">Firma Ünvanı</th>
                      <th className="p-4">Vergi No / VD</th>
                      <th className="p-4">Müşteri Grubu</th>
                      <th className="p-4">Cari Limit</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {companies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/50">
                        <td className="p-4">
                          <div className="font-black text-white">{c.legalName}</div>
                          <div className="text-slate-400 text-[11px]">{c.email} • {c.phone}</div>
                        </td>
                        <td className="p-4 font-mono text-slate-300">
                          {c.taxNo || '-'} / {c.taxOffice || '-'}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-bold">
                            {c.customerGroup?.name || 'Grup Atanmamış'}
                          </span>
                        </td>
                        <td className="p-4 font-black text-emerald-400">
                          {c.creditLimit.toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase ${c.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {c.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateCompany(c.id, 'APPROVED', 50000)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                              >
                                Onayla &amp; 50k Limit Ver
                              </button>
                            )}
                            <button
                              onClick={() => { setEditingCompany(c); setNewCreditLimit(String(c.creditLimit)); }}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                              title="Limiti Düzenle"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. FİYATLANDIRMA KURALLARI (PRICING ENGINE) */}
          {activeTab === 'rules' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden space-y-6">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-base">B2B Fiyatlandırma Kuralları</h3>
                  <p className="text-xs text-slate-400">Öncelik sıralamasına (1-7) göre çalışan dinamik iskonto motoru</p>
                </div>
                <button
                  onClick={() => setShowAddRuleModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={16} /> Yeni Fiyat Kuralı Ekle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-4">Öncelik</th>
                      <th className="p-4">Kural Adı</th>
                      <th className="p-4">Kural Türü</th>
                      <th className="p-4">Müşteri Grubu / Firma</th>
                      <th className="p-4 text-right">İndirim / Özel Fiyat</th>
                      <th className="p-4">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {priceRules.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/50">
                        <td className="p-4">
                          <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-black">
                            {r.priority}
                          </span>
                        </td>
                        <td className="p-4 font-black text-white">{r.name}</td>
                        <td className="p-4 font-mono text-slate-400">{r.type}</td>
                        <td className="p-4 text-slate-300 font-medium">
                          {r.customerGroup?.name || r.company?.legalName || 'Genel'}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-400">
                          {r.specialPrice ? `Net ${r.specialPrice} ₺` : `%${r.discountPercent} İndirim`}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-black uppercase">
                            AKTİF
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. AUDIT LOGLARI */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden space-y-6">
              <div className="p-6 border-b border-slate-800">
                <h3 className="font-black text-white text-base">Güvenlik ve İşlem Denetim Kayıtları</h3>
                <p className="text-xs text-slate-400">Fiyat değişiklikleri, limit güncellemeleri ve kritik hareketlerin logları</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-4">Zaman</th>
                      <th className="p-4">İşlemi Yapan</th>
                      <th className="p-4">Eylem</th>
                      <th className="p-4">Varlık</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {dashboardData?.recentLogs?.map((l: any) => (
                      <tr key={l.id} className="hover:bg-slate-800/50">
                        <td className="p-4 text-slate-400">{new Date(l.createdAt).toLocaleString('tr-TR')}</td>
                        <td className="p-4 font-bold text-white">{l.actor}</td>
                        <td className="p-4 text-blue-400 font-black">{l.action}</td>
                        <td className="p-4 text-slate-300">{l.entityType} ({l.entityId})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ŞİRKET LİMİT DÜZENLEME MODALI */}
      {editingCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 shadow-2xl">
            <h3 className="text-base font-black text-white mb-1">Cari Kredi Limitini Güncelle</h3>
            <p className="text-xs text-slate-400 mb-6">{editingCompany.legalName}</p>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1">Yeni Cari Limit (TL)</label>
                <input
                  type="number"
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-base"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCompany(editingCompany.id, editingCompany.status, parseFloat(newCreditLimit))}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl"
                >
                  Limiti Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YENİ FİYAT KURALI MODALI */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 shadow-2xl">
            <h3 className="text-base font-black text-white mb-4">Yeni B2B Fiyat Kuralı Ekle</h3>

            <form onSubmit={handleCreatePriceRule} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1">Kural Adı</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Örn: Toptancılar %20 İndirim"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Kural Türü</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="GROUP_PERCENT">Müşteri Grubu Genel İndirimi (%)</option>
                  <option value="GROUP_CATEGORY">Grup + Kategori İndirimi</option>
                  <option value="GROUP_BRAND">Grup + Marka İndirimi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">İndirim Yüzdesi (%)</label>
                  <input
                    type="number"
                    value={ruleDiscount}
                    onChange={(e) => setRuleDiscount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Öncelik (1-7)</label>
                  <input
                    type="number"
                    value={rulePriority}
                    onChange={(e) => setRulePriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl"
                >
                  Kuralı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}