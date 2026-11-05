import { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  buttonClassName,
  EmptyState,
  ErrorText,
  Field,
  FormPanel,
  Input,
  ListCard,
  LoadingText,
  PageHeader,
  PageShell,
  Select,
  emitPocEvent,
  errorMessage,
} from '@poc/shared';
import {
  useCreateOrderMutation,
  useGetOrderQuery,
  useListOrdersQuery,
} from './api/ordersApi';
import type { ItemResponse, OrderResponse } from './api/generatedApi';
import { store } from './store';
import './styles.css';

type SortMode = 'date-asc' | 'date-desc' | 'status';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'date-desc', label: 'date desc' },
  { value: 'date-asc', label: 'date asc' },
  { value: 'status', label: 'status' },
];

function compareOrders(a: OrderResponse, b: OrderResponse, mode: SortMode): number {
  if (mode === 'status') {
    return a.status.localeCompare(b.status);
  }
  const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
  const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
  return mode === 'date-asc' ? aTime - bTime : bTime - aTime;
}

const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer id is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be >= 0.01'),
  items: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.coerce.number().int().positive('Quantity must be > 0'),
      }),
    )
    .min(1, 'At least one item is required'),
});

type CreateOrderForm = z.infer<typeof createOrderSchema>;

function nullableBool(value?: boolean | null): string {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return 'null';
}

function formatItemsSummary(items?: ItemResponse[]): string {
  if (!items?.length) return 'items: []';
  return items.map((item) => `${item.sku} × ${item.quantity}`).join(', ');
}

function OrdersList() {
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

function OrderCreate() {
  const navigate = useNavigate();
  const [createOrder, { error, isLoading }] = useCreateOrderMutation();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderForm>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: 'cust-1',
      amount: 19.99,
      items: [{ sku: 'SKU-001', quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await createOrder({
        createOrderRequest: {
          customerId: values.customerId,
          amount: values.amount,
          items: values.items,
        },
      }).unwrap();
      emitPocEvent('poc:order-created', { orderId: order.id });
      navigate(`/orders/${order.id}`);
    } catch {
      // Error is surfaced via mutation `error`
    }
  });

  return (
    <section className="mx-auto max-w-lg space-y-4">
      <PageHeader
        title="Create order"
        actions={
          <Link to=".." className={buttonClassName('ghost')}>
            Back to list
          </Link>
        }
      />
      <FormPanel onSubmit={onSubmit} className="space-y-3">
        <Field label="Customer id" error={errors.customerId?.message}>
          <Input {...register('customerId')} />
        </Field>
        <Field label="Amount" error={errors.amount?.message}>
          <Input type="number" step="0.01" min={0.01} {...register('amount')} />
        </Field>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Items</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ sku: '', quantity: 1 })}
            >
              Add item
            </Button>
          </div>
          {errors.items?.root && <ErrorText>{errors.items.root.message}</ErrorText>}
          {typeof errors.items?.message === 'string' && (
            <ErrorText>{errors.items.message}</ErrorText>
          )}
          <ul className="space-y-2">
            {fields.map((field, index) => (
              <li key={field.id} className="grid grid-cols-[1fr_5rem_auto] gap-2">
                <Field
                  label={index === 0 ? 'SKU' : ''}
                  error={errors.items?.[index]?.sku?.message}
                >
                  <Input placeholder="SKU" {...register(`items.${index}.sku`)} />
                </Field>
                <Field
                  label={index === 0 ? 'Qty' : ''}
                  error={errors.items?.[index]?.quantity?.message}
                >
                  <Input
                    type="number"
                    min={1}
                    {...register(`items.${index}.quantity`)}
                  />
                </Field>
                <div className={index === 0 ? 'pt-6' : undefined}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="px-2 py-2 text-muted hover:border-danger hover:text-danger"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {error && <ErrorText>{errorMessage(error, 'Failed to create order')}</ErrorText>}
        <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? 'Creating…' : 'Create order'}
        </Button>
      </FormPanel>
    </section>
  );
}

function OrderDetail() {
  const { id = '' } = useParams();
  const { data: order, error, isLoading } = useGetOrderQuery({ id }, { skip: !id });

  if (error) {
    return <ErrorText>{errorMessage(error, 'Failed to load order')}</ErrorText>;
  }
  if (isLoading || !order) return <LoadingText>Loading order…</LoadingText>;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Order detail"
        actions={
          <Link to=".." className={buttonClassName('ghost')}>
            Back to list
          </Link>
        }
      />
      <FormPanel asDiv className="space-y-3">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-muted">id</dt>
            <dd className="font-mono text-accent">{order.id}</dd>
          </div>
          <div>
            <dt className="text-muted">customerId</dt>
            <dd>{order.customerId}</dd>
          </div>
          <div>
            <dt className="text-muted">status</dt>
            <dd className="font-mono">{order.status}</dd>
          </div>
          <div>
            <dt className="text-muted">amount</dt>
            <dd>{order.amount}</dd>
          </div>
          <div>
            <dt className="text-muted">createdAt</dt>
            <dd className="font-mono">{order.createdAt ?? 'null'}</dd>
          </div>
          <div>
            <dt className="text-muted">paymentSuccess</dt>
            <dd className="font-mono">{nullableBool(order.paymentSuccess)}</dd>
          </div>
          <div>
            <dt className="text-muted">inventorySuccess</dt>
            <dd className="font-mono">{nullableBool(order.inventorySuccess)}</dd>
          </div>
        </dl>
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">items</h3>
          {!order.items?.length ? (
            <p className="font-mono text-sm text-muted">[]</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="pb-1 font-medium">sku</th>
                  <th className="pb-1 font-medium">quantity</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={`${item.sku}-${index}`} className="font-mono text-foreground">
                    <td className="py-0.5 pr-4">{item.sku}</td>
                    <td className="py-0.5">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FormPanel>
    </section>
  );
}

function OrdersRoutes() {
  return (
    <PageShell>
      <Routes>
        <Route index element={<OrdersList />} />
        <Route path="new" element={<OrderCreate />} />
        <Route path=":id" element={<OrderDetail />} />
      </Routes>
    </PageShell>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <OrdersRoutes />
    </Provider>
  );
}
