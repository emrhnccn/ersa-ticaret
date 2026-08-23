import { productService } from '@/server/catalog/product-service';
import { getSessionUser } from '@/server/auth/jwt';
import ProductCatalogClient from './ProductCatalogClient';
import type { Metadata } from 'next';

export const revalidate = 60; // 60 saniye boyunca Edge CDN üzerinden 20ms'de anında sunulur

export const metadata: Metadata = {
  title: 'Yedek Parça Kataloğu | Kombi Kartları & Beyaz Eşya Parçaları',
  description: 'Darıca Ersa Ticaret toptan ve perakende yedek parça kataloğu. Vaillant, Bosch, Demirdöküm, Arçelik kombi kartları, pompalar, vanalar ve servis ekipmanları.',
  alternates: {
    canonical: 'https://www.ersaticaret.com/urunler',
  },
  openGraph: {
    title: 'Yedek Parça Kataloğu | Ersa Ticaret',
    description: 'Kombi anakartları, beyaz eşya parçaları ve teknik servis malzemeleri.',
    url: 'https://www.ersaticaret.com/urunler',
    type: 'website',
  },
};

interface UrunlerPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    category?: string;
    brand?: string;
    inStock?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
    currency?: string;
  };
}

export default async function UrunlerPage({ searchParams }: UrunlerPageProps) {
  const session = getSessionUser();
  const customerContext = session ? {
    userId: session.userId,
    companyId: session.companyId || undefined,
    customerGroupId: session.customerGroupId || undefined,
  } : null;

  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const search = searchParams?.search || undefined;
  const categorySlug = searchParams?.category && searchParams.category !== 'Tümü' ? searchParams.category : undefined;
  const brandSlug = searchParams?.brand && searchParams.brand !== 'Tümü' ? searchParams.brand : undefined;
  const inStockOnly = searchParams?.inStock === 'true';
  const sortBy = searchParams?.sortBy || 'newest';
  const currency = searchParams?.currency || 'TRY';

  // 3 sorguyu sunucu tarafında 0 HTTP overhead ile paralel çek
  const [productsRes, categories, brands] = await Promise.all([
    productService.getProducts(
      {
        page,
        limit: 24,
        search,
        categorySlug,
        brandSlug,
        inStockOnly,
        sortBy,
        currency,
      },
      customerContext
    ),
    productService.getCategories(),
    productService.getBrands(),
  ]);

  const initialProducts = productsRes?.items || [];
  const initialPagination = productsRes?.pagination || {
    page: 1,
    limit: 24,
    total: initialProducts.length,
    totalPages: 1,
  };

  return (
    <ProductCatalogClient
      initialProducts={initialProducts}
      initialCategories={categories}
      initialBrands={brands}
      initialPagination={initialPagination}
      initialFilters={{
        search: search || '',
        category: searchParams?.category || 'Tümü',
        brand: searchParams?.brand || 'Tümü',
        inStock: inStockOnly,
        sortBy,
      }}
    />
  );
}