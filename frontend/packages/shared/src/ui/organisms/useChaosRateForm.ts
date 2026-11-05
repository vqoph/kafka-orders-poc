import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { emitPocEvent, type PocEventMap } from '../../events/bus';
import { errorMessage } from '../../utils/errorMessage';

type ChaosService = PocEventMap['poc:chaos-updated']['service'];

export type UseChaosRateFormArgs = {
  service: ChaosService;
  currentRate?: number;
  loadError?: unknown;
  saveError?: unknown;
  saving: boolean;
  isSuccess: boolean;
  successMessage: string;
  onSave: (rate: number) => Promise<{ rate: number }>;
};

export function useChaosRateForm({
  service,
  currentRate,
  loadError,
  saveError,
  saving,
  isSuccess,
  successMessage,
  onSave,
}: UseChaosRateFormArgs) {
  const { t } = useTranslation('common');
  const [draft, setDraft] = useState('0');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (currentRate != null) setDraft(String(currentRate));
  }, [currentRate]);

  async function onSubmit() {
    setValidationError(null);
    const next = Number(draft);
    if (Number.isNaN(next) || next < 0 || next > 1) {
      setValidationError(t('chaos.rateInvalid'));
      return;
    }
    try {
      const result = await onSave(next);
      setDraft(String(result.rate));
      emitPocEvent('poc:chaos-updated', { service, rate: result.rate });
    } catch {
      // Error is surfaced via mutation `saveError`
    }
  }

  const displayError =
    validationError ??
    (loadError ? errorMessage(loadError, t('chaos.loadFailed')) : null) ??
    (saveError ? errorMessage(saveError, t('chaos.updateFailed')) : null);

  return {
    draft,
    setDraft,
    onSubmit,
    saving,
    displayError,
    successMessage:
      isSuccess && !saveError && !validationError ? successMessage : null,
  };
}
