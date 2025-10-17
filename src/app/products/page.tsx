'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plus, PackageOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ModalConfirm } from '@/components/ModalConfirm';
import { useGetProductsQuery, useDeleteProductMutation, Product } from '@/store/productsApi';
import { useGetAllCategoriesQuery } from '@/store/categoriesApi';
import { toast } from 'react-toastify';
import ProtectedRoute from '../routes/ProtectedRoute';

const limit = 12; // number of products per page

const Products = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const offset = (page - 1) * limit;

  const { data: categories = [] } = useGetAllCategoriesQuery();

  // API query for products
  const { data: products = [], isLoading, error } = useGetProductsQuery({
    offset,
    limit,
    categoryId: categoryFilter || undefined,
  });

  const [deleteProduct] = useDeleteProductMutation();

  // search state can use a separate query or filter locally
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      toast.success('Product deleted successfully');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete product');
    }
  };

  useEffect(() => {
    if (error) toast.error('Failed to load products');
  }, [error]);

  // For pagination: API doesn't return total count, you may hardcode max pages or remove pagination
  const totalPages = Math.ceil(50 / limit); // assume max 50 products

  // Filter products by search locally (optional)
  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <ProtectedRoute>
      <div className="transition-colors min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Products</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isLoading
                  ? 'Loading products...'
                  : filteredProducts.length > 0
                  ? `${filteredProducts.length} products`
                  : 'No products available'}
              </p>
            </div>

            <Button
              variant="default"
              onClick={() => router.push('/products/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
            <div className="w-full">
              <SearchInput onSearch={handleSearch} placeholder="Search products by name..." />
            </div>

            <Select
              value={categoryFilter || 'all'}
              onValueChange={(value) => {
                setCategoryFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px] flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} onDelete={setDeleteId} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold text-primary mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? 'Try a different search term' : 'Get started by adding your first product'}
              </p>
              {!search && (
                <Button
                  variant="default"
                  onClick={() => router.push('/products/create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          )}
        </main>

        {/* Delete Modal */}
        <ModalConfirm
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
};

export default Products;
