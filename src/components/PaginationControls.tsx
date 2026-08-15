import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  loading?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onLimitChange,
  loading = false,
}: PaginationControlsProps) {
  if (totalItems === 0 && !loading) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const btnBase =
    'inline-flex items-center justify-center rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-gray-100 dark:enabled:hover:bg-gray-700';

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {firstItem}
        </span>
        {' - '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {lastItem}
        </span>{' '}
        de <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span>{' '}
        resultado{totalItems !== 1 ? 's' : ''}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || loading}
          className={btnBase}
          aria-label="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage || loading}
          className={btnBase}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                page === currentPage
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'border border-border bg-white text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-1 text-gray-400 dark:text-gray-500">…</span>
          )}
          {totalPages > 5 && currentPage < totalPages - 1 && (
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          className={btnBase}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || loading}
          className={btnBase}
          aria-label="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {onLimitChange && (
          <label className="ml-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            Mostrar
            <CustomSelect
              value={String(itemsPerPage)}
              onChange={(id) => onLimitChange(Number(id))}
              options={PAGE_SIZE_OPTIONS.map((size) => ({ id: String(size), name: String(size) }))}
              searchable={false}
              disabled={loading}
              className="w-24"
            />
          </label>
        )}
      </div>
    </div>
  );
}