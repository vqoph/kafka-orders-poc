import type { ItemResponse } from '../../api/generatedApi';

type Translate = (key: string) => string;

export function nullableBool(
  value: boolean | null | undefined,
  t: Translate,
): string {
  if (value === true) return t('detail.true');
  if (value === false) return t('detail.false');
  return t('detail.null');
}

export function formatItemsSummary(
  items: ItemResponse[] | undefined,
  t: Translate,
): string {
  if (!items?.length) return t('itemsEmpty');
  return items.map((item) => `${item.sku} × ${item.quantity}`).join(', ');
}
