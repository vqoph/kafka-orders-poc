import { useEffect, useState, type FormEvent } from 'react';
import { Provider } from 'react-redux';
import { emitPocEvent } from '@poc/shared';
import {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
} from './api/paymentApi';
import { store } from './store';
import './styles.css';

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const err = error as { status?: number | string; data?: unknown };
    if (typeof err.data === 'string' && err.data) return err.data;
    if (err.status != null) return `Request failed (${err.status})`;
  }
  return fallback;
}

function PaymentChaos() {
  const { data, error, isLoading } = useGetPaymentFailureRateQuery();
  const [setPaymentFailureRate, { error: saveError, isLoading: saving, isSuccess }] =
    useSetPaymentFailureRateMutation();
  const [draft, setDraft] = useState('0');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(String(data.rate));
  }, [data]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
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
    <div className="p-4 md:p-6">
      <section className="mx-auto max-w-lg space-y-4">
        <header>
          <h2 className="text-xl font-semibold text-foreground">Payment chaos</h2>
          <p className="mt-1 text-sm text-muted">
            Control the payment-service artificial failure rate (0 = none, 1 = always fail).
          </p>
        </header>
        {isLoading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-4 rounded-xl border border-default bg-panel p-4"
          >
            <div className="rounded-md bg-panel-muted px-3 py-2 text-sm text-foreground">
              Current rate:{' '}
              <span className="font-mono text-warning">{data?.rate ?? '—'}</span>
            </div>
            <label className="block space-y-1 text-sm">
              <span className="text-muted">Failure rate</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground"
              />
            </label>
            {displayError && <p className="text-sm text-danger">{displayError}</p>}
            {isSuccess && !saveError && !validationError && (
              <p className="text-sm text-success">Payment chaos rate updated</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-warning px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update rate'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaymentChaos />
    </Provider>
  );
}
