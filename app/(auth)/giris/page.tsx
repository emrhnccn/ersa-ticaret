'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Building2,
  ArrowRight,
  Shield,
  UserCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function GirisPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const targetEmail = (customEmail || email).trim();
    const targetPass = customPass || password;

    try {
      const res = (await login(targetEmail, targetPass)) as any;
      
      // Admin ise doğrudan /admin paneline, müşteri/bayi ise /hesap paneline yönlendir
      if (res?.user?.role === 'ADMIN' || res?.role === 'ADMIN' || targetEmail.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/hesap');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı');
      setLoading(false);
    }
  };

  const fillAndLogin = (eMail: string, pass: string) => {
    setEmail(eMail);
    setPassword(pass);
    handleLogin(undefined, eMail, pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-16">
      <div className="max-w-md w-full">
        
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
              E
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white leading-none">
                ERSA <span className="text-blue-400">TİCARET</span>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                B2B &amp; B2C Giriş Portalı
              </div>
            </div>
          </Link>
        </div>

        {/* GİRİŞ KARTI */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
          
          <h2 className="text-xl font-black text-slate-900 mb-1">Hesabınıza Giriş Yapın</h2>
          <p className="text-xs text-slate-500 mb-6">
            Özel bayi iskonto oranları, cari hesap ve yönetim için giriş yapınız.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl mb-4 text-xs flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1.5">E-Posta Adresi</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@firma.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1.5">Şifre</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/25 active:scale-95 text-sm mt-2"
            >
              <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* HIZLI TEST DEMO HESAPLARI */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Hızlı Test Demo Hesapları
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => fillAndLogin('admin@ersaticaret.com', 'Admin123!')}
                className="p-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors text-left"
              >
                <Shield size={14} className="text-amber-400 shrink-0" />
                <div className="line-clamp-1">👑 Admin Paneli</div>
              </button>

              <button
                type="button"
                onClick={() => fillAndLogin('bayi1@cinarisi.com', 'Ersa123!')}
                className="p-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-2 transition-colors text-left"
              >
                <Building2 size={14} className="text-emerald-600 shrink-0" />
                <div className="line-clamp-1">A Grubu Bayi (%15)</div>
              </button>

              <button
                type="button"
                onClick={() => fillAndLogin('bayi2@marmarateknik.com', 'Ersa123!')}
                className="p-2.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-2 transition-colors text-left"
              >
                <Building2 size={14} className="text-blue-600 shrink-0" />
                <div className="line-clamp-1">B Grubu Bayi (%10)</div>
              </button>

              <button
                type="button"
                onClick={() => fillAndLogin('musteri@gmail.com', 'Ersa123!')}
                className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors text-left"
              >
                <UserCheck size={14} className="text-slate-600 shrink-0" />
                <div className="line-clamp-1">B2C Müşteri</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Bayilik hesabınız yok mu?{' '}
            <Link href="/b2b-basvuru" className="text-blue-600 font-bold hover:underline">
              B2B Bayi Başvurusu Yapın
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
