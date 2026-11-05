import { PageShell } from '@poc/shared';
import { InventoryChaosPanel } from './chaos/InventoryChaosPanel';
import { StockList } from './stock/StockList';

export function InventoryPage() {
  return (
    <PageShell maxWidth="lg">
      <div className="grid gap-6 lg:grid-cols-2">
        <StockList />
        <InventoryChaosPanel />
      </div>
    </PageShell>
  );
}
