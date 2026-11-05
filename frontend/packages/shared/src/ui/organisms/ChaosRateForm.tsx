import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../atoms/Button';
import { ErrorText } from '../atoms/ErrorText';
import { Input } from '../atoms/Input';
import { LoadingText } from '../atoms/LoadingText';
import { SuccessText } from '../atoms/SuccessText';
import { CurrentValueCallout } from '../molecules/CurrentValueCallout';
import { Field } from '../molecules/Field';
import { FormPanel } from '../molecules/FormPanel';
import { PageHeader } from '../molecules/PageHeader';

export type ChaosRateFormProps = {
  title: string;
  description: string;
  currentRate?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
  successMessage?: string | null;
  submitLabel?: string;
  savingLabel?: string;
};

export function ChaosRateForm({
  title,
  description,
  currentRate,
  value,
  onChange,
  onSubmit,
  loading = false,
  saving = false,
  error,
  successMessage,
  submitLabel,
  savingLabel,
}: ChaosRateFormProps) {
  const { t } = useTranslation('common');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <section className="space-y-4">
      <PageHeader title={title} subtitle={description} />
      {loading ? (
        <LoadingText />
      ) : (
        <FormPanel onSubmit={handleSubmit}>
          <CurrentValueCallout
            label={t('chaos.currentRate')}
            value={currentRate ?? t('emDash')}
          />
          <Field label={t('chaos.failureRate')}>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </Field>
          {error ? <ErrorText>{error}</ErrorText> : null}
          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          <Button type="submit" variant="warning" size="lg" disabled={saving}>
            {saving
              ? (savingLabel ?? t('chaos.saving'))
              : (submitLabel ?? t('chaos.updateRate'))}
          </Button>
        </FormPanel>
      )}
    </section>
  );
}
