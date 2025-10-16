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
import { Header } from '@/components/Header';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ModalConfirm } from '@/components/ModalConfirm';
import { useGetProductsQuery, useDeleteProductMutation } from '@/store/productsApi';
import { useGetAllCategoriesQuery } from '@/store/categoriesApi';
import { toast } from 'react-toastify';

const Products = () => {
  const router = useRouter(); 
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: categories = [] } = useGetAllCategoriesQuery();
  const { data, isLoading, error } = useGetProductsQuery({ page, search, limit: 12, categoryId: categoryFilter });
  const [deleteProduct] = useDeleteProductMutation();

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
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to delete product');
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Failed to load products');
    }
  }, [error]);

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div className="bg-background transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
            <p className="text-muted-foreground">
              {data ? `${data.total} total products` : 'Loading...'}
            </p>
          </div>
          
          <Button
            variant="default"
            onClick={() => router.push('/products/create')}
            className="hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
          <div className="flex-1">
            <SearchInput onSearch={handleSearch} placeholder="Search products by name..." />
          </div>
          
          <Select value={categoryFilter} onValueChange={(value) => {
            setCategoryFilter(value === 'all' ? '' : value);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : data && data.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((product) => (
                <ProductCard key={product.id} product={product} onDelete={setDeleteId} />
              ))}
            </div>
            
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {search ? 'Try a different search term' : 'Get started by adding your first product'}
            </p>
            {!search && (
              <Button
                variant="default"
                onClick={() => router.push('/products/create')}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            )}
          </div>
        )}
      </main>
      
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
  );
};

export default Products;
