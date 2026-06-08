'use client';
import { useCart, CartItem } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function SepetPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  // WhatsApp Fişi Oluşturma Algoritması
  const handleSendOrder = () => {
    let message = `*ERSA TİCARET - SİPARİŞ / TEKLİF LİSTESİ*\n`;
    message += `----------------------------------------\n\n`;
    
    cart.forEach((item: CartItem, index: number) => {
      message += `${index + 1}) *[${item.brand}]* ${item.title}\n`;
      message += `   🔹 *Ürün Kodu:* ${item.code}\n`;
      message += `   🔹 *Adet:* ${item.quantity} Adet\n`;
      message += `----------------------------------------\n`;
    });

    message += `\n✉️ Siparişimin stok durumu ve fiyat teklifi hakkında bilgi almak istiyorum.`;
    
    const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart(); // Sipariş gönderilince sepeti temizle
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-20 h-20 bg-slate-200/50 text-slate-400 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sepetiniz Boş</h2>
        <p className="text-slate-500 mb-6 text-center max-w-sm">Sitemizdeki kataloğu inceleyerek ihtiyacınız olan yedek parçaları sepetinize ekleyebilirsiniz.</p>
        <Link href="/urunler" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">
          Kataloğa Göz At
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/urunler" className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm">
            <ArrowLeft size={16} className="mr-1" /> Kataloğa Dön
          </Link>
          <button onClick={clearCart} className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors">
            Sepeti Temizle
          </button>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Sipariş Listem</h1>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden mb-8">
          <div className="divide-y divide-slate-100">
            {cart.map((item: CartItem) => (
              <div key={item.slug} className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center shrink-0">
                    <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.brand}</span>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base mt-0.5 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">OEM: {item.code}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0">
                  {/* Adet Kontrol Butonları */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 p-1">
                    <button onClick={() => updateQuantity(item.slug, item.quantity - 1)} className="p-1.5 hover:bg-white hover:text-blue-600 rounded-lg text-slate-500 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-sm font-bold text-slate-700 min-w-[32px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.slug, item.quantity + 1)} className="p-1.5 hover:bg-white hover:text-blue-600 rounded-lg text-slate-500 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.slug)} className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors shrink-0">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BİTİRİCİ WHATSAPP BUTON ALANI */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold mb-1">Listeyi WhatsApp'a Gönder</h3>
            <p className="text-slate-400 text-sm">Ödeme yapmanıza gerek yoktur. Sipariş listeniz otomatik fiş haline getirilecektir.</p>
          </div>
          <button 
            onClick={handleSendOrder}
            className="w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
          >
            <MessageCircle size={22} /> WhatsApp ile Siparişi Tamamla
          </button>
        </div>
      </div>
    </div>
  );
}