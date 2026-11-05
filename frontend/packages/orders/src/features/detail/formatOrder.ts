import type { ItemResponse } from '../../api/generatedApi';

export function nullableBool(value?: boolean | null): string {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return 'null';
}

export function formatItemsSummary(items?: ItemResponse[]): string {
  if (!items?.length) return 'items: []';
  return items.map((item) => `${item.sku} × ${item.quantity}`).join(', ');
}
