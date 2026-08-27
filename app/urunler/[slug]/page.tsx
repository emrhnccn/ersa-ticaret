import { notFound } from 'next/navigation';
import { productService } from '@/server/catalog/product-service';
import { getSessionUser } from '@/server/auth/jwt';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 120; // 2 dakika boyunca CDN üzerinden anında sunulur

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const product = await productService.getProductBySlug(params.slug);
    if (!product) {
      return { title: 'Ürün Bulunamadı' };
    }

    const canonicalUrl = `https://www.ersaticaret.com/urunler/${params.slug}`;
    const productImg = product.images?.[0]?.url || 'https://www.ersaticaret.com/vitrin.png';
    const desc = `${product.name} - OEM Kodu: ${product.sku}. ${product.brand?.name ? `${product.brand.name} marka ` : ''}kombi ve beyaz eşya yedek parçası. Darıca Ersa Ticaret güvencesiyle aynı gün stoktan teslim ve anında fiyat danışma.`;

    return {
      title: `${product.name} (${product.sku})`,
      description: desc,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${product.name} | Ersa Ticaret`,
        description: desc,
        url: canonicalUrl,
        type: 'website',
        images: [
          {
            url: productImg,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} (${product.sku})`,
        description: desc,
        images: [productImg],
      },
    };
  } catch {
    return { title: 'Yedek Parça Detayı' };
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: any = null;

  try {
    const session = getSessionUser();
    const customerContext = session ? {
      userId: session.userId,
      companyId: session.companyId || undefined,
      customerGroupId: session.customerGroupId || undefined,
    } : null;

    product = await productService.getProductBySlug(params.slug, customerContext);
  } catch (error) {
    console.error('Product detail error:', error);
  }

  if (!product) {
    notFound();
  }

  const inStock = product.inStock !== false && (product.stockQty === undefined || product.stockQty > 0);
  const primaryImg = product.images?.[0]?.url || 'https://www.ersaticaret.com/vitrin.png';

  // 1. Product Structured Data Schema (Google Alışveriş ve Zengin Sonuçlar)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: any) => img.url) || [primaryImg],
    description: product.description || `${product.name} yedek parçası`,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Genel',
    },
    category: product.category?.name || 'Kombi ve Beyaz Eşya Yedek Parçaları',
    offers: {
      '@type': 'Offer',
      url: `https://www.ersaticaret.com/urunler/${product.slug}`,
      priceCurrency: 'TRY',
      price: product.priceQuote?.unitNetExVat || product.salePrice || 0,
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: 'Ersa Ticaret',
      },
    },
  };

  // 2. BreadcrumbList Schema (Google Arama Hiyerarşisi)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://www.ersaticaret.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Yedek Parça Kataloğu',
        item: 'https://www.ersaticaret.com/urunler',
      },
      ...(product.category ? [{
        '@type': 'ListItem',
        position: 3,
        name: product.category.name,
        item: `https://www.ersaticaret.com/urunler?category=${product.category.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: product.category ? 4 : 3,
        name: product.name,
        item: `https://www.ersaticaret.com/urunler/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}