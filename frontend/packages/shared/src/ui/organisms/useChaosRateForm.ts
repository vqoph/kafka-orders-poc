import { useEffect, useState } from 'react';
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
  const [draft, setDraft] = useState('0');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (currentRate != null) setDraft(String(currentRate));
  }, [currentRate]);

  async function onSubmit() {
    setValidationError(null);
    const next = Number(draft);
    if (Number.isNaN(next) || next < 0 || next > 1) {
      setValidationError('Rate must be a number between 0 and 1');
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
    (loadError ? errorMessage(loadError, 'Failed to load failure rate') : null) ??
    (saveError ? errorMessage(saveError, 'Failed to update failure rate') : null);

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
