import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  buttonClassName,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  Select,
  emitPocEvent,
  errorMessage,
} from '@poc/shared';
import { useListOrdersQuery } from '../../api/ordersApi';
import { formatItemsSummary } from '../detail/formatOrder';
import { SORT_OPTIONS, compareOrders, type SortMode } from './sortOrders';

export function OrdersList() {
  const { data: orders = [], error, isLoading, isFetching, refetch } =
    useListOrdersQuery();
  const [sortMode, setSortMode] = useState<SortMode>('date-desc');

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => compareOrders(a, b, sortMode)),
    [orders, sortMode],
  );

  return (
    <section className="space-y-4">
      <PageHeader
        title="Orders"
        actions={
          <>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span>sort</span>
              <Select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <Button variant="secondary" onClick={() => void refetch()}>
              Refresh
            </Button>
            <Link to="new" className={buttonClassName('primary')}>
              New order
            </Link>
          </>
        }
      />
      {(isLoading || isFetching) && <LoadingText />}
      {error && <ErrorText>{errorMessage(error, 'Failed to load orders')}</ErrorText>}
      {!isLoading && !error && orders.length === 0 && (
        <EmptyState>No orders yet.</EmptyState>
      )}
      <ul className="space-y-2">
        {sortedOrders.map((order) => (
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
                  customerId {order.customerId} · amount {order.amount}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {formatItemsSummary(order.items)}
                </p>
              </ListCard>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
