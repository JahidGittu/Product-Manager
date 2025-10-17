'use client';

import ProtectedRoute from '@/app/routes/ProtectedRoute';
import ProductForm from '@/components/ProductForm';

interface EditProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  return (
    <ProtectedRoute>
      <ProductForm productId={id} />
    </ProtectedRoute>
  );

}
