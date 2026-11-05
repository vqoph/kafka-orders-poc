import {
  Button,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  errorMessage,
  useTranslation,
} from '@poc/shared';
import { useListStockQuery } from '../../api/inventoryApi';

export function StockList() {
  const { t } = useTranslation('inventory');
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
        title={t('stock')}
        actions={
          <Button variant="secondary" onClick={() => void refetchStock()}>
            {t('refresh')}
          </Button>
        }
      />
      {(stockLoading || stockFetching) && <LoadingText />}
      {stockError && (
        <ErrorText>{errorMessage(stockError, t('loadFailed'))}</ErrorText>
      )}
      {!stockLoading && stock.length === 0 && !stockError && (
        <EmptyState>{t('empty')}</EmptyState>
      )}
      <ul className="space-y-2">
        {stock.map((item) => (
          <li key={item.sku}>
            <ListCard>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-accent">{item.sku}</span>
                <span className="text-sm text-foreground">
                  {t('qty', { quantity: item.quantity })}
                </span>
              </div>
            </ListCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
