import { notFound } from 'next/navigation';
import { productService } from '@/server/catalog/product-service';
import { getSessionUser } from '@/server/auth/jwt';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await productService.getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Ürün Bulunamadı | Ersa Ticaret' };
  }

  return {
    title: `${product.name} | Ersa Ticaret`,
    description: `${product.sku} kodlu ${product.name} yedek parçası. Darıca Ersa Ticaret güvencesiyle stoktan anında teslim.`,
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const session = getSessionUser();
  const customerContext = session ? {
    userId: session.userId,
    companyId: session.companyId || undefined,
    customerGroupId: session.customerGroupId || undefined,
  } : null;

  const product = await productService.getProductBySlug(params.slug, customerContext);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}