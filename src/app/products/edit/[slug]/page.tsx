'use client';

import ProductForm from '@/components/ProductForm';
import ProtectedRoute from '@/app/routes/ProtectedRoute';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const productSlug = params.slug as string;

  if (!productSlug) return <p>Invalid product slug</p>;

  return (
    <ProtectedRoute>
      <ProductForm productSlug={productSlug} />
    </ProtectedRoute>
  );
}
