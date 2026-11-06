import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  ErrorText,
  Field,
  FormPanel,
  Input,
  LoadingText,
  errorMessage,
  useTranslation,
} from '@poc/shared';
import {
  useCreateStockMutation,
  useGetStockQuery,
  useUpdateStockMutation,
} from '../../api/inventoryApi';

type Mode = 'create' | 'edit';

/** Unique SKU for demo fill (avoids 409 on create). */
function generateDemoSku(): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `SKU-${suffix.toUpperCase()}`;
}

export function StockForm({ mode }: { mode: Mode }) {
  const { t } = useTranslation('inventory');
  const navigate = useNavigate();
  const { sku: routeSku } = useParams<{ sku: string }>();
  const isEdit = mode === 'edit';

  const { data: existing, error: loadError, isLoading: loadingExisting } = useGetStockQuery(
    { sku: routeSku ?? '' },
    { skip: !isEdit || !routeSku },
  );

  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (isEdit && existing) {
      setSku(existing.sku);
      setQuantity(existing.quantity);
    }
  }, [isEdit, existing]);

  const [createStock, { error: createError, isLoading: creating }] = useCreateStockMutation();
  const [updateStock, { error: updateError, isLoading: updating }] = useUpdateStockMutation();

  const saving = creating || updating;
  const error = createError || updateError || loadError;

  const fillDemo = () => {
    setSku(generateDemoSku());
    setQuantity(100);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = sku.trim();
    if (!trimmed) return;
    if (quantity < 0 || Number.isNaN(quantity)) return;

    try {
      if (isEdit) {
        await updateStock({
          sku: trimmed,
          updateStockRequest: { quantity },
        }).unwrap();
      } else {
        await createStock({
          createStockRequest: { sku: trimmed, quantity },
        }).unwrap();
      }
      navigate('/inventory');
    } catch {
      // surfaced via mutation error
    }
  };

  if (isEdit && loadingExisting) {
    return <LoadingText />;
  }

  return (
    <FormPanel onSubmit={onSubmit} className="space-y-3">
      {!isEdit && (
        <div className="flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={fillDemo}>
            {t('form.fillDemo')}
          </Button>
        </div>
      )}
      <Field label={t('form.sku')}>
        <Input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          disabled={isEdit}
          required
        />
      </Field>
      <Field label={t('form.quantity')}>
        <Input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </Field>
      {error && (
        <ErrorText>
          {errorMessage(
            error,
            isEdit ? t('form.updateFailed') : t('form.createFailed'),
          )}
        </ErrorText>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={saving}>
        {saving ? t('form.saving') : t('form.save')}
      </Button>
    </FormPanel>
  );
}
