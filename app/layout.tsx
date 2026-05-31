import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore
import './globals.css';
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

// PWA Tema rengi ve mobil ölçekleme ayarları
export const viewport: Viewport = {
  themeColor: '#2563eb', // Uygulamanın üst bar (statüs) rengi
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Mobil uygulama hissiyatı için yakınlaştırmayı kilitler
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ersaticaret.com'),
  // 1. Arama Motoru Başlık Ayarları
  title: {
    default: "Ersa Ticaret | Beyaz Eşya ve Kombi Yedek Parça Merkezi",
    template: "%s | Ersa Ticaret" 
  },
  
  // 2. Google Arama Sonucu Açıklaması
  description: "Darıca ve Kocaeli bölgesinin en büyük toptan ve perakende kombi elektronik kartı, beyaz eşya yedek parçası ve teknik servis ekipmanı tedarikçisi. Orijinal ve yan sanayi parçalar anında stokta.",
  
  // 3. Google'ın Sevdiği Anahtar Kelimeler
  keywords: [
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

  // 4. WhatsApp, Facebook, Instagram Önizleme Ayarları (Open Graph)
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ersaticaret.com",
    title: "Ersa Ticaret | Yedek Parça Merkezi",
    description: "Kombi ve beyaz eşya yedek parçalarında toptan/perakende satış. Binlerce parça anında stoktan teslim.",
    siteName: "Ersa Ticaret",
    images: [
      {
        url: "/vitrin.jpg", 
        width: 1200,
        height: 630,
        alt: "Ersa Ticaret Mağaza Görünümü",
      },
    ],
  },

  // 5. Google Botlarına İzin Verme 
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      {/* Footer'ın her zaman en altta kalması için flex-col ve min-h-screen eklendi */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        
        <Header />
        
        {/* Sayfa içerikleri bu main etiketinin içinde yer alacak (flex-grow ile tüm boşluğu doldurur) */}
        <main className="flex-grow pt-16">
          {children}
        </main>
        
        {/* Sabit (Kayan) WhatsApp Butonu */}
        <a 
          href="https://wa.me/905525843073?text=Merhaba,%20bilgi%20almak%20istiyorum." 
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
        >
          <MessageCircle size={28} />
        </a>

        {/* YENİ VE ŞIK FOOTER BİLEŞENİMİZ */}
        <Footer />
        
      </body>
    </html>
  );
}