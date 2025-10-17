'use client';

import ProtectedRoute from '@/app/routes/ProtectedRoute';
import ProductForm from '@/components/ProductForm';

export default function CreateProductPage() {
  return (
    <ProtectedRoute>
      <ProductForm />
    </ProtectedRoute>
  );
}
