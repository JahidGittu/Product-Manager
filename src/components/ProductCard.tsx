'use client';

import { Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/store/productsApi';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onDelete }: ProductCardProps) => {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);

  // Safety: যদি images না থাকে বা empty string থাকে
  const images: string[] =
    product.images && product.images.length
      ? product.images.map((img) => img?.trim() || '/placeholder.jpg')
      : ['/placeholder.jpg'];

  const categoryName = product.category?.name || 'Uncategorized';

  // Hover করলে পরবর্তী ইমেজ দেখাবে
  const handleHover = () => {
    if (images.length > 1) {
      setImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border group hover:scale-[1.02] animate-fade-in bg-card flex flex-col h-full overflow-hidden relative cursor-pointer"
      onMouseEnter={handleHover}
    >
      {/* Image */}
      <div className="mb-4 rounded-lg overflow-hidden h-48 flex items-center justify-center relative">
        {images[imageIndex] ? (
          <img
            src={images[imageIndex]}
            alt={product.name || 'Product Image'}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2">
          {categoryName}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-semibold w-full mb-2 line-clamp-2">
          {product.name || 'Unnamed Product'}
        </h3>
        <p className="text-2xl font-bold mb-2">
          ${product.price != null ? product.price.toFixed(2) : '0.00'}
        </p>
        <p className="text-sm line-clamp-3">
          {product.description || 'No description available.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 flex-none border-t border-border pt-4">
        <Button
          variant="accent"
          size="sm"
          onClick={() => router.push(`/products/${product.slug}`)}
          className="hover:scale-105 transition-transform flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => router.push(`/products/edit/${product.slug}`)}
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
