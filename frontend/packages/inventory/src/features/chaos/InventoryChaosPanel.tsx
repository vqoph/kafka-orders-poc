import { ChaosRateForm, useChaosRateForm } from '@poc/shared';
import {
  useGetInventoryFailureRateQuery,
  useSetInventoryFailureRateMutation,
} from '../../api/inventoryApi';

export function InventoryChaosPanel() {
  const { data: chaos, error: chaosError, isLoading: chaosLoading } =
    useGetInventoryFailureRateQuery();
  const [setInventoryFailureRate, { error: saveError, isLoading: saving, isSuccess }] =
    useSetInventoryFailureRateMutation();

  const form = useChaosRateForm({
    service: 'inventory',
    currentRate: chaos?.rate,
    loadError: chaosError,
    saveError,
    saving,
    isSuccess,
    successMessage: 'Inventory chaos rate updated',
    onSave: async (rate) =>
      setInventoryFailureRate({ failureRateRequest: { rate } }).unwrap(),
  });

  return (
    <ChaosRateForm
      title="Inventory chaos"
      description="Artificial failure rate for inventory-service (0–1)."
      currentRate={chaos?.rate}
      value={form.draft}
      onChange={form.setDraft}
      onSubmit={form.onSubmit}
      loading={chaosLoading}
      saving={form.saving}
      error={form.displayError}
      successMessage={form.successMessage}
    />
  );
}
