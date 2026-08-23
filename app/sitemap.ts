import { MetadataRoute } from 'next';
import { prisma } from '@/server/db';
import { products as fallbackProducts, blogPosts } from '@/lib/data';

export const revalidate = 43200; // 12 saatte bir sitemap'i otomatik yenile

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ersaticaret.com';

  // 1. Sabit Ana ve Kurumsal Sayfalar
  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/urunler`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.95 },
    { url: `${baseUrl}/kurumsal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/hizmetler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/b2b-basvuru`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/rehber`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
  ];

  // 2. Gerçek Veritabanı Ürünleri (Tüm 3600+ parça kataloğu)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 45000,
    });

    if (dbProducts.length > 0) {
      productEntries = dbProducts.map((p) => ({
        url: `${baseUrl}/urunler/${p.slug}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
    }
  } catch (err) {
    console.warn('[Sitemap] Database products query failed, using fallback:', err);
  }

  // Veritabanı sorgusu boşsa fallback ürünleri ekle
  if (productEntries.length === 0) {
    productEntries = fallbackProducts.map((product) => ({
      url: `${baseUrl}/urunler/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));
  }

  // 3. Dinamik Rehber / Blog Sayfaları
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/rehber/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...productEntries, ...blogUrls];
}