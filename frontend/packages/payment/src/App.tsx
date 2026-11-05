import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import {
  ChaosRateForm,
  PageShell,
  emitPocEvent,
  errorMessage,
} from '@poc/shared';
import {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
} from './api/paymentApi';
import { store } from './store';
import './styles.css';

function PaymentChaos() {
  const { data, error, isLoading } = useGetPaymentFailureRateQuery();
  const [setPaymentFailureRate, { error: saveError, isLoading: saving, isSuccess }] =
    useSetPaymentFailureRateMutation();
  const [draft, setDraft] = useState('0');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(String(data.rate));
  }, [data]);

  async function onSubmit() {
    setValidationError(null);
    const next = Number(draft);
    if (Number.isNaN(next) || next < 0 || next > 1) {
      setValidationError('Rate must be a number between 0 and 1');
      return;
    }
    try {
      const result = await setPaymentFailureRate({
        failureRateRequest: { rate: next },
      }).unwrap();
      setDraft(String(result.rate));
      emitPocEvent('poc:chaos-updated', { service: 'payment', rate: result.rate });
    } catch {
      // Error is surfaced via mutation `saveError`
    }
  }

  const displayError =
    validationError ??
    (error ? errorMessage(error, 'Failed to load failure rate') : null) ??
    (saveError ? errorMessage(saveError, 'Failed to update failure rate') : null);

  return (
    <PageShell maxWidth="sm">
      <ChaosRateForm
        title="Payment chaos"
        description="Control the payment-service artificial failure rate (0 = none, 1 = always fail)."
        currentRate={data?.rate}
        value={draft}
        onChange={setDraft}
        onSubmit={onSubmit}
        loading={isLoading}
        saving={saving}
        error={displayError}
        successMessage={
          isSuccess && !saveError && !validationError
            ? 'Payment chaos rate updated'
            : null
        }
      />
    </PageShell>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaymentChaos />
    </Provider>
  );
}
