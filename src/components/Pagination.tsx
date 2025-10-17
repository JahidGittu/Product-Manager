import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const createPageArray = () => {
    const pages: (number | 'dots')[] = [];
    const startPage = Math.max(2, currentPage - siblingCount);
    const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

    pages.push(1);

    if (startPage > 2) pages.push('dots');

    for (let i = startPage; i <= endPage; i++) pages.push(i);

    if (endPage < totalPages - 1) pages.push('dots');

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = createPageArray();

  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      {/* Previous */}
      <Button
        variant="default"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === 'dots' ? (
          <span key={idx} className="px-2 text-muted-foreground select-none">...</span>
        ) : (
          <Button
            key={idx}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={page === currentPage ? 'bg-primary text-white hover:bg-primary/90' : ''}
          >
            {page}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        variant="default"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
