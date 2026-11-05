import type { OrderResponse } from '../../api/generatedApi';

export type SortMode = 'date-asc' | 'date-desc' | 'status';

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'date-desc', label: 'date desc' },
  { value: 'date-asc', label: 'date asc' },
  { value: 'status', label: 'status' },
];

export function compareOrders(a: OrderResponse, b: OrderResponse, mode: SortMode): number {
  if (mode === 'status') {
    return a.status.localeCompare(b.status);
  }
  const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
  const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
  return mode === 'date-asc' ? aTime - bTime : bTime - aTime;
}
