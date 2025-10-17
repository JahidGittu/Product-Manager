'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useGetProductsQuery } from '@/store/productsApi';
import { X, Heart, ArrowRight, CircleArrowOutUpLeft } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import ProductDetailsSkeleton from '@/components/ProductDetailsSkeleton';

const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: productsData, isLoading, isError } = useGetProductsQuery({ offset: 0, limit: 1000 });
  const product = productsData?.data.find(p => p.id === productId);

  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);

  // Load like state from localStorage
  useEffect(() => {
    if (!productId) return;
    const likedProducts = JSON.parse(localStorage.getItem('likedProducts') || '[]') as string[];
    setLiked(likedProducts.includes(productId));
  }, [productId]);

  const toggleLike = () => {
    const likedProducts = JSON.parse(localStorage.getItem('likedProducts') || '[]') as string[];
    if (liked) {
      // unlike
      const updated = likedProducts.filter(id => id !== productId);
      localStorage.setItem('likedProducts', JSON.stringify(updated));
      setLiked(false);
    } else {
      // like
      likedProducts.push(productId);
      localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
      setLiked(true);
    }
  };

  const sameCategoryProducts = useMemo(() => {
    if (!product || !productsData) return [];
    return productsData.data
      .filter(p => p.category?.id === product.category?.id && p.id !== product.id)
      .slice(0, 4);
  }, [product, productsData]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleting(true);
    try {
      // await deleteProduct(productId);
      toast.success('Product deleted successfully!');
      router.push('/products');
    } catch (error) {
      toast.error('Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return <ProductDetailsSkeleton />;
  if (isError) return <p className="text-center text-red-500 mt-12">Failed to load product.</p>;
  if (!product) return <p className="text-center mt-12 text-muted-foreground">Product not found.</p>;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl bg-card mx-auto rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-12">

        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-2xl shadow-md"
          />
          <div className="flex gap-4 overflow-x-auto">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name}-${idx}`}
                className="w-24 h-24 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl text-accent font-bold mb-2">{product.name}</h1>
              <Button  size="sm" variant="secondary" onClick={() => router.push('/products')}>
                <CircleArrowOutUpLeft /> All Products 
              </Button>
            </div>

            <p className="mb-2">
              Category: <span className="font-medium">{product.category?.name || 'No Category'}</span>
            </p>
            <p className="text-2xl font-semibold mb-4">${product.price}</p>
            <p className="mb-6">{product.description || 'No description available.'}</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={toggleLike}
              variant={liked ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              <Heart size={18} /> {liked ? 'Liked' : 'Like'}
            </Button>
            <Button onClick={() => router.push(`/products/edit/${product.id}`)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>

          {/* See All in This Category */}
          {product.category?.id && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 mt-4"
              onClick={() => router.push(`/products?category=${product.category.id}`)}
            >
              See All in {product.category.name} <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {sameCategoryProducts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">More from {product.category?.name}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sameCategoryProducts.map(p => (
              <ProductCard key={p.id} product={p} onDelete={() => { }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
