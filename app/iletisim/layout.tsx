import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim & Konum | Darıca Mağaza ve Telefon Bilgileri',
  description: 'Ersa Ticaret Darıca / Kocaeli mağaza adresi, telefon numaraları, WhatsApp hızlı sipariş hattı ve çalışma saatleri.',
  alternates: {
    canonical: 'https://www.ersaticaret.com/iletisim',
  },
  openGraph: {
    title: 'İletişim | Ersa Ticaret',
    description: 'Darıca mağaza adresi ve WhatsApp sipariş hattı.',
    url: 'https://www.ersaticaret.com/iletisim',
  },
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
