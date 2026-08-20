import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore
import './globals.css';
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import AnnouncementBar from '@/components/AnnouncementBar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ersaticaret.com'),
  title: {
    default: "Ersa Ticaret | B2B & B2C Beyaz Eşya ve Kombi Yedek Parça Merkezi",
    template: "%s | Ersa Ticaret" 
  },
  description: "Darıca ve Kocaeli bölgesinin lider toptan ve perakende kombi elektronik kartı, beyaz eşya yedek parçası ve teknik servis ekipmanı tedarikçisi. Özel bayi fiyatları ve anında stok teslimatı.",
  keywords: [
    "kombi yedek parça", 
    "beyaz eşya yedek parça", 
    "b2b yedek parça",
    "kombi anakart", 
    "darıca yedek parça", 
    "kocaeli kombi parça", 
    "toptan yedek parça", 
    "çamaşır makinesi pompası",
    "kombi tamir parçaları"
  ],
  authors: [{ name: "Ersa Ticaret" }],
  creator: "Ersa Ticaret",
  icons: {
    icon: '/logo.png',
    apple: '/icon-192x192.png',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ersaticaret.com",
    title: "Ersa Ticaret | B2B & B2C Yedek Parça Merkezi",
    description: "Kombi ve beyaz eşya yedek parçalarında toptan ve perakende satış. Binlerce parça anında stoktan teslim.",
    siteName: "Ersa Ticaret",
    images: [
      {
        url: "/vitrin.png", 
        width: 1200,
        height: 630,
        alt: "Ersa Ticaret Mağaza Görünümü",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AnnouncementBar />
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}