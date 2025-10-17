// src/app/products/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { Slider } from '@/components/ui/slider';
import { useGetProductsQuery, Product } from '@/store/productsApi';
import { useGetAllCategoriesQuery, Category } from '@/store/categoriesApi';
import { X, Menu } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const defaultPageSizeOptions = [10, 15, 20, 25, 30];

const Products = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params
  const categoryFromQuery = searchParams.get('category') || '';

  // State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(categoryFromQuery);
  const [sortOption, setSortOption] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: productsData, isLoading, isError } = useGetProductsQuery({ offset: 0, limit: 1000 });
  const allProducts: Product[] = productsData?.data || [];
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const categories: Category[] = categoriesData || [];

  console.log('products page data all products' , productsData)

  // Sync categoryFilter with URL query param
  useEffect(() => {
    setCategoryFilter(categoryFromQuery);
  }, [categoryFromQuery]);

  // Filter + Sort
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? p.category?.id === categoryFilter : true;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'top':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'lowHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'highLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }

    return filtered;
  }, [allProducts, search, categoryFilter, priceRange, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const displayedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, page, perPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">

      {/* Top Header */}
      <div className="sticky top-15 py-10 z-30 bg-background p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-card border rounded-xl p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/products/create')} className="px-5 py-2">Add Product</Button>
          <Button
            variant="outline"
            className="md:flex lg:hidden items-center gap-1 px-3 py-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} /> Filters
          </Button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] gap-6 relative">

        {/* Sidebar */}
        <aside className={`bg-card shadow-md p-4 z-40 transition-transform duration-300 lg:translate-x-0 lg:rounded-2xl lg:sticky lg:top-50 lg:h-fit
          ${sidebarOpen ? 'fixed h-full top-0 left-0 w-64 translate-x-0' : 'hidden lg:block'}`}>

          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-xl font-semibold">Filters</h2>
            <Button variant="ghost" onClick={() => setSidebarOpen(false)}>
              <X />
            </Button>
          </div>

          <div className="space-y-6 sticky top-6">

            {/* Search */}
            <div>
              <label className="block mb-2 font-medium">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Add Product */}
            <div>
              <Button onClick={() => router.push('/products/create')} className="w-full">
                Add Product
              </Button>
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 font-medium">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                  router.push(e.target.value ? `/products?category=${e.target.value}` : '/products');
                }}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block mb-2 font-medium">Price Range</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-1/2 border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  min={0}
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-1/2 border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  max={10000}
                />
              </div>
              <Slider
                value={priceRange}
                min={0}
                max={10000}
                step={10}
                onValueChange={(val: [number, number]) => setPriceRange(val)}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block mb-2 font-medium">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="default">Default</option>
                <option value="top">Top Products</option>
                <option value="newest">New Products</option>
                <option value="lowHigh">Price: Low to High</option>
                <option value="highLow">Price: High to Low</option>
              </select>
            </div>

            {/* Per Page */}
            <div>
              <label className="block mb-2 font-medium">Products Per Page</label>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(+e.target.value); setPage(1); }}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {defaultPageSizeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Product Grid */}
        <main className="flex-1 flex flex-col gap-6 w-full">
          {isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <p className="text-center text-red-500 mt-12">Failed to load products.</p>
          ) : displayedProducts.length === 0 ? (
            <p className="text-center text-muted-foreground mt-12">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onDelete={() => { }} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center flex-wrap gap-4">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
