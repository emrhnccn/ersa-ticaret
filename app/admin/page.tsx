'use client';
import { LayoutDashboard, Package, MessageSquare, Settings, Plus, Edit, Trash2, LogOut } from 'lucide-react';
import { products } from '@/lib/data'; // Şimdilik sahte verileri tabloda göstermek için

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <h1 className="text-xl font-extrabold text-white tracking-wider">ERSA<span className="text-blue-500">ADMIN</span></h1>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Kontrol Paneli</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
            <Package size={20} />
            <span className="font-medium">Ürünler</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
            <MessageSquare size={20} />
            <span className="font-medium">Gelen Mesajlar</span>
            <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
            <Settings size={20} />
            <span className="font-medium">Ayarlar</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* SAĞ TARAF (ANA İÇERİK) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Üst Bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800">Kontrol Paneli</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-md">
              A
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-bold text-slate-700">Admin Kullanıcısı</p>
              <p className="text-slate-400 text-xs">Yönetici</p>
            </div>
          </div>
        </header>

        {/* İçerik Alanı */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Package size={28} /></div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Toplam Ürün</p>
                <p className="text-2xl font-extrabold text-slate-800">1,248</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><LayoutDashboard size={28} /></div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Aktif Kategori</p>
                <p className="text-2xl font-extrabold text-slate-800">12</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><MessageSquare size={28} /></div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Okunmamış Mesaj</p>
                <p className="text-2xl font-extrabold text-slate-800">3</p>
              </div>
            </div>
          </div>

          {/* Son Eklenen Ürünler Tablosu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Son Eklenen Parçalar</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                <Plus size={16} /> Yeni Parça Ekle
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Ürün Adı</th>
                    <th className="p-4 font-semibold">Kategori</th>
                    <th className="p-4 font-semibold">Parça Kodu</th>
                    <th className="p-4 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.slug} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                          <span className="font-bold text-slate-800 line-clamp-1">{product.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm font-medium">{product.category}</td>
                      <td className="p-4 text-slate-500 text-sm font-mono bg-slate-50 rounded px-2 w-max inline-block mt-3">{product.code}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}