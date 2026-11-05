import { ChaosRateForm, PageShell, useChaosRateForm } from '@poc/shared';
import {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
} from '../../api/paymentApi';

export function PaymentChaosPage() {
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
    successMessage: 'Payment chaos rate updated',
    onSave: async (rate) =>
      setPaymentFailureRate({ failureRateRequest: { rate } }).unwrap(),
  });

  return (
    <PageShell maxWidth="sm">
      <ChaosRateForm
        title="Payment chaos"
        description="Control the payment-service artificial failure rate (0 = none, 1 = always fail)."
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
