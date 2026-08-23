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

    return {
      title: `${product.name} (${product.sku})`,
      description: `${product.sku} kodlu ${product.name} yedek parçası. Darıca Ersa Ticaret güvencesiyle stoktan anında teslim.`,
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

  return <ProductDetailClient product={product} />;
}