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
 * Minimal TypeScript port of Spring Data {@code PagedModel<T>} JSON body
 * ({@code pageSerializationMode = VIA_DTO}).
 * @see org.springframework.data.web.PagedModel
 */
export type PageMetadata = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type PageResponse<T> = {
  content: T[];
  page: PageMetadata;
};

export const DEFAULT_PAGE_SIZE = 8;

export const PAGE_SIZE_OPTIONS = [8, 16, 24, 48] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
