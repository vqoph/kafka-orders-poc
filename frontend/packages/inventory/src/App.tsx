import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import {
  Button,
  ChaosRateForm,
  EmptyState,
  ErrorText,
  ListCard,
  LoadingText,
  PageHeader,
  PageShell,
  emitPocEvent,
  errorMessage,
} from '@poc/shared';
import {
  useGetInventoryFailureRateQuery,
  useListStockQuery,
  useSetInventoryFailureRateMutation,
} from './api/inventoryApi';
import { store } from './store';
import './styles.css';

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

  async function onSubmit() {
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
    <PageShell maxWidth="lg">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <PageHeader
            title="Stock"
            actions={
              <Button variant="secondary" onClick={() => void refetchStock()}>
                Refresh
              </Button>
            }
          />
          {(stockLoading || stockFetching) && <LoadingText />}
          {loadError && <ErrorText>{loadError}</ErrorText>}
          {!stockLoading && stock.length === 0 && !stockError && (
            <EmptyState>No stock rows returned.</EmptyState>
          )}
          <ul className="space-y-2">
            {stock.map((item) => (
              <li key={item.sku}>
                <ListCard>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-accent">{item.sku}</span>
                    <span className="text-sm text-foreground">qty {item.quantity}</span>
                  </div>
                </ListCard>
              </li>
            ))}
          </ul>
        </section>

        <ChaosRateForm
          title="Inventory chaos"
          description="Artificial failure rate for inventory-service (0–1)."
          currentRate={chaos?.rate}
          value={draft}
          onChange={setDraft}
          onSubmit={onSubmit}
          loading={chaosLoading}
          saving={saving}
          error={formError}
          successMessage={
            isSuccess && !saveError && !validationError
              ? 'Inventory chaos rate updated'
              : null
          }
        />
      </div>
    </PageShell>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <InventoryApp />
    </Provider>
  );
}
