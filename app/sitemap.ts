import { MetadataRoute } from 'next';
import { products, blogPosts } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ersaticaret.com'; // Canlıya çıkınca gerçek domain yazılacak

  // Sabit Sayfalar
  const routes = ['', '/urunler', '/rehber', '/iletisim'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dinamik Ürün Sayfaları
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/urunler/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Dinamik Rehber Sayfaları
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/rehber/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...productUrls, ...blogUrls];
}