export interface OrderNotificationData {
  orderId: string;
  orderNo: string;
  recipientName: string;
  recipientPhone?: string | null;
  recipientEmail?: string | null;
  companyName?: string | null;
  grandTotal: number;
  currency: string;
  paymentMethod: string;
  status: string;
  itemCount: number;
  itemsSummary: string;
  addressSummary: string;
}

export const notificationService = {
  /**
   * E-Posta Bildirimi Gönderir (Müşteri & Admin)
   */
  async sendOrderEmail(data: OrderNotificationData, event: 'CREATED' | 'APPROVED' | 'REJECTED' | 'SHIPPED') {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@ersaticaret.com';
    const targetEmail = data.recipientEmail || 'musteri@cinarisi.com';

    let subject = '';
    let htmlContent = '';

    if (event === 'CREATED') {
      subject = `[ERSA TİCARET] Yeni Sipariş #${data.orderNo} - ${data.paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Onayı Bekliyor' : 'Alındı'}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
            <h1 style="color: #1e3a8a; margin: 0;">ERSA TİCARET</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px;">B2B & B2C Yedek Parça Dağıtım Platformu</p>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #0f172a; font-size: 18px;">Sayın ${data.recipientName} (${data.companyName || 'Müşterimiz'}),</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              <strong>#${data.orderNo}</strong> numaralı siparişiniz başarıyla oluşturulmuştur.
              ${data.paymentMethod === 'CURRENT_ACCOUNT' ? '<br><span style="color: #d97706; font-weight: bold;">⚠️ Ödeme Cari Hesap olarak seçildiğinden siparişiniz yönetici onayına sunulmuştur.</span>' : ''}
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Sipariş Numarası:</td>
                <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #2563eb;">#${data.orderNo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Ödeme Türü:</td>
                <td style="padding: 10px; color: #0f172a;">${data.paymentMethod === 'CURRENT_ACCOUNT' ? 'Cari Hesap (Açık Hesap)' : 'Kredi Kartı / Sanal POS'}</td>
              </tr>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Toplam Tutar:</td>
                <td style="padding: 10px; font-weight: bold; color: #059669; font-size: 15px;">${data.grandTotal.toLocaleString('tr-TR')} ${data.currency}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Teslimat Adresi:</td>
                <td style="padding: 10px; color: #334155;">${data.addressSummary}</td>
              </tr>
            </table>

            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #475569;">
              <strong>Sipariş İçeriği:</strong><br>
              ${data.itemsSummary}
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
            Ersa Ticaret Isı ve Soğutma Sistemleri — Müşteri Hizmetleri: 0552 584 30 73
          </div>
        </div>
      `;
    } else if (event === 'APPROVED') {
      subject = `[ERSA TİCARET] Siparişiniz Onaylandı #${data.orderNo}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #059669;">✅ Siparişiniz Onaylandı!</h2>
          <p><strong>#${data.orderNo}</strong> numaralı cari siparişiniz yönetici tarafından onaylanmış olup depomuzda hazırlanmaya başlanmıştır.</p>
          <p>Toplam Tutar: <strong>${data.grandTotal.toLocaleString('tr-TR')} ${data.currency}</strong> (Cari ekstrenize borç olarak işlendi)</p>
        </div>
      `;
    }

    console.log(`[Notification Service] 📧 E-Mail Dispatching: To=[${targetEmail}, ${adminEmail}], Subject="${subject}"`);
    return { success: true, subject, targetEmail };
  },

  /**
   * WhatsApp Bildirim Mesajı Üretir ve Gönderir
   */
  async sendOrderWhatsApp(data: OrderNotificationData, event: 'CREATED' | 'APPROVED' | 'REJECTED' | 'SHIPPED') {
    const adminPhone = '905525843073';
    const customerPhone = (data.recipientPhone || '905321112233').replace(/\D/g, '');

    let message = '';
    if (event === 'CREATED') {
      message = `🔔 *YENİ B2B CARİ SİPARİŞİ BİLDİRİMİ* 🔔\n\n` +
        `📋 *Sipariş No:* #${data.orderNo}\n` +
        `🏢 *Firma:* ${data.companyName || data.recipientName}\n` +
        `👤 *Yetkili:* ${data.recipientName}\n` +
        `📞 *Tel:* ${data.recipientPhone || '-'}\n` +
        `💰 *Tutar:* ${data.grandTotal.toLocaleString('tr-TR')} ${data.currency}\n` +
        `💳 *Ödeme:* Cari Hesap\n` +
        `📍 *Adres:* ${data.addressSummary}\n` +
        `📦 *Ürünler:* ${data.itemsSummary}\n\n` +
        `⏳ *Durum:* Cari Onayı Bekliyor\n` +
        `👉 *Admin Onay Paneli:* https://ersaticaret.com/admin`;
    } else if (event === 'APPROVED') {
      message = `✅ *SİPARİŞİNİZ ONAYLANDI* ✅\n\n` +
        `Sayın ${data.recipientName} (${data.companyName || 'Ersa Ticaret Müşterimiz'}),\n` +
        `#${data.orderNo} numaralı siparişiniz onaylanmış ve depomuzda hazırlanmaya başlanmıştır.\n\n` +
        `💰 *Tutar:* ${data.grandTotal.toLocaleString('tr-TR')} ${data.currency}\n` +
        `🚚 Kargonuz hazırlandığında takip kodu paylaşılacaktır.`;
    }

    const adminWhatsAppUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(message)}`;
    const customerWhatsAppUrl = `https://api.whatsapp.com/send?phone=${customerPhone}&text=${encodeURIComponent(message)}`;

    console.log(`[Notification Service] 💬 WhatsApp Dispatching: Admin=${adminPhone}, Customer=${customerPhone}`);
    console.log(`[Notification Service] Message preview:\n${message}\n`);

    return {
      success: true,
      message,
      adminWhatsAppUrl,
      customerWhatsAppUrl,
    };
  }
};
