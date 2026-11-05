import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  buttonClassName,
  DEFAULT_PAGE_SIZE,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  PaginationControls,
  Select,
  emitPocEvent,
  errorMessage,
  useTranslation,
} from '@poc/shared';
import { useListOrdersQuery } from '../../api/ordersApi';
import { formatItemsSummary } from '../detail/formatOrder';
import { SORT_MODES, toPageableSort, type SortMode } from './sortOrders';

const SORT_LABEL_KEYS: Record<SortMode, string> = {
  'date-desc': 'sortOptions.dateDesc',
  'date-asc': 'sortOptions.dateAsc',
  status: 'sortOptions.status',
};

export function OrdersList() {
  const { t } = useTranslation('orders');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortMode, setSortMode] = useState<SortMode>('date-desc');

  const { data, error, isLoading, isFetching, refetch } = useListOrdersQuery({
    page,
    size: pageSize,
    sort: [toPageableSort(sortMode)],
  });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const first = data?.first ?? true;
  const last = data?.last ?? true;

  return (
    <section className="space-y-4">
      <PageHeader
        title={t('title')}
        actions={
          <>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span>{t('sort')}</span>
              <Select
                value={sortMode}
                onChange={(e) => {
                  setSortMode(e.target.value as SortMode);
                  setPage(0);
                }}
              >
                {SORT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {t(SORT_LABEL_KEYS[mode])}
                  </option>
                ))}
              </Select>
            </label>
            <Button variant="secondary" onClick={() => void refetch()}>
              {t('refresh')}
            </Button>
            <Link to="new" className={buttonClassName('primary')}>
              {t('newOrder')}
            </Link>
          </>
        }
      />
      <div className="flex justify-end">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          first={first}
          last={last}
          pageSize={pageSize}
          disabled={isFetching}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
        />
      </div>
      {(isLoading || isFetching) && <LoadingText />}
      {error && <ErrorText>{errorMessage(error, t('loadFailed'))}</ErrorText>}
      {!isLoading && !error && orders.length === 0 && (
        <EmptyState>{t('empty')}</EmptyState>
      )}
      <ul className="space-y-2">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              to={order.id}
              onClick={() => emitPocEvent('poc:order-selected', { orderId: order.id })}
              className="block"
            >
              <ListCard interactive>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm text-accent">{order.id}</span>
                  <Badge>{order.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {t('listMeta', {
                    customerId: order.customerId,
                    amount: order.amount,
                  })}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {formatItemsSummary(order.items, t)}
                </p>
              </ListCard>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
