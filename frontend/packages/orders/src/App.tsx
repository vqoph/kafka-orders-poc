import { Provider } from 'react-redux';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { emitPocEvent } from '@poc/shared';
import {
  useCreateOrderMutation,
  useGetOrderQuery,
  useListOrdersQuery,
} from './api/ordersApi';
import type { ItemResponse } from './api/generatedApi';
import { store } from './store';
import './styles.css';

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

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const err = error as { status?: number | string; data?: unknown };
    if (typeof err.data === 'string' && err.data) return err.data;
    if (err.status != null) return `Request failed (${err.status})`;
  }
  return fallback;
}

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

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Orders</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md border border-default px-3 py-1.5 text-sm text-foreground hover:border-accent"
          >
            Refresh
          </button>
          <Link
            to="new"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-on-accent hover:bg-accent-strong"
          >
            New order
          </Link>
        </div>
      </div>
      {(isLoading || isFetching) && <p className="text-muted">Loading…</p>}
      {error && <p className="text-danger">{errorMessage(error, 'Failed to load orders')}</p>}
      {!isLoading && !error && orders.length === 0 && (
        <p className="text-muted">No orders yet.</p>
      )}
      <ul className="space-y-2">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              to={order.id}
              onClick={() => emitPocEvent('poc:order-selected', { orderId: order.id })}
              className="block rounded-lg border border-default bg-panel px-4 py-3 hover:border-accent"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm text-accent">{order.id}</span>
                <span className="rounded bg-panel-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted">
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                customerId {order.customerId} · amount {order.amount}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted">
                {formatItemsSummary(order.items)}
              </p>
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Create order</h2>
        <Link to=".." className="text-sm text-accent hover:text-accent-strong">
          Back to list
        </Link>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-default bg-panel p-4">
        <label className="block space-y-1 text-sm">
          <span className="text-muted">Customer id</span>
          <input
            className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
            {...register('customerId')}
          />
          {errors.customerId && <span className="text-danger">{errors.customerId.message}</span>}
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">Amount</span>
          <input
            type="number"
            step="0.01"
            min={0.01}
            className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
            {...register('amount')}
          />
          {errors.amount && <span className="text-danger">{errors.amount.message}</span>}
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Items</h3>
            <button
              type="button"
              onClick={() => append({ sku: '', quantity: 1 })}
              className="rounded-md border border-default px-2 py-1 text-xs text-foreground hover:border-accent"
            >
              Add item
            </button>
          </div>
          {errors.items?.root && (
            <p className="text-sm text-danger">{errors.items.root.message}</p>
          )}
          {typeof errors.items?.message === 'string' && (
            <p className="text-sm text-danger">{errors.items.message}</p>
          )}
          <ul className="space-y-2">
            {fields.map((field, index) => (
              <li key={field.id} className="grid grid-cols-[1fr_5rem_auto] gap-2">
                <label className="block space-y-1 text-sm">
                  {index === 0 && <span className="text-muted">SKU</span>}
                  <input
                    className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
                    placeholder="SKU"
                    {...register(`items.${index}.sku`)}
                  />
                  {errors.items?.[index]?.sku && (
                    <span className="text-danger">{errors.items[index].sku.message}</span>
                  )}
                </label>
                <label className="block space-y-1 text-sm">
                  {index === 0 && <span className="text-muted">Qty</span>}
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
                    {...register(`items.${index}.quantity`)}
                  />
                  {errors.items?.[index]?.quantity && (
                    <span className="text-danger">{errors.items[index].quantity.message}</span>
                  )}
                </label>
                <div className={index === 0 ? 'pt-6' : undefined}>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="rounded-md border border-default px-2 py-2 text-xs text-muted hover:border-danger hover:text-danger disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {error && (
          <p className="text-sm text-danger">{errorMessage(error, 'Failed to create order')}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-strong disabled:opacity-60"
        >
          {isLoading ? 'Creating…' : 'Create order'}
        </button>
      </form>
    </section>
  );
}

function OrderDetail() {
  const { id = '' } = useParams();
  const { data: order, error, isLoading } = useGetOrderQuery(
    { id },
    { skip: !id },
  );

  if (error) {
    return <p className="text-danger">{errorMessage(error, 'Failed to load order')}</p>;
  }
  if (isLoading || !order) return <p className="text-muted">Loading order…</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Order detail</h2>
        <Link to=".." className="text-sm text-accent hover:text-accent-strong">
          Back to list
        </Link>
      </div>
      <div className="space-y-3 rounded-xl border border-default bg-panel p-4">
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
      </div>
    </section>
  );
}

function OrdersRoutes() {
  return (
    <div className="p-4 md:p-6">
      <Routes>
        <Route index element={<OrdersList />} />
        <Route path="new" element={<OrderCreate />} />
        <Route path=":id" element={<OrderDetail />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <OrdersRoutes />
    </Provider>
  );
}
