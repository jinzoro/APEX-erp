import * as React from 'react';
import { cn } from '@/lib/cn';
import { cva } from 'class-variance-authority';

const paginationVariants = cva(
  'flex flex-wrap items-center justify-center text-sm font-medium border border-slate-200 rounded-lg gap-1'
);

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
}

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  page: number | 'first' | 'prev' | 'next' | 'last' | 'ellipsis';
  label?: string;
  active?: boolean;
  disabled?: boolean;
  size?: 'default' | 'sm';
}

function PaginationButton({
  page,
  label,
  active,
  disabled,
  size = 'default',
}: PaginationButtonProps) {
  const pageLabel = label ?? (typeof page === 'number' ? String(page) : page.charAt(0).toUpperCase() + page.slice(1));
  return (
    <button
      onClick={() => {
        if (disabled || active) return;
        if (typeof page === 'number') {
          // handled by parent via onClick passing page
        }
      }}
      disabled={disabled || active}
      className={cn(
        'flex w-9 h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
        active ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900',
        disabled ? 'text-slate-300 border-slate-100' : '',
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
      )}
      aria-label={pageLabel}
    >
      {page === 'ellipsis' ? '…' : pageLabel}
    </button>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const range = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + boundaryCount * 2 + 3;
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > boundaryCount + 2;
    const showRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;

    const firstPages = Array.from({ length: boundaryCount }, (_, i) => i + 1);
    const lastPages = Array.from({ length: boundaryCount }, (_, i) => totalPages - boundaryCount + 1 + i);

    const middlePages = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );

    const result: Array<number | 'ellipsis'> = [];
    result.push(...firstPages);
    if (showLeftDots) result.push('ellipsis');
    result.push(...middlePages);
    if (showRightDots) result.push('ellipsis');
    result.push(...lastPages);
    return result;
  }, [currentPage, totalPages, siblingCount, boundaryCount]);

  return (
    <nav className={cn(paginationVariants(), className)} aria-label="Pagination">
      {showFirstLast && (
        <PaginationButton page="first" disabled={currentPage === 1} onClick={() => onPageChange(1)} />
      )}
      <PaginationButton
        page="prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      {range.map((item, i) => {
        if (item === 'ellipsis') {
          return <PaginationButton key={i} page="ellipsis" disabled />;
        }
        return (
          <PaginationButton
            key={i}
            page={item}
            active={item === currentPage}
            onClick={() => onPageChange(item)}
          />
        );
      })}
      <PaginationButton
        page="next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
      {showFirstLast && (
        <PaginationButton page="last" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} />
      )}
    </nav>
  );
}
