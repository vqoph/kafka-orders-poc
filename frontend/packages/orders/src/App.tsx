import { useState } from 'react';
import { Provider } from 'react-redux';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { emitPocEvent } from '@poc/shared';
import {
  useCreateOrderMutation,
  useGetOrderQuery,
  useListOrdersQuery,
} from './api/ordersApi';
import { store } from './store';
import './styles.css';

const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer id is required'),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.coerce.number().int().positive('Quantity must be > 0'),
  unitPrice: z.coerce.number().nonnegative().optional(),
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

function flagLabel(value?: boolean | null): string {
  if (value === true) return 'ok';
  if (value === false) return 'failed';
  return 'pending';
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
              <p className="mt-1 text-sm text-muted">Customer {order.customerId}</p>
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
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderForm>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: 'cust-1',
      sku: 'SKU-001',
      quantity: 1,
      unitPrice: 19.99,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const unitPrice = values.unitPrice ?? 0;
      const order = await createOrder({
        createOrderRequest: {
          customerId: values.customerId,
          amount: unitPrice * values.quantity,
          items: [{ sku: values.sku, quantity: values.quantity }],
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
          <span className="text-muted">SKU</span>
          <input
            className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
            {...register('sku')}
          />
          {errors.sku && <span className="text-danger">{errors.sku.message}</span>}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1 text-sm">
            <span className="text-muted">Quantity</span>
            <input
              type="number"
              className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
              {...register('quantity')}
            />
            {errors.quantity && <span className="text-danger">{errors.quantity.message}</span>}
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted">Unit price</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
              {...register('unitPrice')}
            />
            {errors.unitPrice && <span className="text-danger">{errors.unitPrice.message}</span>}
          </label>
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
        <p className="font-mono text-accent">{order.id}</p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Customer</dt>
            <dd>{order.customerId}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="uppercase">{order.status}</dd>
          </div>
          <div>
            <dt className="text-muted">Amount</dt>
            <dd>{order.amount}</dd>
          </div>
          <div>
            <dt className="text-muted">Payment</dt>
            <dd>{flagLabel(order.paymentSuccess)}</dd>
          </div>
          <div>
            <dt className="text-muted">Inventory</dt>
            <dd>{flagLabel(order.inventorySuccess)}</dd>
          </div>
        </dl>
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Items</h3>
          <ul className="space-y-1 text-sm text-foreground">
            {order.items?.map((item, index) => (
              <li key={`${item.sku}-${index}`} className="font-mono">
                {item.sku} × {item.quantity}
              </li>
            ))}
          </ul>
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
