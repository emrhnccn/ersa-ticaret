'use client';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  CreditCard,
  Truck
} from 'lucide-react';

export default function SepetPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotals, currency } = useCart();
  const { isB2B, user } = useAuth();
  const totals = getTotals();

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺';

  // WhatsApp Fişi Oluşturma (İsteğe Bağlı)
  const handleSendWhatsapp = () => {
    let message = `*ERSA TİCARET - SİPARİŞ LİSTESİ*\n`;
    message += `----------------------------------------\n\n`;
    
    cart.forEach((item: CartItem, index: number) => {
      const priceText = item.priceQuote ? `${item.priceQuote.unitNetExVat} ${currencySymbol} + KDV` : '';
      message += `${index + 1}) *[${item.brand}]* ${item.name}\n`;
      message += `   🔹 *OEM Kodu:* ${item.sku}\n`;
      message += `   🔹 *Adet:* ${item.quantity} ${item.unit}\n`;
      if (priceText) message += `   🔹 *Birim Fiyat:* ${priceText}\n`;
      message += `----------------------------------------\n`;
    });

    message += `\n💰 *Ara Toplam (KDV Hariç):* ${totals.subtotalExVat.toLocaleString('tr-TR')} ${currencySymbol}`;
    message += `\n🧾 *KDV Toplamı (%20):* ${totals.vatTotal.toLocaleString('tr-TR')} ${currencySymbol}`;
    message += `\n💳 *Genel Toplam:* ${totals.grandTotal.toLocaleString('tr-TR')} ${currencySymbol}\n`;
    message += `\n✉️ Siparişim hakkında bilgi almak istiyorum.`;
    
    const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Sepetiniz Boş</h2>
        <p className="text-slate-500 mb-8 text-center max-w-sm text-sm">
          İhtiyacınız olan kombi ve beyaz eşya yedek parçalarını kataloğumuzdan seçip sepetinize ekleyebilirsiniz.
        </p>
        <Link
          href="/urunler"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm"
        >
          Kataloğa Göz At
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Başlık & Geri Dön */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/urunler"
            className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Kataloğa Dön ve Alışverişe Devam Et
          </Link>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
          >
            Sepeti Temizle
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">
          Alışveriş Sepetim <span className="text-slate-400 text-lg font-bold">({totals.itemCount} Ürün)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SOL: SEPET ÜRÜN LİSTESİ (8 Kolon) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* B2B Giriş Uyarısı / Bilgilendirme */}
            {isB2B && user?.company ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">{user.company.legalName}</div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Bayi indiriminiz ({user.company.customerGroup?.name}) sepete otomatik uygulanmıştır.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs text-blue-900 font-medium">
                  Teknik servis veya toptancı mısınız? Özel iskonto ve vadeli cari hesap için bayi girişi yapın.
                </div>
                <Link href="/giris" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shrink-0 hover:bg-blue-700">
                  Bayi Girişi
                </Link>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {cart.map((item: CartItem) => {
                const quote = item.priceQuote;
                const unitNet = quote ? quote.unitNetExVat : 1000;
                const lineNet = unitNet * item.quantity;
                const isDiscounted = quote && quote.appliedRuleNames && quote.appliedRuleNames.length > 0;

                return (
                  <div key={item.id || item.slug} className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
                    
                    {/* Ürün Görseli & Başlık */}
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                      <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl p-2 flex items-center justify-center shrink-0 relative overflow-hidden">
                        <Image src={item.image || 'https://placehold.co/400x400'} alt={item.name} fill unoptimized sizes="80px" className="object-contain p-1" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">
                          {item.brand}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm md:text-base mt-1 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          OEM: <strong className="text-slate-700">{item.sku}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Fiyat, Adet ve Sil Butonu */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0">
                      
                      {/* Adet Kontrolü */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                        <button
                          onClick={() => updateQuantity(item.id || item.slug, item.quantity - 1)}
                          className="p-1.5 hover:bg-white hover:text-blue-600 rounded-lg text-slate-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-black text-slate-800 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id || item.slug, item.quantity + 1)}
                          className="p-1.5 hover:bg-white hover:text-blue-600 rounded-lg text-slate-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Satır Fiyatı */}
                      <div className="text-right min-w-[100px]">
                        {isDiscounted && (
                          <div className="text-[10px] text-amber-600 font-bold flex items-center justify-end gap-1">
                            <Sparkles size={11} /> İskontolu
                          </div>
                        )}
                        <div className="text-base font-black text-slate-900">
                          {lineNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">+ KDV</div>
                      </div>

                      {/* Sil Butonu */}
                      <button
                        onClick={() => removeFromCart(item.id || item.slug)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* SAĞ: SİPARİŞ ÖZETİ & CHECKOUT (4 Kolon) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-900/5 sticky top-28 space-y-6">
              
              <h3 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">
                Sipariş Özeti
              </h3>

              {/* Fiyat Kırılımı */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Ara Toplam (KDV Hariç)</span>
                  <strong className="text-slate-800 font-bold text-sm">
                    {totals.subtotalExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Hesaplanan KDV (%20)</span>
                  <strong className="text-slate-800 font-bold text-sm">
                    {totals.vatTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Kargo Ücreti</span>
                  <strong className="text-emerald-600 font-bold">ÜCRETSİZ</strong>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">Genel Toplam</span>
                    <span className="text-[10px] text-slate-400">Tüm vergiler dahildir</span>
                  </div>
                  <div className="text-2xl font-black text-blue-600">
                    {totals.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </div>
                </div>
              </div>

              {/* BİLGİLENDİRME NOTU */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <p>🔒 256-Bit SSL korumalı güvenli checkout.</p>
                <p>📄 Otomatik e-Fatura / e-Arşiv faturanız kesilecektir.</p>
              </div>

              {/* CHECKOUT BUTONU */}
              <Link
                href="/odeme"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/25 active:scale-95 text-sm"
              >
                <span>Siparişi Tamamla</span>
                <ArrowRight size={18} />
              </Link>

              {/* WHATSAPP İLE HIZLI SİPARİŞ */}
              <button
                onClick={handleSendWhatsapp}
                className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-xs"
              >
                <MessageCircle size={18} className="text-emerald-600" />
                <span>Listeyi WhatsApp'a Gönder</span>
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}