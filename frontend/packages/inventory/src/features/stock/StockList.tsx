import {
  Button,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  errorMessage,
} from '@poc/shared';
import { useListStockQuery } from '../../api/inventoryApi';

export function StockList() {
  const {
    data: stock = [],
    error: stockError,
    isLoading: stockLoading,
    isFetching: stockFetching,
    refetch: refetchStock,
  } = useListStockQuery();

  return (
    <section className="space-y-4">
      <PageHeader
        title="Stock"
        actions={
          <Button variant="secondary" onClick={() => void refetchStock()}>
            Refresh
          </Button>
        }
      />
      {(stockLoading || stockFetching) && <LoadingText />}
      {stockError && (
        <ErrorText>{errorMessage(stockError, 'Failed to load inventory')}</ErrorText>
      )}
      {!stockLoading && stock.length === 0 && !stockError && (
        <EmptyState>No stock rows returned.</EmptyState>
      )}
      <ul className="space-y-2">
        {stock.map((item) => (
          <li key={item.sku}>
            <ListCard>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-accent">{item.sku}</span>
                <span className="text-sm text-foreground">qty {item.quantity}</span>
              </div>
            </ListCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
