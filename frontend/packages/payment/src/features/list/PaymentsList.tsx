import { useState } from 'react';
import {
  Badge,
  DEFAULT_PAGE_SIZE,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  PaginationControls,
  errorMessage,
  fromPagedModel,
  useTranslation,
} from '@poc/shared';
import { useListPaymentsQuery } from '../../api/paymentApi';

export function PaymentsList() {
  const { t } = useTranslation('payment');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, error, isLoading, isFetching } = useListPaymentsQuery({
    page,
    size: pageSize,
    sort: ['processedAt,DESC'],
  });

  const { content: payments, totalPages, first, last } = fromPagedModel(data);

  return (
    <section className="space-y-4">
      <PageHeader title={t('title')} />
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
      {!isLoading && !error && payments.length === 0 && (
        <EmptyState>{t('empty')}</EmptyState>
      )}
      <ul className="space-y-2">
        {payments.map((payment) => (
          <li key={payment.id}>
            <ListCard>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-mono text-sm text-accent">{payment.id}</p>
                  <p className="text-sm text-muted">
                    {t('listMeta', {
                      orderId: payment.orderId,
                      amount: payment.amount,
                    })}
                  </p>
                  <p className="text-xs text-muted">{payment.processedAt}</p>
                </div>
                <Badge tone={payment.success ? 'success' : 'danger'}>
                  {payment.success ? t('success') : t('failed')}
                </Badge>
              </div>
            </ListCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
