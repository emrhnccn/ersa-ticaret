'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'companies' | 'rules' | 'products' | 'audit'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [priceRules, setPriceRules] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ÜRÜN YÖNETİMİ STATE'LERİ
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [adminBrands, setAdminBrands] = useState<any[]>([]);
  const [adminSuppliers, setAdminSuppliers] = useState<any[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [productLoading, setProductLoading] = useState(false);

  // Ürün Düzenleme & Ekleme Modal State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    costPrice: '',
    salePrice: '',
    currency: 'TRY',
    stockQty: '0',
    minOrderQty: '1',
    vatRate: '20',
    unit: 'ADET',
    status: 'ACTIVE',
    categoryId: '',
    brandId: '',
    supplierId: '',
    imageUrl: '',
  });

  // B2B Fiyat Kuralı Yönetim State'leri
  const [ruleLookup, setRuleLookup] = useState<{
    companies: any[];
    customerGroups: any[];
    categories: any[];
    brands: any[];
    products: any[];
  }>({
    companies: [],
    customerGroups: [],
    categories: [],
    brands: [],
    products: [],
  });
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleScopeFilter, setRuleScopeFilter] = useState('ALL');
  const [modalProductSearch, setModalProductSearch] = useState('');
  const [ruleForm, setRuleForm] = useState({
    id: '',
    name: '',
    type: 'CUSTOMER_CATEGORY',
    companyId: '',
    customerGroupId: '',
    categoryId: '',
    brandId: '',
    productId: '',
    valueType: 'PERCENT', // 'PERCENT' | 'SPECIAL_PRICE'
    discountPercent: '20',
    specialPrice: '',
    priority: '2',
    minQty: '1',
    validFrom: '',
    validTo: '',
    active: true,
  });

  // Şirket Düzenleme State
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, compRes, ruleRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard').then(r => r.json()),
        fetch('/api/v1/admin/companies').then(r => r.json()),
        fetch('/api/v1/admin/price-rules').then(r => r.json()),
      ]);

      setDashboardData(dashRes);
      if (compRes.companies) setCompanies(compRes.companies);
      if (ruleRes.rules) setPriceRules(ruleRes.rules);
      if (ruleRes.lookup) setRuleLookup(ruleRes.lookup);
    } catch (e) {
      console.error('Veri yükleme hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(productPage),
        limit: '25',
      });
      if (productSearch.trim()) params.set('search', productSearch.trim());
      if (categoryFilter !== 'ALL') params.set('categoryId', categoryFilter);
      if (brandFilter !== 'ALL') params.set('brandId', brandFilter);
      if (stockFilter !== 'ALL') params.set('stockStatus', stockFilter);

      const res = await fetch(`/api/v1/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAdminProducts(data.products || []);
        setProductTotal(data.total || 0);
        setProductTotalPages(data.totalPages || 1);
        if (data.categories) setAdminCategories(data.categories);
        if (data.brands) setAdminBrands(data.brands);
        if (data.suppliers) setAdminSuppliers(data.suppliers);
      }
    } catch (err) {
      console.error('Ürünler yüklenirken hata:', err);
    } finally {
      setProductLoading(false);
    }
  }, [productPage, productSearch, categoryFilter, brandFilter, stockFilter]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/giris');
      return;
    }
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (user && isAdmin && activeTab === 'products') {
      loadAdminProducts();
    }
  }, [user, isAdmin, activeTab, loadAdminProducts]);

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm('Bu cari siparişi onaylamak istiyor musunuz?\n\n• Cari hesaba borç işlenecektir.\n• e-Fatura ve kargo süreci başlatılacaktır.\n• Müşteriye ve Ersa yetkilisine WhatsApp/E-posta bildirimi gidecektir.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ ' + data.message);
        loadData();
        setSelectedOrder(null);
      } else {
        alert('❌ Onaylama hatası: ' + data.error);
      }
    } catch (e: any) {
      alert('İstek hatası: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('Siparişi reddetme sebebi:', 'Cari limit aşımı / Stok yetersizliği');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('ℹ️ ' + data.message);
        loadData();
        setSelectedOrder(null);
      } else {
        alert('❌ Reddetme hatası: ' + data.error);
      }
    } catch (e: any) {
      alert('İstek hatası: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

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

  // B2B FİYAT KURALI İŞLEMLERİ
  const handleRuleTypeChange = (newType: string) => {
    let recPriority = '5';
    if (newType === 'CUSTOMER_PRODUCT') recPriority = '1';
    else if (newType === 'CUSTOMER_CATEGORY') recPriority = '2';
    else if (newType === 'CUSTOMER_BRAND') recPriority = '3';
    else if (newType === 'CUSTOMER_PERCENT') recPriority = '4';
    else if (newType === 'GROUP_PRODUCT' || newType === 'QTY_TIER') recPriority = '5';
    else if (newType === 'GROUP_CATEGORY' || newType === 'GROUP_BRAND') recPriority = '6';
    else if (newType === 'GROUP_PERCENT' || newType === 'CATEGORY_CAMPAIGN' || newType === 'BRAND_CAMPAIGN') recPriority = '7';

    setRuleForm(prev => ({
      ...prev,
      type: newType,
      priority: recPriority,
    }));
  };

  const openCreateRuleModal = () => {
    setEditingRule(null);
    setModalProductSearch('');
    setRuleForm({
      id: '',
      name: '',
      type: 'CUSTOMER_CATEGORY',
      companyId: ruleLookup.companies[0]?.id || companies[0]?.id || '',
      customerGroupId: ruleLookup.customerGroups[0]?.id || '',
      categoryId: ruleLookup.categories[0]?.id || '',
      brandId: ruleLookup.brands[0]?.id || '',
      productId: ruleLookup.products[0]?.id || '',
      valueType: 'PERCENT',
      discountPercent: '20',
      specialPrice: '',
      priority: '2',
      minQty: '1',
      validFrom: '',
      validTo: '',
      active: true,
    });
    setShowRuleModal(true);
  };

  const openEditRuleModal = (rule: any) => {
    setEditingRule(rule);
    setModalProductSearch('');
    setRuleForm({
      id: rule.id,
      name: rule.name || '',
      type: rule.type || 'GROUP_PERCENT',
      companyId: rule.companyId || rule.company?.id || '',
      customerGroupId: rule.customerGroupId || rule.customerGroup?.id || '',
      categoryId: rule.categoryId || rule.category?.id || '',
      brandId: rule.brandId || rule.brand?.id || '',
      productId: rule.productId || rule.product?.id || '',
      valueType: rule.specialPrice != null && Number(rule.specialPrice) > 0 ? 'SPECIAL_PRICE' : 'PERCENT',
      discountPercent: rule.discountPercent != null ? String(rule.discountPercent) : '',
      specialPrice: rule.specialPrice != null ? String(rule.specialPrice) : '',
      priority: String(rule.priority || 5),
      minQty: String(rule.minQty || 1),
      validFrom: rule.validFrom ? new Date(rule.validFrom).toISOString().split('T')[0] : '',
      validTo: rule.validTo ? new Date(rule.validTo).toISOString().split('T')[0] : '',
      active: rule.active !== undefined ? rule.active : true,
    });
    setShowRuleModal(true);
  };

  const handleSavePriceRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.name.trim()) {
      alert('Lütfen kural adı giriniz.');
      return;
    }

    const payload = {
      id: editingRule ? editingRule.id : undefined,
      name: ruleForm.name.trim(),
      type: ruleForm.type,
      priority: parseInt(ruleForm.priority, 10) || 5,
      companyId: ruleForm.companyId || null,
      customerGroupId: ruleForm.customerGroupId || null,
      categoryId: ruleForm.categoryId || null,
      brandId: ruleForm.brandId || null,
      productId: ruleForm.productId || null,
      discountPercent: ruleForm.valueType === 'PERCENT' && ruleForm.discountPercent ? parseFloat(ruleForm.discountPercent) : null,
      specialPrice: ruleForm.valueType === 'SPECIAL_PRICE' && ruleForm.specialPrice ? parseFloat(ruleForm.specialPrice) : null,
      minQty: ruleForm.minQty ? parseInt(ruleForm.minQty, 10) : null,
      validFrom: ruleForm.validFrom || null,
      validTo: ruleForm.validTo || null,
      active: ruleForm.active,
    };

    try {
      const res = await fetch('/api/v1/admin/price-rules', {
        method: editingRule ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowRuleModal(false);
        setEditingRule(null);
        await loadData();
      } else {
        alert('Hata: ' + (data.error || 'İşlem gerçekleştirilemedi'));
      }
    } catch (err: any) {
      alert('İstek hatası: ' + err.message);
    }
  };

  const handleToggleRuleActive = async (rule: any) => {
    const newActive = !rule.active;
    // Optimistic UI update
    setPriceRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: newActive } : r));
    try {
      const res = await fetch('/api/v1/admin/price-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, active: newActive }),
      });
      const data = await res.json();
      if (!data.success) {
        setPriceRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !newActive } : r));
        alert('Kural durumu güncellenemedi');
      }
    } catch {
      setPriceRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !newActive } : r));
      alert('Bağlantı hatası');
    }
  };

  const handleDeletePriceRule = async (ruleId: string, ruleName: string) => {
    if (!confirm(`"${ruleName}" fiyatlandırma kuralını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve kural anında pasifleşecektir.`)) return;

    // Optimistic UI update
    setPriceRules(prev => prev.filter(r => r.id !== ruleId));
    try {
      const res = await fetch(`/api/v1/admin/price-rules?id=${ruleId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        alert('Kural silinemedi: ' + (data.error || 'Bilinmeyen hata'));
        loadData();
      }
    } catch {
      alert('Bağlantı hatası');
      loadData();
    }
  };

  // ÜRÜN DÜZENLEME / EKLEME MODALINI AÇ
  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        costPrice: product.costPrice != null ? String(product.costPrice) : '',
        salePrice: product.salePrice != null ? String(product.salePrice) : '',
        currency: product.currency || 'TRY',
        stockQty: String(product.stockQty ?? 0),
        minOrderQty: String(product.minOrderQty ?? 1),
        vatRate: String(product.vatRate ?? 20),
        unit: product.unit || 'ADET',
        status: product.status || 'ACTIVE',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        supplierId: product.supplierId || '',
        imageUrl: product.imageUrl && product.imageUrl !== '/placeholder-spare.png' ? product.imageUrl : '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        costPrice: '',
        salePrice: '',
        currency: 'TRY',
        stockQty: '10',
        minOrderQty: '1',
        vatRate: '20',
        unit: 'ADET',
        status: 'ACTIVE',
        categoryId: '',
        brandId: '',
        supplierId: '',
        imageUrl: '',
      });
    }
    setShowProductModal(true);
  };

  // ÜRÜN KAYDET (CREATE / UPDATE)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload: any = {
        name: productForm.name,
        sku: productForm.sku,
        barcode: productForm.barcode || null,
        description: productForm.description || null,
        currency: productForm.currency,
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : null,
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
        stockQty: parseFloat(productForm.stockQty || '0'),
        minOrderQty: parseFloat(productForm.minOrderQty || '1'),
        vatRate: parseFloat(productForm.vatRate || '20'),
        unit: productForm.unit,
        status: productForm.status,
        categoryId: productForm.categoryId || null,
        brandId: productForm.brandId || null,
        supplierId: productForm.supplierId || null,
        imageUrl: productForm.imageUrl || null,
      };

      let res;
      if (editingProduct?.id) {
        res = await fetch(`/api/v1/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/v1/admin/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        alert('✅ ' + (editingProduct ? 'Ürün başarıyla güncellendi.' : 'Yeni ürün başarıyla eklendi.'));
        setShowProductModal(false);
        setEditingProduct(null);
        loadAdminProducts();
        loadData();
      } else {
        alert('❌ Kayıt hatası: ' + data.error);
      }
    } catch (err: any) {
      alert('İşlem hatası: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ÜRÜN SİL
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`"${productName}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    try {
      const res = await fetch(`/api/v1/admin/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('✅ Ürün silindi.');
        loadAdminProducts();
        loadData();
      } else {
        alert('❌ Silme hatası: ' + data.error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-400">Yönetim Paneli Yükleniyor...</span>
        </div>
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
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} />
              <span>Siparişler &amp; Cari Onay</span>
            </div>
            {metrics.pendingOrders > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {metrics.pendingOrders} Onay
              </span>
            )}
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
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} />
              <span>Ürün &amp; Stok Yönetimi</span>
            </div>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded">
              {metrics.totalProducts || productTotal || '3.6k+'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'rules' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Tags size={18} />
            <span>Fiyatlandırma Motoru</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'audit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileSpreadsheet size={18} />
            <span>Audit Denetim Logları</span>
          </button>

          <Link
            href="/admin/entegrasyonlar"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30"
          >
            <div className="flex items-center gap-3">
              <span>🔄</span>
              <span>Tedarikçi Entegrasyonları</span>
            </div>
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
              3 Canlı
            </span>
          </Link>
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
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white capitalize">
              {activeTab === 'overview' && 'Genel Bakış & Metrikler'}
              {activeTab === 'orders' && 'Sipariş Yönetimi & Cari Onay'}
              {activeTab === 'companies' && 'B2B Bayi Hesapları'}
              {activeTab === 'products' && 'Ürün Kataloğu & Stok Düzenleme'}
              {activeTab === 'rules' && 'Fiyatlandırma & İskonto Motoru'}
              {activeTab === 'audit' && 'Sistem & Güvenlik Logları'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
            >
              🌐 Siteyi Görüntüle
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-black text-xs">
                A
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-white">{user?.name || 'Yönetici'}</div>
                <div className="text-[10px] text-slate-400">admin@ersaticaret.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* Sekme İçerikleri */}
        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* 1. GENEL BAKIŞ (OVERVIEW) */}
          {activeTab === 'overview' && (
            <>
              {/* Metrik Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bekleyen Cari Onay</span>
                    <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">⏳</span>
                  </div>
                  <div className="text-3xl font-black text-white">{metrics.pendingOrders || 0}</div>
                  <p className="text-xs text-amber-400 mt-2 font-medium">Onay bekleyen B2B cari sipariş</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Katalogdaki Ürünler</span>
                    <span className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl"><Package size={20} /></span>
                  </div>
                  <div className="text-3xl font-black text-white">{metrics.totalProducts?.toLocaleString('tr-TR') || '3.664'}</div>
                  <p className="text-xs text-slate-400 mt-2">Girdap, Garantiis, Kombisan &amp; Özel</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif B2B Bayiler</span>
                    <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl"><Building2 size={20} /></span>
                  </div>
                  <div className="text-3xl font-black text-white">{metrics.totalCompanies || 0}</div>
                  <p className="text-xs text-emerald-400 mt-2">A &amp; B grubu kurumsal hesap</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Sipariş Hacmi</span>
                    <span className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl"><TrendingUp size={20} /></span>
                  </div>
                  <div className="text-2xl font-black text-white">{metrics.totalRevenue?.toLocaleString('tr-TR') || 0} ₺</div>
                  <p className="text-xs text-slate-400 mt-2">{metrics.totalOrders || 0} adet sipariş toplamı</p>
                </div>
              </div>

              {/* Son Siparişler ve Hızlı İşlemler */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-white text-base">Son Sipariş Hareketleri</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-blue-400 hover:text-blue-300 font-bold">
                      Tümünü Gör →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dashboardData?.recentOrders?.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs font-bold">Henüz sipariş kaydı bulunmuyor.</div>
                    ) : (
                      dashboardData?.recentOrders?.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-xs">#{order.orderNo}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                order.status === 'PENDING_APPROVAL' ? 'bg-amber-500/20 text-amber-400' :
                                order.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {order.status === 'PENDING_APPROVAL' ? 'Cari Onay Bekliyor' : order.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">{order.buyer} • {order.itemCount} Kalem Ürün</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-emerald-400 text-sm">
                              {order.grandTotal.toLocaleString('tr-TR')} {order.currency}
                            </div>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-[11px] text-blue-400 hover:text-blue-300 font-bold mt-0.5"
                            >
                              İncele &amp; Onayla →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Hızlı Kısayollar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="font-black text-white text-base">Hızlı İşlemler</h3>
                  
                  <button
                    onClick={() => openProductModal()}
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-left font-bold text-xs flex items-center justify-between transition shadow-lg shadow-blue-600/20"
                  >
                    <div>
                      <div className="font-black text-sm">📦 Yeni Ürün Ekle</div>
                      <div className="text-[11px] text-blue-100 font-normal">Fiyat, stok ve görsel tanımla</div>
                    </div>
                    <span>→</span>
                  </button>

                  <Link
                    href="/admin/entegrasyonlar"
                    className="w-full p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white rounded-2xl text-left font-bold text-xs flex items-center justify-between transition block"
                  >
                    <div>
                      <div className="font-black text-sm text-amber-400">🔄 Tedarikçi Senkronizasyonu</div>
                      <div className="text-[11px] text-slate-400 font-normal">Girdap, Garantiis, Kombisan kataloglarını çek</div>
                    </div>
                    <span className="text-slate-400">→</span>
                  </Link>

                  <button
                    onClick={() => { setActiveTab('rules'); openCreateRuleModal(); }}
                    className="w-full p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white rounded-2xl text-left font-bold text-xs flex items-center justify-between transition"
                  >
                    <div>
                      <div className="font-black text-sm text-emerald-400">🏷️ B2B İskonto Kuralı Tanımla</div>
                      <div className="text-[11px] text-slate-400 font-normal">Firma, kategori, marka veya grup bazlı dinamik iskonto</div>
                    </div>
                    <span className="text-slate-400">→</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 2. SİPARİŞ YÖNETİMİ & CARİ ONAY */}
          {activeTab === 'orders' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden space-y-6">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-base">Tüm Siparişler &amp; Cari Onay Listesi</h3>
                  <p className="text-xs text-slate-400">Cari hesapla verilen siparişleri onaylayabilir veya reddedebilirsiniz.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-4">Sipariş No</th>
                      <th className="p-4">Müşteri / Şirket</th>
                      <th className="p-4">Ödeme Yöntemi</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4 text-right">Tutar</th>
                      <th className="p-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {dashboardData?.recentOrders?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">Sipariş bulunamadı.</td>
                      </tr>
                    ) : (
                      dashboardData?.recentOrders?.map((o: any) => (
                        <tr key={o.id} className="hover:bg-slate-800/50">
                          <td className="p-4 font-mono font-bold text-white">#{o.orderNo}</td>
                          <td className="p-4">
                            <div className="font-bold text-white">{o.buyer}</div>
                            <div className="text-slate-400 text-[11px]">{o.buyerPhone || o.buyerEmail}</div>
                          </td>
                          <td className="p-4 font-medium">
                            {o.paymentMethod === 'CURRENT_ACCOUNT' ? (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">
                                📑 Cari Hesap
                              </span>
                            ) : (
                              <span>💳 Sanal POS</span>
                            )}
                          </td>
                          <td className="p-4">
                            {o.status === 'PENDING_APPROVAL' ? (
                              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-black uppercase text-[10px] animate-pulse flex items-center gap-1 w-fit">
                                <span>⏳</span> Cari Onay Bekliyor
                              </span>
                            ) : o.status === 'PROCESSING' ? (
                              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-black uppercase text-[10px]">
                                📦 Hazırlanıyor
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-black uppercase text-[10px]">
                                ✅ {o.status}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-black text-white">
                            {o.grandTotal.toLocaleString('tr-TR')} {o.currency}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {o.status === 'PENDING_APPROVAL' && (
                                <>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleApproveOrder(o.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
                                  >
                                    ✓ Onayla
                                  </button>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleRejectOrder(o.id)}
                                    className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition"
                                  >
                                    ✕ Reddet
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold"
                              >
                                👁️ Detay
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. B2B ŞİRKETLER & BAYİLER */}
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

          {/* 4. ÜRÜN & STOK YÖNETİMİ (PRODUCTS & INVENTORY) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Filtre ve Arama Çubuğu */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-black text-white text-base flex items-center gap-2">
                      <Package className="text-blue-500" size={20} />
                      Ürün Kataloğu ve Stok Yönetimi
                    </h3>
                    <p className="text-xs text-slate-400">
                      Toplam <span className="font-bold text-white">{productTotal.toLocaleString('tr-TR')}</span> kayıtlı ürün listeleniyor
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => openProductModal()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
                    >
                      <Plus size={16} /> Yeni Ürün Ekle
                    </button>
                    <button
                      onClick={() => loadAdminProducts()}
                      disabled={productLoading}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                      title="Yenile"
                    >
                      <RefreshCw size={16} className={productLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {/* Filtreler */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Ürün adı, SKU veya barkod ara..."
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setProductPage(1); }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-blue-500 outline-none"
                    >
                      <option value="ALL">Tüm Kategoriler ({adminCategories.length})</option>
                      {adminCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={brandFilter}
                      onChange={(e) => { setBrandFilter(e.target.value); setProductPage(1); }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-blue-500 outline-none"
                    >
                      <option value="ALL">Tüm Markalar ({adminBrands.length})</option>
                      {adminBrands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={stockFilter}
                      onChange={(e) => { setStockFilter(e.target.value); setProductPage(1); }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-blue-500 outline-none"
                    >
                      <option value="ALL">Tüm Stok Durumları</option>
                      <option value="in_stock">Yalnızca Stokta Olanlar (Stok &gt; 0)</option>
                      <option value="out_of_stock">Tükenenler (Stok = 0)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ürün Tablosu */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase">
                        <th className="p-4">Ürün</th>
                        <th className="p-4">SKU / Barkod</th>
                        <th className="p-4">Kategori &amp; Marka</th>
                        <th className="p-4">Stok Durumu</th>
                        <th className="p-4 text-right">Maliyet / Satış Fiyatı</th>
                        <th className="p-4">Durum</th>
                        <th className="p-4 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {productLoading ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw size={16} className="animate-spin text-blue-500" />
                              <span>Ürünler yükleniyor...</span>
                            </div>
                          </td>
                        </tr>
                      ) : adminProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-500">
                            Arama kriterine uygun ürün bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        adminProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 relative">
                                  {p.imageUrl ? (
                                    <img
                                      src={p.imageUrl}
                                      alt={p.name}
                                      className="w-full h-full object-contain"
                                      onError={(e: any) => { e.target.src = 'https://placehold.co/100x100?text=Ersa'; }}
                                    />
                                  ) : (
                                    <Package size={20} className="text-slate-600" />
                                  )}
                                </div>
                                <div className="max-w-xs">
                                  <div className="font-black text-white text-xs truncate" title={p.name}>
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono truncate">
                                    {p.supplier ? `Tedarikçi: ${p.supplier.name}` : 'Özel Ürün'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono">
                              <div className="font-bold text-slate-200">{p.sku}</div>
                              {p.barcode && <div className="text-[10px] text-slate-500">{p.barcode}</div>}
                            </td>
                            <td className="p-4">
                              <div className="text-slate-300 font-medium">{p.category?.name || '-'}</div>
                              <div className="text-[10px] text-slate-500 font-bold">{p.brand?.name || '-'}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] inline-flex items-center gap-1 ${
                                p.stockQty > 5 ? 'bg-emerald-500/20 text-emerald-400' :
                                p.stockQty > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {p.stockQty > 0 ? `📦 ${p.stockQty} ${p.unit}` : 'Tükendi'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-black text-emerald-400 text-sm">
                                {p.salePrice != null ? `${Number(p.salePrice).toLocaleString('tr-TR')} ${p.currency}` : 'Belirtilmedi'}
                              </div>
                              {p.costPrice != null && (
                                <div className="text-[10px] text-slate-500">
                                  Maliyet: {Number(p.costPrice).toLocaleString('tr-TR')} {p.currency}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                p.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {p.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openProductModal(p)}
                                  className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition"
                                  title="Ürünü Düzenle"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                                  title="Ürünü Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sayfalama (Pagination) */}
                <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs">
                  <div className="text-slate-400 font-medium">
                    Sayfa <span className="text-white font-bold">{productPage}</span> / {productTotalPages} (Toplam {productTotal} ürün)
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={productPage <= 1 || productLoading}
                      onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                    >
                      ← Önceki
                    </button>
                    <button
                      disabled={productPage >= productTotalPages || productLoading}
                      onClick={() => setProductPage(prev => Math.min(productTotalPages, prev + 1))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. FİYATLANDIRMA KURALLARI (PRICING ENGINE) */}
          {activeTab === 'rules' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden space-y-6">
              <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-base">B2B Fiyatlandırma Kuralları</h3>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-black uppercase">
                      {priceRules.length} Kural Tanımlı
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Öncelik sıralamasına (1-7) göre çalışan dinamik iskonto ve özel fiyat motoru
                  </p>
                </div>
                <button
                  onClick={openCreateRuleModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                  <Plus size={16} /> Yeni B2B Fiyat Kuralı Ekle
                </button>
              </div>

              {/* Öncelik Kılavuzu & Bilgilendirme Banner'ı */}
              <div className="px-6">
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" /> Dinamik İskonto Motoru Öncelik Hiyerarşisi (1 → 7)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Sistem fiyat hesaplarken en düşük numaralı (1) ilk eşleşen kuralı uygular
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px] font-bold">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
                      <div className="font-black text-rose-400">1. En Yüksek</div>
                      <div className="text-[10px] text-slate-300 font-medium">Firma + Ürün Fiyatı</div>
                    </div>
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
                      <div className="font-black text-amber-400">2. Yüksek</div>
                      <div className="text-[10px] text-slate-300 font-medium">Firma + Kategori</div>
                    </div>
                    <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300">
                      <div className="font-black text-purple-400">3. Orta-Üst</div>
                      <div className="text-[10px] text-slate-300 font-medium">Firma + Marka</div>
                    </div>
                    <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300">
                      <div className="font-black text-blue-400">4. Firma Cari</div>
                      <div className="text-[10px] text-slate-300 font-medium">Firma Genel İskonto</div>
                    </div>
                    <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300">
                      <div className="font-black text-cyan-400">5. Grup Özel</div>
                      <div className="text-[10px] text-slate-300 font-medium">Grup+Ürün / Adet</div>
                    </div>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300">
                      <div className="font-black text-emerald-400">6. Grup Kategori</div>
                      <div className="text-[10px] text-slate-300 font-medium">Grup+Kategori/Marka</div>
                    </div>
                    <div className="p-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300">
                      <div className="font-black text-slate-400">7. Genel Liste</div>
                      <div className="text-[10px] text-slate-400 font-medium">Grup / B2B Genel</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtre ve Arama Çubuğu */}
              <div className="px-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    placeholder="Kural adı, firma, grup, kategori, marka veya SKU ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  {ruleSearch && (
                    <button
                      onClick={() => setRuleSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <select
                    value={ruleScopeFilter}
                    onChange={(e) => setRuleScopeFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tüm Kapsamlar</option>
                    <option value="CUSTOMER">🏢 Firma Özel Kuralları</option>
                    <option value="CATEGORY">📁 Kategori Bazlı Kurallar</option>
                    <option value="BRAND">🏷️ Marka Bazlı Kurallar</option>
                    <option value="PRODUCT">📦 Ürün Özel / Net Fiyatlar</option>
                    <option value="GROUP">👥 Bayi Grubu Kuralları</option>
                  </select>
                  <button
                    onClick={loadData}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    title="Yenile"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Kurallar Tablosu */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4 w-28 text-center">Öncelik</th>
                      <th className="p-4">Kural Adı &amp; Kapsam</th>
                      <th className="p-4">Hedef (Firma / Grup)</th>
                      <th className="p-4">Kategori / Marka / Ürün</th>
                      <th className="p-4 text-right">İndirim / Özel Fiyat</th>
                      <th className="p-4 text-center">Durum</th>
                      <th className="p-4 text-right w-24">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(() => {
                      const filtered = priceRules.filter(r => {
                        if (ruleSearch.trim()) {
                          const q = ruleSearch.toLowerCase();
                          const matchesName = r.name?.toLowerCase().includes(q);
                          const matchesCompany = r.company?.legalName?.toLowerCase().includes(q);
                          const matchesGroup = r.customerGroup?.name?.toLowerCase().includes(q);
                          const matchesCategory = r.category?.name?.toLowerCase().includes(q);
                          const matchesBrand = r.brand?.name?.toLowerCase().includes(q);
                          const matchesProduct = r.product?.name?.toLowerCase().includes(q) || r.product?.sku?.toLowerCase().includes(q);
                          if (!matchesName && !matchesCompany && !matchesGroup && !matchesCategory && !matchesBrand && !matchesProduct) {
                            return false;
                          }
                        }
                        if (ruleScopeFilter === 'CUSTOMER') {
                          if (!r.companyId && !r.company) return false;
                        } else if (ruleScopeFilter === 'CATEGORY') {
                          if (!r.categoryId && !r.category) return false;
                        } else if (ruleScopeFilter === 'BRAND') {
                          if (!r.brandId && !r.brand) return false;
                        } else if (ruleScopeFilter === 'PRODUCT') {
                          if (!r.productId && !r.product && !r.specialPrice) return false;
                        } else if (ruleScopeFilter === 'GROUP') {
                          if (!r.customerGroupId && !r.customerGroup) return false;
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-slate-500">
                              <Layers size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
                              <div className="font-bold text-slate-300">Fiyatlandırma kuralı bulunamadı</div>
                              <div className="text-xs text-slate-500 mt-1">Arama filtrenizi değiştirebilir veya yeni bir kural ekleyebilirsiniz.</div>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((r) => {
                        const isCompanyRule = Boolean(r.companyId || r.company);
                        const isCategoryRule = Boolean(r.categoryId || r.category);
                        const isBrandRule = Boolean(r.brandId || r.brand);
                        const isProductRule = Boolean(r.productId || r.product);

                        let priorityColor = 'bg-slate-800 text-slate-300 border-slate-700';
                        let priorityLabel = '7 (Grup Genel)';
                        if (r.priority === 1) {
                          priorityColor = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
                          priorityLabel = '1 (Firma+Ürün)';
                        } else if (r.priority === 2) {
                          priorityColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                          priorityLabel = '2 (Firma+Kategori)';
                        } else if (r.priority === 3) {
                          priorityColor = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
                          priorityLabel = '3 (Firma+Marka)';
                        } else if (r.priority === 4) {
                          priorityColor = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
                          priorityLabel = '4 (Firma Cari)';
                        } else if (r.priority === 5) {
                          priorityColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
                          priorityLabel = '5 (Grup+Ürün/Adet)';
                        } else if (r.priority === 6) {
                          priorityColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                          priorityLabel = '6 (Grup+Kategori)';
                        }

                        return (
                          <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Öncelik */}
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg border font-black text-[11px] ${priorityColor}`}>
                                ⭐ {r.priority}
                              </span>
                            </td>

                            {/* Kural Adı & Tür */}
                            <td className="p-4">
                              <div className="font-black text-white text-sm">{r.name}</div>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-bold">
                                  {r.type}
                                </span>
                                {r.minQty && r.minQty > 1 && (
                                  <span className="px-1.5 py-0.5 bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 rounded font-bold">
                                    Min {r.minQty} Adet
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Hedef (Firma / Müşteri Grubu) */}
                            <td className="p-4">
                              {r.company?.legalName ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-blue-400 flex items-center gap-1.5">
                                    <Building2 size={13} className="text-blue-400 shrink-0" />
                                    {r.company.legalName}
                                  </div>
                                  {r.company.taxNo && (
                                    <div className="text-[10px] text-slate-500 font-mono pl-4">VKN: {r.company.taxNo}</div>
                                  )}
                                </div>
                              ) : r.customerGroup?.name ? (
                                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                                  {r.customerGroup.name}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium">🌐 Tüm B2B Müşterileri</span>
                              )}
                            </td>

                            {/* Kategori / Marka / Ürün */}
                            <td className="p-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {r.category?.name && (
                                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md text-[11px] font-bold flex items-center gap-1">
                                    📁 {r.category.name}
                                  </span>
                                )}
                                {r.brand?.name && (
                                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md text-[11px] font-bold flex items-center gap-1">
                                    🏷️ {r.brand.name}
                                  </span>
                                )}
                                {r.product?.name && (
                                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md text-[11px] font-bold flex items-center gap-1">
                                    📦 {r.product.name} ({r.product.sku})
                                  </span>
                                )}
                                {!r.category && !r.brand && !r.product && (
                                  <span className="text-slate-500 text-[11px]">Tüm Ürünler &amp; Kategoriler</span>
                                )}
                              </div>
                            </td>

                            {/* İndirim / Sabit Fiyat */}
                            <td className="p-4 text-right">
                              {r.specialPrice != null && Number(r.specialPrice) > 0 ? (
                                <div className="space-y-0.5">
                                  <div className="font-black text-cyan-400 text-sm">
                                    Net {Number(r.specialPrice).toLocaleString('tr-TR')} ₺
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">+ KDV Sabit Fiyat</div>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <div className="font-black text-emerald-400 text-sm">
                                    %{r.discountPercent} İndirim
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">Liste Fiyatı Üzerinden</div>
                                </div>
                              )}
                            </td>

                            {/* Durum & Anlık Toggle Switch */}
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleRuleActive(r)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-1 mx-auto ${
                                  r.active
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                                }`}
                                title="Durumu değiştirmek için tıklayın"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${r.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                {r.active ? 'AKTİF' : 'PASİF'}
                              </button>
                            </td>

                            {/* İşlemler */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditRuleModal(r)}
                                  className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition"
                                  title="Kuralı Düzenle"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeletePriceRule(r.id, r.name)}
                                  className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                                  title="Kuralı Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. AUDIT LOGLARI */}
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

      {/* ÜRÜN DÜZENLEME / YENİ ÜRÜN MODALI */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-3xl w-full border border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingProduct ? '✏️ Ürün Bilgilerini Düzenle' : '📦 Yeni Ürün Tanımla'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingProduct ? `SKU: ${editingProduct.sku}` : 'Yeni yedek parça ve stok girişi'}
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white p-2 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-bold">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Örn: Bosch Çamaşır Makinesi Pompa Motoru"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Stok Kodu (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="Örn: BSH-PUMP-01"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Barkod / EAN</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    placeholder="Örn: 8690000123456"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fiyat & Stok Bilgileri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1">Satış Fiyatı *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-black text-sm outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-3 text-slate-500 font-bold">{productForm.currency}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Maliyet Fiyatı</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Stok Miktarı *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm({ ...productForm, stockQty: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Kategori, Marka & KDV */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Kategori</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Kategori Seçiniz</option>
                    {adminCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Marka</label>
                  <select
                    value={productForm.brandId}
                    onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Marka Seçiniz</option>
                    {adminBrands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">KDV Oranı (%)</label>
                  <select
                    value={productForm.vatRate}
                    onChange={(e) => setProductForm({ ...productForm, vatRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="20">%20</option>
                    <option value="10">%10</option>
                    <option value="1">%1</option>
                    <option value="0">%0</option>
                  </select>
                </div>
              </div>

              {/* Görsel URL & Durum */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Ürün Görsel URL'si</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Yayın Durumu</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">Aktif (Satışta)</option>
                    <option value="DRAFT">Taslak</option>
                    <option value="INACTIVE">Pasif</option>
                  </select>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-slate-300 mb-1">Ürün Açıklaması &amp; Teknik Detaylar</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Ürünün uyumlu modelleri ve parça özellikleri..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {actionLoading ? 'Kaydediliyor...' : editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* B2B FİYAT KURALI EKLEME & DÜZENLEME MODALI */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                  {editingRule ? '✏️ B2B Fiyatlandırma Kuralını Düzenle' : '✨ Yeni B2B Fiyat Kuralı Tanımla'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingRule ? `Kural ID: ${editingRule.id}` : 'Firma veya kategori özelinde dinamik iskonto ve öncelik tanımlayın'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePriceRule} className="space-y-4 text-xs font-bold">
              {/* 1. KURAL ADI */}
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">
                  Kural Adı <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="Örn: Çınar Isı Kombi Kartları %25 Özel İskonto"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 2. KURAL KAPSAMI / TÜRÜ */}
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">
                  Kural Türü &amp; Hedef Kapsamı <span className="text-rose-400">*</span>
                </label>
                <select
                  value={ruleForm.type}
                  onChange={(e) => handleRuleTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <optgroup label="🏢 Firma (Cari) Özel İndirimleri (Yüksek Öncelikli)">
                    <option value="CUSTOMER_CATEGORY">🔶 2. Firma + Kategori İskontosu (Örn: Çınar Isı -&gt; Kombi Kartları %25)</option>
                    <option value="CUSTOMER_PRODUCT">⭐ 1. Firma + Ürün Özel Net Fiyat / İskonto (Örn: Çınar Isı -&gt; Sirkülasyon Pompası Net 1.950 ₺)</option>
                    <option value="CUSTOMER_BRAND">🟣 3. Firma + Marka İskontosu (Örn: Çınar Isı -&gt; Baymak Parçaları %20)</option>
                    <option value="CUSTOMER_PERCENT">🔵 4. Firma Genel Cari İskontosu (Tüm Ürünlerde % İndirim)</option>
                  </optgroup>
                  <optgroup label="👥 Müşteri Grubu (Bayi) İndirimleri">
                    <option value="GROUP_CATEGORY">🟢 6. Müşteri Grubu + Kategori İskontosu (Örn: A Grubu -&gt; Kombi Kartı %20)</option>
                    <option value="GROUP_BRAND">🟣 6. Müşteri Grubu + Marka İskontosu (Örn: A Grubu -&gt; Demirdöküm %15)</option>
                    <option value="GROUP_PRODUCT">💠 5. Müşteri Grubu + Ürün İskontosu</option>
                    <option value="QTY_TIER">📦 5. Miktar Kademeli İskonto (Min. Adet Şartlı)</option>
                    <option value="GROUP_PERCENT">⚪ 7. Müşteri Grubu Genel Liste İskontosu (Örn: A Grubu %15)</option>
                  </optgroup>
                  <optgroup label="🌐 Genel Kampanyalar (Tüm B2B)">
                    <option value="CATEGORY_CAMPAIGN">🏷️ 7. Genel Kategori Kampanyası</option>
                    <option value="BRAND_CAMPAIGN">🏷️ 7. Genel Marka Kampanyası</option>
                  </optgroup>
                </select>
              </div>

              {/* 3. DİNAMİK BAĞLAMSAL SEÇİCİLER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                {/* Firma Seçimi */}
                {['CUSTOMER_PRODUCT', 'CUSTOMER_CATEGORY', 'CUSTOMER_BRAND', 'CUSTOMER_PERCENT'].includes(ruleForm.type) && (
                  <div className="md:col-span-2">
                    <label className="block text-blue-300 mb-1.5 font-bold flex items-center gap-1.5">
                      <Building2 size={14} className="text-blue-400" /> Hedef Firma (Cari) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={ruleForm.companyId}
                      onChange={(e) => setRuleForm({ ...ruleForm, companyId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-blue-500/40 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="">-- Firma Seçiniz --</option>
                      {(ruleLookup.companies.length > 0 ? ruleLookup.companies : companies).map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.legalName} {c.taxNo ? `(VKN: ${c.taxNo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Müşteri Grubu Seçimi */}
                {['GROUP_PRODUCT', 'GROUP_CATEGORY', 'GROUP_BRAND', 'GROUP_PERCENT'].includes(ruleForm.type) && (
                  <div className="md:col-span-2">
                    <label className="block text-emerald-300 mb-1.5 font-bold">
                      👥 Hedef Müşteri Grubu (Bayi Grubu) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={ruleForm.customerGroupId}
                      onChange={(e) => setRuleForm({ ...ruleForm, customerGroupId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-emerald-500/40 rounded-xl text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="">-- Müşteri Grubu Seçiniz --</option>
                      {(ruleLookup.customerGroups || []).map((g: any) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Kategori Seçimi */}
                {['CUSTOMER_CATEGORY', 'GROUP_CATEGORY', 'CATEGORY_CAMPAIGN'].includes(ruleForm.type) && (
                  <div className={['CUSTOMER_BRAND', 'GROUP_BRAND'].includes(ruleForm.type) ? '' : 'md:col-span-2'}>
                    <label className="block text-amber-300 mb-1.5 font-bold">
                      📁 Hedef Kategori <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={ruleForm.categoryId}
                      onChange={(e) => setRuleForm({ ...ruleForm, categoryId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-amber-500/40 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- Kategori Seçiniz --</option>
                      {(ruleLookup.categories.length > 0 ? ruleLookup.categories : adminCategories).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Marka Seçimi */}
                {['CUSTOMER_BRAND', 'GROUP_BRAND', 'BRAND_CAMPAIGN'].includes(ruleForm.type) && (
                  <div className={['CUSTOMER_CATEGORY', 'GROUP_CATEGORY'].includes(ruleForm.type) ? '' : 'md:col-span-2'}>
                    <label className="block text-purple-300 mb-1.5 font-bold">
                      🏷️ Hedef Marka <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={ruleForm.brandId}
                      onChange={(e) => setRuleForm({ ...ruleForm, brandId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-purple-500/40 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="">-- Marka Seçiniz --</option>
                      {(ruleLookup.brands.length > 0 ? ruleLookup.brands : adminBrands).map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tekil Ürün Seçimi */}
                {['CUSTOMER_PRODUCT', 'GROUP_PRODUCT'].includes(ruleForm.type) && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-rose-300 font-bold">
                      📦 Hedef Ürün (SKU / Ürün Adı) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ürün adı veya SKU ile filtreleyin..."
                      value={modalProductSearch}
                      onChange={(e) => setModalProductSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500"
                    />
                    <select
                      value={ruleForm.productId}
                      onChange={(e) => setRuleForm({ ...ruleForm, productId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-rose-500/40 rounded-xl text-white focus:outline-none focus:border-rose-400"
                    >
                      <option value="">-- Ürün Seçiniz --</option>
                      {(() => {
                        const prods = ruleLookup.products.length > 0 ? ruleLookup.products : adminProducts;
                        const filtered = modalProductSearch.trim()
                          ? prods.filter((p: any) =>
                              p.name.toLowerCase().includes(modalProductSearch.toLowerCase()) ||
                              p.sku.toLowerCase().includes(modalProductSearch.toLowerCase())
                            )
                          : prods;
                        return filtered.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} - {p.name} ({p.salePrice ? `${p.salePrice} ${p.currency || 'TRY'}` : 'Fiyat Belirtilmemiş'})
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                )}
              </div>

              {/* 4. FİYATLANDIRMA TİPİ & DEĞERİ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-bold">Fiyatlandırma Tipi</label>
                  <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setRuleForm({ ...ruleForm, valueType: 'PERCENT' })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                        ruleForm.valueType === 'PERCENT'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      % İskonto Oranı
                    </button>
                    <button
                      type="button"
                      onClick={() => setRuleForm({ ...ruleForm, valueType: 'SPECIAL_PRICE' })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                        ruleForm.valueType === 'SPECIAL_PRICE'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sabit Net Fiyat (₺)
                    </button>
                  </div>
                </div>

                <div>
                  {ruleForm.valueType === 'PERCENT' ? (
                    <div>
                      <label className="block text-emerald-400 mb-1.5 font-bold">İskonto Yüzdesi (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          required
                          value={ruleForm.discountPercent}
                          onChange={(e) => setRuleForm({ ...ruleForm, discountPercent: e.target.value })}
                          placeholder="Örn: 20"
                          className="w-full px-4 py-2 bg-slate-800 border border-emerald-500/50 rounded-xl text-white font-mono text-sm"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">%</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-cyan-400 mb-1.5 font-bold">Sabit Net Fiyat (₺ + KDV)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={ruleForm.specialPrice}
                          onChange={(e) => setRuleForm({ ...ruleForm, specialPrice: e.target.value })}
                          placeholder="Örn: 1950.00"
                          className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/50 rounded-xl text-white font-mono text-sm"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-bold">₺</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. ÖNCELİK VE MİNİMUM ADET */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-300 font-bold">Öncelik Seviyesi (1 - 7)</label>
                    <span className="text-[10px] text-amber-400 font-bold">1 = En Yüksek</span>
                  </div>
                  <select
                    value={ruleForm.priority}
                    onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="1">⭐ 1 - En Yüksek (Firma + Ürün Net Fiyatı)</option>
                    <option value="2">🔶 2 - Yüksek (Firma + Kategori İskontosu)</option>
                    <option value="3">🟣 3 - Orta-Üst (Firma + Marka İskontosu)</option>
                    <option value="4">🔵 4 - Firma Cari (Firma Genel İskontosu)</option>
                    <option value="5">💠 5 - Grup Özel / Adet Kademesi (Grup + Ürün)</option>
                    <option value="6">🟢 6 - Grup Kategori / Marka İskontosu</option>
                    <option value="7">⚪ 7 - Grup Genel / Kampanya Liste İskontosu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-bold">Min. Sipariş Adedi (Şartlı İskonto)</label>
                  <input
                    type="number"
                    min="1"
                    value={ruleForm.minQty}
                    onChange={(e) => setRuleForm({ ...ruleForm, minQty: e.target.value })}
                    placeholder="1 (Herhangi bir adet)"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* 6. GEÇERLİLİK TARİHLERİ VE AKTİFLİK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold text-[11px]">Geçerlilik Başlangıcı</label>
                  <input
                    type="date"
                    value={ruleForm.validFrom}
                    onChange={(e) => setRuleForm({ ...ruleForm, validFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold text-[11px]">Geçerlilik Bitişi</label>
                  <input
                    type="date"
                    value={ruleForm.validTo}
                    onChange={(e) => setRuleForm({ ...ruleForm, validTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold text-[11px]">Kural Durumu</label>
                  <button
                    type="button"
                    onClick={() => setRuleForm({ ...ruleForm, active: !ruleForm.active })}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 ${
                      ruleForm.active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${ruleForm.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    {ruleForm.active ? 'KURAL AKTİF' : 'KURAL PASİF'}
                  </button>
                </div>
              </div>

              {/* CANLI KURAL ÖNİZLEME KARTI */}
              <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-2xl text-[11px] text-blue-200 flex items-start gap-2.5">
                <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-blue-300 mb-0.5">Canlı Kural Önizleme Özeti:</div>
                  <p className="text-slate-300">
                    {(() => {
                      const compObj = (ruleLookup.companies.length > 0 ? ruleLookup.companies : companies).find((c: any) => c.id === ruleForm.companyId);
                      const grpObj = (ruleLookup.customerGroups || []).find((g: any) => g.id === ruleForm.customerGroupId);
                      const catObj = (ruleLookup.categories.length > 0 ? ruleLookup.categories : adminCategories).find((c: any) => c.id === ruleForm.categoryId);
                      const brdObj = (ruleLookup.brands.length > 0 ? ruleLookup.brands : adminBrands).find((b: any) => b.id === ruleForm.brandId);
                      const prdObj = (ruleLookup.products.length > 0 ? ruleLookup.products : adminProducts).find((p: any) => p.id === ruleForm.productId);

                      let targetDesc = 'Tüm B2B müşterileri';
                      if (compObj) targetDesc = `"${compObj.legalName}" firması`;
                      else if (grpObj) targetDesc = `"${grpObj.name}" grubu üyeleri`;

                      let scopeDesc = 'tüm ürünler';
                      if (prdObj) scopeDesc = `"${prdObj.name}" (${prdObj.sku}) ürünü`;
                      else if (catObj) scopeDesc = `"${catObj.name}" kategorisindeki ürünler`;
                      else if (brdObj) scopeDesc = `"${brdObj.name}" markalı ürünler`;

                      let valueDesc = ruleForm.valueType === 'PERCENT' ? `%${ruleForm.discountPercent || 0} indirimle` : `Net ${ruleForm.specialPrice || 0} ₺ sabit fiyatla`;

                      return `${targetDesc} için ${scopeDesc} ${valueDesc} fiyatlandırılacaktır. (Öncelik Seviyesi: ${ruleForm.priority})`;
                    })()}
                  </p>
                </div>
              </div>

              {/* BUTONLAR */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                >
                  {editingRule ? '💾 Değişiklikleri Kaydet' : '✨ Kuralı Oluştur & Başlat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SİPARİŞ DETAY VE ONAY MODALI */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-800 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-white font-mono">#{selectedOrder.orderNo}</h3>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
                    selectedOrder.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {selectedOrder.status === 'PENDING_APPROVAL' ? '⏳ Cari Onay Bekliyor' : selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Oluşturulma: {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white font-bold p-2 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Müşteri & Firma Bilgileri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <div className="text-slate-400 font-bold mb-1">Alıcı &amp; Firma:</div>
                <div className="font-bold text-white">{selectedOrder.buyer}</div>
                {selectedOrder.buyerPhone && (
                  <div className="text-slate-300 mt-0.5 flex items-center gap-2">
                    <span>📞 {selectedOrder.buyerPhone}</span>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${selectedOrder.buyerPhone.replace(/\D/g, '')}&text=Merhaba%20${encodeURIComponent(selectedOrder.buyer)},%20%23${selectedOrder.orderNo}%20numarali%20siparisiniz%20hakkinda:`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                )}
              </div>
              <div>
                <div className="text-slate-400 font-bold mb-1">Ödeme &amp; Cari Limit:</div>
                <div className="font-bold text-amber-400">
                  {selectedOrder.paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Hesap (Açık Hesap)' : 'Sanal POS'}
                </div>
                {selectedOrder.creditLimit > 0 && (
                  <div className="text-slate-300 mt-0.5">
                    Kayıtlı Limit: {selectedOrder.creditLimit.toLocaleString('tr-TR')} ₺
                  </div>
                )}
              </div>
              {selectedOrder.address && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                  <div className="text-slate-400 font-bold mb-0.5">Teslimat Adresi:</div>
                  <div className="text-slate-300">{selectedOrder.address}</div>
                </div>
              )}
            </div>

            {/* Sipariş Kalemleri */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">Sipariş İçeriği:</div>
              <div className="bg-slate-950 rounded-2xl border border-slate-800 divide-y divide-slate-800/60 max-h-52 overflow-y-auto text-xs">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">SKU: {item.sku} • Adet: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-emerald-400">
                        {item.lineGross?.toLocaleString('tr-TR')} {selectedOrder.currency}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500">Ürün detayı bulunamadı</div>
                )}
              </div>
            </div>

            {/* Alt Toplam & Aksiyonlar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
              <div className="text-left">
                <div className="text-xs text-slate-400">Genel Toplam (KDV Dahil):</div>
                <div className="text-xl font-black text-emerald-400">
                  {selectedOrder.grandTotal.toLocaleString('tr-TR')} {selectedOrder.currency}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedOrder.status === 'PENDING_APPROVAL' ? (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRejectOrder(selectedOrder.id)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
                    >
                      ✕ Reddet
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleApproveOrder(selectedOrder.id)}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-600/30"
                    >
                      ✓ Cari Siparişi Onayla
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
                  >
                    Kapat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}