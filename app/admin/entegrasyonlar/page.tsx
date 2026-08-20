'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SupplierInfo {
  id: string;
  code: string;
  name: string;
  active: boolean;
  lastSyncedAt: string | null;
  productCount: number;
  jobCount: number;
  lastJob: any | null;
}

interface ImportJobInfo {
  id: string;
  supplierCode: string;
  mode: string;
  status: string;
  totalItems: number;
  createdItems: number;
  updatedItems: number;
  skippedItems: number;
  failedItems: number;
  summaryMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  supplier?: { name: string; code: string };
  errors?: Array<{ id: string; externalSku?: string; productName?: string; errorMessage: string }>;
}

export default function SupplierIntegrationsPage() {
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [jobs, setJobs] = useState<ImportJobInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCode, setSyncingCode] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<string>('FULL');
  const [limit, setLimit] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<ImportJobInfo | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [suppRes, jobsRes] = await Promise.all([
        fetch('/api/v1/admin/suppliers'),
        fetch('/api/v1/admin/suppliers/jobs?limit=25'),
      ]);

      const suppData = await suppRes.json();
      const jobsData = await jobsRes.json();

      if (suppData.success) setSuppliers(suppData.suppliers);
      if (jobsData.success) setJobs(jobsData.jobs);
    } catch (err: any) {
      console.error('Veriler yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerSync = async (supplierCode: string) => {
    setSyncingCode(supplierCode);
    setNotification(null);
    try {
      const res = await fetch('/api/v1/admin/suppliers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierCode,
          mode: syncMode,
          limit: limit && limit !== 'all' ? parseInt(limit, 10) : undefined,
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          message: `${supplierCode} senkronizasyonu tamamlandı: ${data.result.created} yeni eklendi, ${data.result.updated} güncellendi, ${data.result.failed} hata.`
        });
        fetchDashboardData();
      } else {
        setNotification({
          type: 'error',
          message: `Senkronizasyon hatası: ${data.error}`
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `İstek hatası: ${err.message}`
      });
    } finally {
      setSyncingCode(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-slate-400 hover:text-white transition">
              ← Admin Paneline Dön
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-bold text-amber-500">Tedarikçi Entegrasyonları</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 flex items-center gap-3">
            <span>🔄 Ürün Aktarım & Senkronizasyon Motoru</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
              v2.0 Canlı Sistem
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Girdap, Garanti İş ve Kombisan sistemlerinden otomatik ürün çekme, duplicate önleme, fiyat ve stok senkronizasyonu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition flex items-center gap-2"
          >
            <span>🔄</span> Yenile
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              notification.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-600/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Sync Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span>⚙️ Senkronizasyon Çalıştırma Parametreleri</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Senkronizasyon Modu</label>
              <select
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="FULL">🌟 Tam Senkronizasyon (Ürün + Fiyat + Stok + Resim)</option>
                <option value="INCREMENTAL">⚡ Yalnızca Yeni & Değişen Ürünler</option>
                <option value="PRICE_ONLY">💰 Yalnızca Fiyatları Güncelle</option>
                <option value="STOCK_ONLY">📦 Yalnızca Stokları Güncelle</option>
                <option value="IMAGE_ONLY">🖼️ Yalnızca Görselleri Çek</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Limit (Ürün Sayısı Sınırı)</label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">🚀 Tüm Ürünler (Limitsiz - Tüm Sayfalar)</option>
                <option value="500">500 Ürün</option>
                <option value="200">200 Ürün</option>
                <option value="50">50 Ürün (Hızlı Test)</option>
                <option value="10">10 Ürün (Örnek Test)</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 w-full">
                🔒 <strong>Güvenlik:</strong> Şifreler ve kimlik bilgileri sunucu ortamında <code className="text-amber-400">.env</code> dosyasından okunmaktadır.
              </div>
            </div>
          </div>
        </div>

        {/* 3 Suppliers Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. GIRDAP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Girdap Isı & Soğutma</h3>
                    <p className="text-xs text-slate-400 font-mono">bayi.girdap.com.tr</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  Aktif
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                Kombi ve beyaz eşya yedek parçaları, fan motorları, termostatlar ve elektronik kartlar.
              </p>

              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2 mb-6 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Entegrasyon Türü:</span>
                  <span className="font-semibold text-slate-200">PHP B2B Crawler (Cookie)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Kayıtlı Ürün:</span>
                  <span className="font-bold text-amber-400">
                    {suppliers.find(s => s.code === 'GIRDAP')?.productCount || 0} Adet
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Son Senkronizasyon:</span>
                  <span className="font-mono text-slate-300">
                    {suppliers.find(s => s.code === 'GIRDAP')?.lastSyncedAt
                      ? new Date(suppliers.find(s => s.code === 'GIRDAP')!.lastSyncedAt!).toLocaleString('tr-TR')
                      : 'Henüz yapılmadı'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => triggerSync('GIRDAP')}
              disabled={syncingCode !== null}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                syncingCode === 'GIRDAP'
                  ? 'bg-amber-600/50 text-white cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              {syncingCode === 'GIRDAP' ? (
                <>
                  <span className="animate-spin">⏳</span> Aktarılıyor...
                </>
              ) : (
                <>
                  <span>⚡</span> Girdap'ı Şimdi Senkronize Et
                </>
              )}
            </button>
          </div>

          {/* 2. GARANTI IS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                    🧹
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Garanti İş</h3>
                    <p className="text-xs text-slate-400 font-mono">garantiis.com.tr</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  Filtreli Aktif
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                <strong>Özel Kapsam:</strong> Yalnızca <em>"Elektrikli Süpürge Parçaları"</em> ve altındaki 12 alt kategori (Motor, Boru, Başlık, Torba vb.).
              </p>

              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2 mb-6 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Entegrasyon Türü:</span>
                  <span className="font-semibold text-slate-200">NopCommerce .NET Crawler</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Kayıtlı Ürün:</span>
                  <span className="font-bold text-blue-400">
                    {suppliers.find(s => s.code === 'GARANTIIS')?.productCount || 0} Adet
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Son Senkronizasyon:</span>
                  <span className="font-mono text-slate-300">
                    {suppliers.find(s => s.code === 'GARANTIIS')?.lastSyncedAt
                      ? new Date(suppliers.find(s => s.code === 'GARANTIIS')!.lastSyncedAt!).toLocaleString('tr-TR')
                      : 'Henüz yapılmadı'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => triggerSync('GARANTIIS')}
              disabled={syncingCode !== null}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                syncingCode === 'GARANTIIS'
                  ? 'bg-blue-600/50 text-white cursor-wait'
                  : 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {syncingCode === 'GARANTIIS' ? (
                <>
                  <span className="animate-spin">⏳</span> Aktarılıyor...
                </>
              ) : (
                <>
                  <span>⚡</span> Süpürge Parçalarını Senkronize Et
                </>
              )}
            </button>
          </div>

          {/* 3. KOMBI KLIMA PARCA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
                    ❄️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Kombi Klima Parça</h3>
                    <p className="text-xs text-slate-400 font-mono">kombiklimaparca.com</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  WooCommerce API
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                WordPress & WooCommerce Store REST API doğrudan bağlantısı ile kombi & klima yedek parçaları kataloğu.
              </p>

              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2 mb-6 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Entegrasyon Türü:</span>
                  <span className="font-semibold text-slate-200">WooCommerce REST Store API</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Kayıtlı Ürün:</span>
                  <span className="font-bold text-emerald-400">
                    {suppliers.find(s => s.code === 'KOMBIKLIMAPARCA')?.productCount || 0} Adet
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Son Senkronizasyon:</span>
                  <span className="font-mono text-slate-300">
                    {suppliers.find(s => s.code === 'KOMBIKLIMAPARCA')?.lastSyncedAt
                      ? new Date(suppliers.find(s => s.code === 'KOMBIKLIMAPARCA')!.lastSyncedAt!).toLocaleString('tr-TR')
                      : 'Henüz yapılmadı'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => triggerSync('KOMBIKLIMAPARCA')}
              disabled={syncingCode !== null}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                syncingCode === 'KOMBIKLIMAPARCA'
                  ? 'bg-emerald-600/50 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              {syncingCode === 'KOMBIKLIMAPARCA' ? (
                <>
                  <span className="animate-spin">⏳</span> Aktarılıyor...
                </>
              ) : (
                <>
                  <span>⚡</span> Kombi Klima Parça'yı Şimdi Senkronize Et
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync History & Audit Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📋 Aktarım ve Senkronizasyon Geçmişi</span>
              </h2>
              <p className="text-xs text-slate-400">Son yapılan otomatik ve manuel senkronizasyon kayıtları.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Tedarikçi</th>
                  <th className="py-3 px-4">Mod</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Toplam</th>
                  <th className="py-3 px-4 text-emerald-400">Yeni Eklenen</th>
                  <th className="py-3 px-4 text-blue-400">Güncellenen</th>
                  <th className="py-3 px-4 text-rose-400">Hatalı</th>
                  <th className="py-3 px-4">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      Henüz senkronizasyon kaydı bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(j.startedAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {j.supplier?.name || j.supplierCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">
                          {j.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            j.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : j.status === 'RUNNING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {j.status === 'COMPLETED' ? 'Tamamlandı' : j.status === 'RUNNING' ? 'Çalışıyor' : 'Hata'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">{j.totalItems}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">+{j.createdItems}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-400">{j.updatedItems}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-400">
                        {j.failedItems > 0 ? (
                          <button
                            onClick={() => setSelectedJob(j)}
                            className="underline hover:text-rose-300"
                          >
                            {j.failedItems} Hata ℹ️
                          </button>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans text-xs max-w-xs truncate">
                        {j.summaryMessage || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Error Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚠️ Hata Raporu: {selectedJob.supplierCode} ({new Date(selectedJob.startedAt).toLocaleString('tr-TR')})</span>
              </h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto font-mono text-xs">
              {selectedJob.errors && selectedJob.errors.length > 0 ? (
                selectedJob.errors.map((err, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-semibold mb-1">
                      Ürün: {err.productName || err.externalSku || 'Bilinmiyor'} (SKU: {err.externalSku || '-'})
                    </div>
                    <div className="text-rose-400">{err.errorMessage}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 p-4 text-center">
                  Detaylı hata kaydı bulunamadı. Genel mesaj: {selectedJob.summaryMessage}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
