'use client';

import ProductForm from '@/components/ProductForm';
import ProtectedRoute from '@/app/routes/ProtectedRoute';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  if (!productId) return <p>Invalid product ID</p>;

  return (
    <ProtectedRoute>
      <ProductForm productId={productId} />
    </ProtectedRoute>
  );
}
