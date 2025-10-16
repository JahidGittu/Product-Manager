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

  return (
    <div
      className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border group hover:scale-[1.02] animate-fade-in"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {product.image && (
        <div
          className="mb-4 rounded-lg overflow-hidden h-48 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-muted)' }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {product.name}
        </h3>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-secondary-foreground)'
          }}
        >
          {product.category}
        </Badge>
      </div>

      <p className="text-2xl font-bold mb-3" style={{ color: 'var(--color-accent)' }}>
        ${product.price.toFixed(2)}
      </p>

      <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
        {product.description}
      </p>

      <div className="flex gap-2">
        <Button
          variant="accent"
          size="sm"
          onClick={() => router.push(`/products/${product.id}`)}
          className="hover:scale-105 transition-transform"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => router.push(`/products/${product.id}/edit`)}
          className="hover:scale-105 transition-transform"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="hover:scale-105 transition-transform"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
