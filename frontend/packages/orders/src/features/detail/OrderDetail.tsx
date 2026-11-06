import { ErrorText, FormPanel, LoadingText, errorMessage, useTranslation } from '@poc/shared';
import { useParams } from 'react-router-dom';
import { useGetOrderQuery } from '../../api/ordersApi';
import { nullableBool } from './formatOrder';

export function OrderDetail() {
  const { t } = useTranslation('orders');
  const { id = '' } = useParams();
  const { data: order, error, isLoading } = useGetOrderQuery({ id }, { skip: !id });

  if (error) {
    return <ErrorText>{errorMessage(error, t('detail.loadFailed'))}</ErrorText>;
  }
  if (isLoading || !order) return <LoadingText>{t('detail.loading')}</LoadingText>;

  return (
    <FormPanel asDiv className="space-y-3">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-muted">{t('detail.id')}</dt>
          <dd className="font-mono text-accent">{order.id}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('detail.customerId')}</dt>
          <dd>{order.customerId}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('detail.status')}</dt>
          <dd className="font-mono">{order.status}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('detail.amount')}</dt>
          <dd>{order.amount}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('detail.createdAt')}</dt>
          <dd className="font-mono">{order.createdAt ?? t('detail.null')}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('detail.paymentSuccess')}</dt>
          <dd className="font-mono">{nullableBool(order.paymentSuccess, t)}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('detail.inventorySuccess')}</dt>
          <dd className="font-mono">{nullableBool(order.inventorySuccess, t)}</dd>
        </div>
        {order.errorMessage ? (
          <div className="sm:col-span-2">
            <dt className="text-muted">{t('detail.errorMessage')}</dt>
            <dd className="text-danger">{order.errorMessage}</dd>
          </div>
        ) : null}
      </dl>
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">{t('detail.items')}</h3>
        {!order.items?.length ? (
          <p className="font-mono text-sm text-muted">[]</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="pb-1 font-medium">{t('detail.sku')}</th>
                <th className="pb-1 font-medium">{t('detail.quantity')}</th>
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
