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
  metadataBase: new URL('https://www.ersaticaret.com'),
  alternates: {
    canonical: 'https://www.ersaticaret.com',
  },
  title: {
    default: "Ersa Ticaret | Online Yedek Parça",
    template: "%s | Ersa Ticaret" 
  },
  description: "Darıca ve Kocaeli bölgesinin lider kombi elektronik kartı, beyaz eşya yedek parçası ve teknik servis ekipmanı tedarikçisi. Orijinal ve muadil yedek parça stoğu, aynı gün hızlı teslimat ve fiyat danışma.",
  keywords: [
    "online yedek parça",
    "ersa ticaret online yedek parça",
    "kombi yedek parça", 
    "beyaz eşya yedek parça", 
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
    url: "https://www.ersaticaret.com",
    title: "Ersa Ticaret | Online Yedek Parça",
    description: "Kombi ve beyaz eşya yedek parçalarında geniş ürün kataloğu ve anında stok danışma. Binlerce parça stoktan hızlı temin.",
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

import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: 'Ersa Ticaret - Kombi & Beyaz Eşya Yedek Parça',
    image: 'https://www.ersaticaret.com/vitrin.png',
    '@id': 'https://www.ersaticaret.com/#store',
    url: 'https://www.ersaticaret.com',
    telephone: '+905525843073',
    priceRange: '₺₺',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fevziçakmak Mah. Dr. Zeki Acar Cad. No: 62/A',
      addressLocality: 'Darıca',
      addressRegion: 'Kocaeli',
      postalCode: '41700',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7745,
      longitude: 29.4055,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:30',
        closes: '19:00',
      },
    ],
    sameAs: ['https://wa.me/905525843073'],
  };

  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
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
              <WhatsAppFloat />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}