'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Heart, ArrowRight, CircleArrowOutUpLeft } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import Swal from 'sweetalert2';

import {
  useGetProductQuery,
  useGetProductsQuery,
  useDeleteProductMutation,
  productsApi,
  Product,
} from '@/store/productsApi';
import { ProductCard } from '@/components/ProductCard';
import ProductDetailsSkeleton from '@/components/ProductDetailsSkeleton';

const ZOOM_FACTOR = 2.6;
const LENS_SIZE = 200;
const LIKES_KEY = 'likedProducts_v1';
const DELETED_KEY = 'deletedProducts_v1';

// ---------- 🔥 Deleted Products Utilities ----------
const getDeletedProducts = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
  } catch {
    return [];
  }
};

const markProductDeleted = (id: string) => {
  const deleted = getDeletedProducts();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  }
};

// ---------- 🔥 Custom Hook: Delete with SweetAlert + RTK Cache Update ----------
function useProductDelete(product?: Product) {
  const [deleteProduct] = useDeleteProductMutation();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!product) {
      toast.error('Product not found!');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will remove the product from view!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setDeleting(true);

    try {
      // ✅ Call API
      await deleteProduct(product.id).unwrap();

      // ✅ Update RTK cache
      productsApi.util.updateQueryData(
        'getProducts',
        { offset: 0, limit: 1000 },
        (draft) => {
          if (!draft?.data) return;
          draft.data = draft.data.filter((p) => p.id !== product.id);
          draft.total = draft.data.length;
        }
      );

      // ✅ Track deleted product locally
      markProductDeleted(product.id);

      Swal.fire({
        title: 'Deleted!',
        text: 'Product has been removed from view.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      router.push('/products');
    } catch (err: any) {
      console.error('Delete Error:', err);
      Swal.fire('Error!', err?.data?.message || 'Failed to delete product.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return { handleDelete, deleting };
}

// ---------- 🏗️ Main Component ----------
export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const { data: product, isLoading, isError } = useGetProductQuery(
    productSlug ? { slug: productSlug } : skipToken
  );

  const { data: similarProductsData } = useGetProductsQuery(
    product?.category?.id ? { offset: 0, limit: 8, categoryId: product.category.id } : skipToken
  );

  const { handleDelete, deleting } = useProductDelete(product);

  // ---------- ❤️ Like System ----------
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!product) return;
    try {
      const likes = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
      const entry = likes[product.id] || { liked: false, count: 0 };
      setLiked(entry.liked);
      setLikeCount(entry.count);
    } catch {}
  }, [product]);

  const toggleLike = () => {
    if (!product) return;
    const likes = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
    const prev = likes[product.id] || { liked: false, count: 0 };
    const next = {
      liked: !prev.liked,
      count: prev.liked ? Math.max(0, prev.count - 1) : prev.count + 1,
    };
    likes[product.id] = next;
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    setLiked(next.liked);
    setLikeCount(next.count);
    toast[next.liked ? 'success' : 'info'](
      next.liked ? 'You liked this product!' : 'Removed like ❤️'
    );
  };

  // ---------- 🔍 Zoom States ----------
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setActiveIndex(0), [product?.id]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const half = LENS_SIZE / 2;

    const clampedX = Math.max(half, Math.min(rect.width - half, x));
    const clampedY = Math.max(half, Math.min(rect.height - half, y));

    setLensPos({ x: clampedX, y: clampedY });
  };

  const lensStyle = (): React.CSSProperties => {
    const imgSrc = product?.images?.[activeIndex];
    const el = containerRef.current;
    if (!el || !imgSrc) return {};
    const rect = el.getBoundingClientRect();
    const rx = lensPos.x / rect.width;
    const ry = lensPos.y / rect.height;
    const bgWidth = rect.width * ZOOM_FACTOR;
    const bgHeight = rect.height * ZOOM_FACTOR;
    const bgPosX = rx * bgWidth - LENS_SIZE / 2;
    const bgPosY = ry * bgHeight - LENS_SIZE / 2;

    return {
      position: 'absolute',
      pointerEvents: 'none',
      width: `${LENS_SIZE}px`,
      height: `${LENS_SIZE}px`,
      left: `${lensPos.x - LENS_SIZE / 2}px`,
      top: `${lensPos.y - LENS_SIZE / 2}px`,
      backgroundImage: `url("${imgSrc}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${bgWidth}px ${bgHeight}px`,
      backgroundPosition: `-${bgPosX}px -${bgPosY}px`,
      borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.95)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      zIndex: 20,
    };
  };

  if (!productSlug)
    return <p className="text-center mt-12 text-red-500">Invalid product URL.</p>;
  if (isLoading) return <ProductDetailsSkeleton />;
  if (isError)
    return <p className="text-center text-red-500 mt-12">Failed to load product.</p>;
  if (!product)
    return <p className="text-center mt-12 text-muted-foreground">Product not found.</p>;

  const deletedProducts = getDeletedProducts();

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl bg-card mx-auto rounded-3xl shadow-xl overflow-hidden md:grid md:grid-cols-2 gap-8 p-6 md:p-12">
        {/* LEFT: Image Zoom Section */}
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative w-full bg-muted rounded-2xl overflow-hidden"
            style={{ minHeight: 420 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowLens(true)}
            onMouseLeave={() => setShowLens(false)}
          >
            <img
              src={product.images[activeIndex]}
              alt={product.name}
              className="w-full h-[420px] object-cover rounded-2xl select-none"
              draggable={false}
            />
            {showLens && <div style={lensStyle()} />}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto items-center py-2">
            {product.images.map((src: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`shrink-0 rounded-xl overflow-hidden transition-transform ${
                  idx === activeIndex
                    ? 'scale-105 ring-2 ring-primary'
                    : 'hover:scale-[1.03]'
                }`}
                style={{ width: 96, height: 72 }}
              >
                <img
                  src={src}
                  alt={`${product.name}-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-accent">{product.name}</h1>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push('/products')}
              >
                <CircleArrowOutUpLeft /> All Products
              </Button>
            </div>

            <p className="mb-2">
              Category:{' '}
              <span className="font-medium">
                {product.category?.name || 'No Category'}
              </span>
            </p>
            <p className="text-2xl font-semibold mb-4">${product.price}</p>
            <p className="mb-6 text-sm leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-3 pt-4 border-t">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={toggleLike}
                variant={liked ? 'destructive' : 'default'}
                className="flex items-center gap-2"
              >
                <Heart size={18} /> {liked ? 'Liked' : 'Like'} ({likeCount})
              </Button>

              <Button onClick={() => router.push(`/products/edit/${product.slug}`)}>
                Edit
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>

            {product.category?.id && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() =>
                  router.push(`/products?category=${product.category.id}`)
                }
              >
                See All in {product.category.name} <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProductsData?.data?.length ? (
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">
            More from {product.category?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProductsData.data
              .filter((p) => p.id !== product.id && !deletedProducts.includes(p.id))
              .map((p: Product) => (
                <ProductCard key={p.id} product={p} onDelete={() => {}} />
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
