import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  buildPageItems,
  type PageSizeOption,
} from '../../pagination';
import { Select } from '../atoms/Select';

export type PaginationControlsProps = {
  page: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  disabled?: boolean;
  className?: string;
};

const pageButtonClass = (active: boolean) =>
  clsx(
    'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-xs transition',
    active
      ? 'bg-accent font-medium text-on-accent'
      : 'text-foreground hover:bg-panel-muted disabled:pointer-events-none',
  );

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-3.5">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-3.5">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaginationControls({
  page,
  totalPages,
  first,
  last,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  disabled = false,
  className,
}: PaginationControlsProps) {
  const { t } = useTranslation('common');
  const pageItems = buildPageItems(page, totalPages);
  const prevDisabled = disabled || first || totalPages <= 0;
  const nextDisabled = disabled || last || totalPages <= 0;

  return (
    <div className={clsx('flex flex-wrap items-center gap-2 pt-2', className)}>
      <nav
        className="inline-flex items-center gap-0.5"
        aria-label={t('pagination.navLabel')}
      >
        <button
          type="button"
          aria-label={t('pagination.prev')}
          className={clsx(pageButtonClass(false), prevDisabled && 'invisible')}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={prevDisabled}
        >
          <ChevronLeftIcon />
        </button>

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-0.5 text-xs text-muted"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              aria-label={t('pagination.page', { page: item + 1 })}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={pageButtonClass(item === page)}
            >
              {item + 1}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label={t('pagination.next')}
          className={clsx(pageButtonClass(false), nextDisabled && 'invisible')}
          onClick={() => onPageChange(page + 1)}
          disabled={nextDisabled}
        >
          <ChevronRightIcon />
        </button>
      </nav>

      {onPageSizeChange && (
        <label className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span>{t('pagination.pageSize')}</span>
          <Select
            value={pageSize}
            disabled={disabled}
            className="h-7 cursor-pointer py-0 text-xs"
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value) as PageSizeOption);
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
      )}
    </div>
  );
}
