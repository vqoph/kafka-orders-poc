export type PageItem = number | 'ellipsis';

/**
 * Builds a compact page index list for UI (0-based page numbers).
 * Near start: 0, 1, 2, 3, 'ellipsis', 9
 * Near middle: 0, 'ellipsis', 5, 6, 7, 'ellipsis', 9
 */
export function buildPageItems(
  page: number,
  totalPages: number,
  siblingCount = 1,
): PageItem[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const current = Math.min(Math.max(page, 0), totalPages - 1);
  const pages = new Set<number>();
  const nearStart = current <= 3;
  const nearEnd = current >= totalPages - 4;

  if (nearStart) {
    for (let index = 0; index <= 3; index += 1) {
      pages.add(index);
    }
    pages.add(totalPages - 1);
  } else if (nearEnd) {
    pages.add(0);
    for (let index = totalPages - 4; index < totalPages; index += 1) {
      pages.add(index);
    }
  } else {
    pages.add(0);
    pages.add(totalPages - 1);
    for (
      let index = current - siblingCount;
      index <= current + siblingCount;
      index += 1
    ) {
      pages.add(index);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index]!;
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous > 1) {
      items.push('ellipsis');
    }
    items.push(value);
  }

  return items;
}
