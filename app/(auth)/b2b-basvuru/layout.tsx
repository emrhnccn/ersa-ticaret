import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'B2B Bayilik Başvurusu | Özel Iskontolu Parça Tedariği',
  description: 'Teknik servisler ve kombi ustalarına özel B2B bayilik başvurusu. Toptan yedek parça alımlarında vadeli cari hesap ve anında iskonto imkanı.',
  alternates: {
    canonical: 'https://www.ersaticaret.com/b2b-basvuru',
  },
  openGraph: {
    title: 'B2B Bayilik Başvurusu | Ersa Ticaret',
    description: 'Teknik servislere özel toptan fiyat ve cari hesap avantajları.',
    url: 'https://www.ersaticaret.com/b2b-basvuru',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
