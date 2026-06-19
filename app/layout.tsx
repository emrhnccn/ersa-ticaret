import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore
import './globals.css';
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import AnnouncementBar from '@/components/AnnouncementBar';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

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

  // Favicon
  icons: {
    icon: '/logo.png',
    apple: '/icon-192x192.png',
  },

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
        url: "/vitrin.png", 
        width: 1200,
        height: 630,
        alt: "Ersa Ticaret Mağaza Görünümü",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Ersa Ticaret | Yedek Parça Merkezi",
    description: "Kombi ve beyaz eşya yedek parçalarında toptan/perakende satış. Binlerce parça anında stoktan teslim.",
    images: ["/vitrin.png"],
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
        {/* SEPET VE BİLDİRİM SİSTEMİ */}
        <CartProvider>
          <ToastProvider>

            {/* ÜST BİLGİ BANDI (Telefon, Saat, Açık/Kapalı) */}
            <AnnouncementBar />
          
            <Header />
            
            {/* Sayfa içerikleri */}
            <main className="flex-grow">
              {children}
            </main>
            
            {/* Sabit (Kayan) WhatsApp Butonu - Gerçek WA İkonu + Pulse */}
            <a 
              href="https://wa.me/905525843073?text=Merhaba,%20bilgi%20almak%20istiyorum." 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp ile iletişime geçin"
              className="fixed bottom-6 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-emerald-600 transition-all duration-300 z-50 animate-wa-pulse"
            >
              {/* Gerçek WhatsApp SVG İkonu */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>

            {/* YENİ VE ŞIK FOOTER BİLEŞENİMİZ */}
            <Footer />

          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}