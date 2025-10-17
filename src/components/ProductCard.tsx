'use client';

import { Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/store/productsApi';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onDelete }: ProductCardProps) => {
  const router = useRouter();
  const previewImage = product.images?.[0];

  return (
    <div className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border group hover:scale-[1.02] animate-fade-in bg-card flex flex-col h-full overflow-hidden">

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Image */}
        {previewImage && (
          <div className="mb-4 rounded-lg overflow-hidden h-48 flex items-center justify-center">
            <img
              src={previewImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        {/* Title + Category */}
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          {product.category?.name && (
            <Badge variant="secondary">{product.category.name}</Badge>
          )}
        </div>

        {/* Price */}
        <p className="text-2xl font-bold mb-3">${product.price.toFixed(2)}</p>

        {/* Description */}
        <p className="text-sm line-clamp-2">{product.description}</p>
      </div>

      {/* Action Buttons (Footer) */}
      <div className="flex gap-2 mt-4 flex-none border-t border-border pt-4">
        <Button
          variant="accent"
          size="sm"
          onClick={() => router.push(`/products/${product.id}`)}
          className="hover:scale-105 transition-transform flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => router.push(`/products/${product.id}/edit`)}
          className="hover:scale-105 transition-transform flex-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="hover:scale-105 transition-transform flex-1"
        >
          <Trash2 className="h-4 w-4 mr-1" />
        </Button>
      </div>
    </div>
  );
};
