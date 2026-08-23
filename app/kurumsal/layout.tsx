import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda & Mağazamız | Darıca Ersa Ticaret',
  description: 'Ersa Ticaret, Darıca ve Kocaeli bölgesinde kombi ve beyaz eşya yedek parçası tedariğinde öncü mağaza ve toptancı.',
  alternates: {
    canonical: 'https://www.ersaticaret.com/kurumsal',
  },
  openGraph: {
    title: 'Hakkımızda | Ersa Ticaret',
    description: 'Darıca mağazamız ve geniş yedek parça stoklarımız.',
    url: 'https://www.ersaticaret.com/kurumsal',
  },
};

export default function KurumsalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
