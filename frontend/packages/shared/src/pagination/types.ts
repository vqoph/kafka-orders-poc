/**
 * Minimal TypeScript port of Spring Data {@code Pageable} query params.
 * @see org.springframework.data.domain.Pageable
 */
export type PageableParams = {
  page?: number;
  size?: number;
  sort?: string | string[];
};

/**
 * Minimal TypeScript port of Spring Data {@code Page<T>} JSON body.
 * @see org.springframework.data.domain.Page
 */
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [8, 16, 24, 48] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
