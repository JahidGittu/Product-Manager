'use client';

import { useState } from 'react';
import { FolderOpen, Layers } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useGetCategoriesQuery } from '@/store/categoriesApi';
import { toast } from 'react-toastify';
import { CategoryCard } from '@/components/CategoryCard';

const Categories = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useGetCategoriesQuery({ page, search, limit: 12 });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) toast.error('Failed to load categories');

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-8 w-8" style={{ color: 'var(--color-accent)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Categories
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            {data ? `${data.total} total categories` : 'Loading...'}
          </p>
        </div>

        <div className="mb-6 animate-fade-in">
          <SearchInput onSearch={handleSearch} placeholder="Search categories..." />
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : data && data.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.data.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <FolderOpen className="h-16 w-16 mb-4" style={{ color: 'var(--color-muted-foreground)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
              No categories found
            </h3>
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              {search ? 'Try a different search term' : 'No categories available'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Categories;
