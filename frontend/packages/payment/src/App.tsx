import { useEffect, useState, type FormEvent } from 'react';
import {
  ApiError,
  emitPocEvent,
  getPaymentFailureRate,
  setPaymentFailureRate,
} from '@poc/shared';
import './styles.css';

export default function App() {
  const [rate, setRate] = useState(0);
  const [draft, setDraft] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getPaymentFailureRate();
        setRate(data.rate);
        setDraft(String(data.rate));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load failure rate');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const next = Number(draft);
    if (Number.isNaN(next) || next < 0 || next > 1) {
      setError('Rate must be a number between 0 and 1');
      setSaving(false);
      return;
    }
    try {
      const data = await setPaymentFailureRate(next);
      setRate(data.rate);
      setDraft(String(data.rate));
      setMessage('Payment chaos rate updated');
      emitPocEvent('poc:chaos-updated', { service: 'payment', rate: data.rate });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update failure rate');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <section className="mx-auto max-w-lg space-y-4">
        <header>
          <h2 className="text-xl font-semibold text-foreground">Payment chaos</h2>
          <p className="mt-1 text-sm text-muted">
            Control the payment-service artificial failure rate (0 = none, 1 = always fail).
          </p>
        </header>
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-xl border border-default bg-panel p-4"
          >
            <div className="rounded-md bg-panel-muted px-3 py-2 text-sm text-foreground">
              Current rate: <span className="font-mono text-warning">{rate}</span>
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
            {error && <p className="text-sm text-danger">{error}</p>}
            {message && <p className="text-sm text-success">{message}</p>}
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
