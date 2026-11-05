import { ChaosRateForm, PageShell, useChaosRateForm, useTranslation } from '@poc/shared';
import {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
} from '../../api/paymentApi';

export function PaymentChaosPage() {
  const { t } = useTranslation('payment');
  const { data, error, isLoading } = useGetPaymentFailureRateQuery();
  const [setPaymentFailureRate, { error: saveError, isLoading: saving, isSuccess }] =
    useSetPaymentFailureRateMutation();

  const chaos = useChaosRateForm({
    service: 'payment',
    currentRate: data?.rate,
    loadError: error,
    saveError,
    saving,
    isSuccess,
    successMessage: t('chaos.updated'),
    onSave: async (rate) =>
      setPaymentFailureRate({ failureRateRequest: { rate } }).unwrap(),
  });

  return (
    <PageShell maxWidth="sm">
      <ChaosRateForm
        title={t('chaos.title')}
        description={t('chaos.description')}
        currentRate={data?.rate}
        value={chaos.draft}
        onChange={chaos.setDraft}
        onSubmit={chaos.onSubmit}
        loading={isLoading}
        saving={chaos.saving}
        error={chaos.displayError}
        successMessage={chaos.successMessage}
      />
    </PageShell>
  );
}
