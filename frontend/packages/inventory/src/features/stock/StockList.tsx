import { Link } from 'react-router-dom';
import {
  Button,
  buttonClassName,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  errorMessage,
  useTranslation,
} from '@poc/shared';
import { useDeleteStockMutation, useListStockQuery } from '../../api/inventoryApi';

export function StockList() {
  const { t } = useTranslation('inventory');
  const {
    data: stock = [],
    error: stockError,
    isLoading: stockLoading,
    isFetching: stockFetching,
  } = useListStockQuery();
  const [deleteStock, { error: deleteError }] = useDeleteStockMutation();

  const onDelete = async (sku: string) => {
    if (!window.confirm(t('deleteConfirm', { sku }))) return;
    try {
      await deleteStock({ sku }).unwrap();
    } catch {
      // surfaced via deleteError
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title={t('title')}
        actions={
          <Link to="new" className={buttonClassName('primary')}>
            {t('newProduct')}
          </Link>
        }
      />
      {(stockLoading || stockFetching) && <LoadingText />}
      {stockError && (
        <ErrorText>{errorMessage(stockError, t('loadFailed'))}</ErrorText>
      )}
      {deleteError && (
        <ErrorText>{errorMessage(deleteError, t('form.deleteFailed'))}</ErrorText>
      )}
      {!stockLoading && stock.length === 0 && !stockError && (
        <EmptyState>{t('empty')}</EmptyState>
      )}
      <ul className="space-y-2">
        {stock.map((item) => (
          <li key={item.sku}>
            <ListCard>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-accent">{item.sku}</span>
                  <span className="text-sm text-foreground">
                    {t('qty', { quantity: item.quantity })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`edit/${encodeURIComponent(item.sku)}`}
                    className={buttonClassName('secondary')}
                  >
                    {t('edit')}
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={() => void onDelete(item.sku)}
                    className="text-muted hover:border-danger hover:text-danger"
                  >
                    {t('delete')}
                  </Button>
                </div>
              </div>
            </ListCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
