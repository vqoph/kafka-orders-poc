import { useParams } from 'react-router-dom';
import { ErrorText, FormPanel, LoadingText, errorMessage } from '@poc/shared';
import { useGetOrderQuery } from '../../api/ordersApi';
import { nullableBool } from './formatOrder';

export function OrderDetail() {
  const { id = '' } = useParams();
  const { data: order, error, isLoading } = useGetOrderQuery({ id }, { skip: !id });

  if (error) {
    return <ErrorText>{errorMessage(error, 'Failed to load order')}</ErrorText>;
  }
  if (isLoading || !order) return <LoadingText>Loading order…</LoadingText>;

  return (
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
  );
}
