import type { PageMetadata, PageResponse } from './types';

/**
 * UI-oriented view of a Spring Data {@code PagedModel} response.
 * Derives {@code first}/{@code last}/{@code empty} the way {@code Page} does
 * (those flags are not part of the stable VIA_DTO JSON).
 */
export type PagedView<T> = {
  content: T[];
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

/** Same semantics as Spring Data {@code Page#isFirst()}. */
export function isFirstPage(page: Pick<PageMetadata, 'number' | 'totalPages'>): boolean {
  return page.totalPages === 0 || page.number <= 0;
}

/** Same semantics as Spring Data {@code Page#isLast()}. */
export function isLastPage(page: Pick<PageMetadata, 'number' | 'totalPages'>): boolean {
  return page.totalPages === 0 || page.number >= page.totalPages - 1;
}

/**
 * Normalizes an optional {@code PagedModel} JSON body for list UIs.
 * @see org.springframework.data.web.PagedModel
 */
export function fromPagedModel<T>(
  data: PageResponse<T> | null | undefined,
): PagedView<T> {
  const content = data?.content ?? [];
  const totalPages = data?.page?.totalPages ?? 0;
  const pageNumber = data?.page?.number ?? 0;
  const pageSize = data?.page?.size ?? 0;
  const totalElements = data?.page?.totalElements ?? 0;
  const meta = { number: pageNumber, totalPages };

  return {
    content,
    totalPages,
    pageNumber,
    pageSize,
    totalElements,
    first: isFirstPage(meta),
    last: isLastPage(meta),
    empty: content.length === 0,
  };
}
