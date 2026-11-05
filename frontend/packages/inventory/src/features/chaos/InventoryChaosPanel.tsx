import { ChaosRateForm, useChaosRateForm, useTranslation } from '@poc/shared';
import {
  useGetInventoryFailureRateQuery,
  useSetInventoryFailureRateMutation,
} from '../../api/inventoryApi';

export function InventoryChaosPanel() {
  const { t } = useTranslation('inventory');
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
    successMessage: t('chaos.updated'),
    onSave: async (rate) =>
      setInventoryFailureRate({ failureRateRequest: { rate } }).unwrap(),
  });

  return (
    <ChaosRateForm
      title={t('chaos.title')}
      description={t('chaos.description')}
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
