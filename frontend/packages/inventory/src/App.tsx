import { useEffect, useState, type FormEvent } from 'react';
import { Provider } from 'react-redux';
import { emitPocEvent } from '@poc/shared';
import {
  useGetInventoryFailureRateQuery,
  useListStockQuery,
  useSetInventoryFailureRateMutation,
} from './api/inventoryApi';
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

function InventoryApp() {
  const {
    data: stock = [],
    error: stockError,
    isLoading: stockLoading,
    isFetching: stockFetching,
    refetch: refetchStock,
  } = useListStockQuery();
  const { data: chaos, error: chaosError, isLoading: chaosLoading } =
    useGetInventoryFailureRateQuery();
  const [setInventoryFailureRate, { error: saveError, isLoading: saving, isSuccess }] =
    useSetInventoryFailureRateMutation();

  const [draft, setDraft] = useState('0');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (chaos) setDraft(String(chaos.rate));
  }, [chaos]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationError(null);
    const next = Number(draft);
    if (Number.isNaN(next) || next < 0 || next > 1) {
      setValidationError('Rate must be a number between 0 and 1');
      return;
    }
    try {
      const result = await setInventoryFailureRate({
        failureRateRequest: { rate: next },
      }).unwrap();
      setDraft(String(result.rate));
      emitPocEvent('poc:chaos-updated', { service: 'inventory', rate: result.rate });
    } catch {
      // Error is surfaced via mutation `saveError`
    }
  }

  const loadError =
    (stockError ? errorMessage(stockError, 'Failed to load inventory') : null) ??
    (chaosError ? errorMessage(chaosError, 'Failed to load failure rate') : null);
  const formError =
    validationError ??
    (saveError ? errorMessage(saveError, 'Failed to update failure rate') : null);

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Stock</h2>
            <button
              type="button"
              onClick={() => void refetchStock()}
              className="rounded-md border border-default px-3 py-1.5 text-sm text-foreground hover:border-accent"
            >
              Refresh
            </button>
          </div>
          {(stockLoading || stockFetching) && <p className="text-muted">Loading…</p>}
          {loadError && <p className="text-danger">{loadError}</p>}
          {!stockLoading && stock.length === 0 && !stockError && (
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
          {chaosLoading ? (
            <p className="text-muted">Loading…</p>
          ) : (
            <form
              onSubmit={(e) => void onSubmit(e)}
              className="space-y-4 rounded-xl border border-default bg-panel p-4"
            >
              <div className="rounded-md bg-panel-muted px-3 py-2 text-sm text-foreground">
                Current rate:{' '}
                <span className="font-mono text-warning">{chaos?.rate ?? '—'}</span>
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
              {formError && <p className="text-sm text-danger">{formError}</p>}
              {isSuccess && !saveError && !validationError && (
                <p className="text-sm text-success">Inventory chaos rate updated</p>
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
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <InventoryApp />
    </Provider>
  );
}
