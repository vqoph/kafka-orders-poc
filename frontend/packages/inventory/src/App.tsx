import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  ApiError,
  emitPocEvent,
  getInventoryFailureRate,
  listStock,
  setInventoryFailureRate,
  type StockItem,
} from '@poc/shared';
import './styles.css';

export default function App() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [rate, setRate] = useState(0);
  const [draft, setDraft] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stockData, chaos] = await Promise.all([listStock(), getInventoryFailureRate()]);
      setStock(stockData);
      setRate(chaos.rate);
      setDraft(String(chaos.rate));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
      const data = await setInventoryFailureRate(next);
      setRate(data.rate);
      setDraft(String(data.rate));
      setMessage('Inventory chaos rate updated');
      emitPocEvent('poc:chaos-updated', { service: 'inventory', rate: data.rate });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update failure rate');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Stock</h2>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-md border border-default px-3 py-1.5 text-sm text-foreground hover:border-accent"
            >
              Refresh
            </button>
          </div>
          {loading && <p className="text-muted">Loading…</p>}
          {error && <p className="text-danger">{error}</p>}
          {!loading && stock.length === 0 && !error && (
            <p className="text-muted">No stock rows returned.</p>
          )}
          <ul className="space-y-2">
            {stock.map((item) => (
              <li
                key={item.sku}
                className="rounded-lg border border-default bg-panel px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-accent">{item.sku}</span>
                  <span className="text-sm text-foreground">qty {item.quantity}</span>
                </div>
                {item.reserved != null && (
                  <p className="mt-1 text-xs text-muted">reserved {item.reserved}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <header>
            <h2 className="text-xl font-semibold text-foreground">Inventory chaos</h2>
            <p className="mt-1 text-sm text-muted">
              Artificial failure rate for inventory-service (0–1).
            </p>
          </header>
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
            {message && <p className="text-sm text-success">{message}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-warning px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update rate'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
