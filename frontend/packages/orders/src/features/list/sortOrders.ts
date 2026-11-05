export type SortMode = 'date-asc' | 'date-desc' | 'status';

export const SORT_MODES: SortMode[] = ['date-desc', 'date-asc', 'status'];

/** Maps UI sort modes to Spring Data {@code Pageable} {@code sort} query values. */
export function toPageableSort(mode: SortMode): string {
  switch (mode) {
    case 'date-asc':
      return 'createdAt,asc';
    case 'status':
      return 'status,asc';
    case 'date-desc':
    default:
      return 'createdAt,desc';
  }
}
