'use client';

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { X, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import ProtectedRoute from '@/app/routes/ProtectedRoute';

import { LocalProduct, getLocalProducts, deleteLocalProduct } from '@/lib/localProducts';

const DELETED_KEY = 'deletedProducts_v1';
const DEFAULT_PAGE_SIZES = [10, 15, 20, 25, 30];

// -------------------- Utilities --------------------
const getDeletedIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
  } catch {
    return [];
  }
};

const addDeletedId = (id: string) => {
  const ids = getDeletedIds();
  if (!ids.includes(id)) {
    localStorage.setItem(DELETED_KEY, JSON.stringify([...ids, id]));
  }
};

// -------------------- Main Component --------------------
const MyProductsPage = () => {
  const router = useRouter();

  // ---------- States ----------
  const [products, setProducts] = useState<(LocalProduct & { category: { id: string; name: string } })[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(12);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortOption, setSortOption] = useState<'default' | 'lowHigh' | 'highLow'>('default');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // ---------- Read category query param safely ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setCategoryFilter(params.get('category') || '');
    setPage(1);
  }, []);

  // ---------- Load products from localStorage ----------
  useEffect(() => {
    const localProducts = getLocalProducts().map((p) => ({
      ...p,
      category: { id: p.categoryId, name: 'Unknown' },
    }));
    setProducts(localProducts);
  }, []);

  const deletedIds = useMemo(() => getDeletedIds(), []);

  // ---------- Filter & Sort ----------
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (deletedIds.includes(p.id)) return false;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? p.category.id === categoryFilter : true;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortOption === 'lowHigh') filtered.sort((a, b) => a.price - b.price);
    else if (sortOption === 'highLow') filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, deletedIds, search, categoryFilter, priceRange, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);

  const displayedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, page, perPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- Delete Product ----------
  const handleDelete = async (product: LocalProduct) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete your product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      deleteLocalProduct(product.id);
      addDeletedId(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success('✅ Product deleted successfully!');
    } catch (err) {
      console.error('Delete Error:', err instanceof Error ? err.message : err);
      toast.error('❌ Failed to delete product.');
    }
  };

  // ---------- JSX ----------
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-8">
        {/* Header */}
        <div className="sticky top-16 py-10 z-30 bg-background p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
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
          <aside
            className={`bg-card shadow-md p-4 z-40 transition-transform duration-300 lg:translate-x-0 lg:rounded-2xl lg:sticky lg:top-16 lg:h-fit
            ${sidebarOpen ? 'fixed h-full top-0 left-0 w-64 translate-x-0' : 'hidden lg:block'}`}
          >
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button variant="ghost" onClick={() => setSidebarOpen(false)}><X /></Button>
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
                <Button onClick={() => router.push('/products/create')} className="w-full">Add Product</Button>
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
                  onChange={(e) => setSortOption(e.target.value as 'default' | 'lowHigh' | 'highLow')}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="default">Default</option>
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
                  {DEFAULT_PAGE_SIZES.map((opt) => (
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
            {displayedProducts.length === 0 ? (
              <div className="flex justify-center items-center h-60">
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onDelete={() => handleDelete(product)}
                    />
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
    </ProtectedRoute>
  );
};

export default MyProductsPage;
