import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fiyat & Parça Danışma | Ersa Ticaret Online Yedek Parça',
  description: 'Kombi ve beyaz eşya yedek parçaları için anında fiyat ve stok danışma hattı.',
  alternates: {
    canonical: 'https://www.ersaticaret.com/b2b-basvuru',
  },
  openGraph: {
    title: 'Fiyat & Parça Danışma | Ersa Ticaret',
    description: 'WhatsApp ve telefon üzerinden anında yedek parça fiyatı ve stok teyidi.',
    url: 'https://www.ersaticaret.com/b2b-basvuru',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
