import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import {
  Button,
  ErrorText,
  Field,
  FormPanel,
  Input,
  emitPocEvent,
  errorMessage,
  useTranslation,
} from '@poc/shared';
import { useCreateOrderMutation } from '../../api/ordersApi';
import { createOrderSchema, type CreateOrderForm } from './createOrderSchema';

export function OrderCreateForm() {
  const { t } = useTranslation('orders');
  const navigate = useNavigate();
  const [createOrder, { error, isLoading }] = useCreateOrderMutation();
  const schema = useMemo(() => createOrderSchema(t), [t]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: 'cust-1',
      amount: 19.99,
      items: [{ sku: 'SKU-001', quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await createOrder({
        createOrderRequest: {
          customerId: values.customerId,
          amount: values.amount,
          items: values.items,
        },
      }).unwrap();
      emitPocEvent('poc:order-created', { orderId: order.id });
      navigate(`/orders/${order.id}`);
    } catch {
      // Error is surfaced via mutation `error`
    }
  });

  return (
    <FormPanel onSubmit={onSubmit} className="space-y-3">
      <Field label={t('create.customerId')} error={errors.customerId?.message}>
        <Input {...register('customerId')} />
      </Field>
      <Field label={t('create.amount')} error={errors.amount?.message}>
        <Input type="number" step="0.01" min={0.01} {...register('amount')} />
      </Field>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{t('create.items')}</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ sku: '', quantity: 1 })}
          >
            {t('create.addItem')}
          </Button>
        </div>
        {errors.items?.root && <ErrorText>{errors.items.root.message}</ErrorText>}
        {typeof errors.items?.message === 'string' && (
          <ErrorText>{errors.items.message}</ErrorText>
        )}
        <ul className="space-y-2">
          {fields.map((field, index) => (
            <li key={field.id} className="grid grid-cols-[1fr_5rem_auto] gap-2">
              <Field
                label={index === 0 ? t('create.sku') : ''}
                error={errors.items?.[index]?.sku?.message}
              >
                <Input placeholder={t('create.sku')} {...register(`items.${index}.sku`)} />
              </Field>
              <Field
                label={index === 0 ? t('create.qty') : ''}
                error={errors.items?.[index]?.quantity?.message}
              >
                <Input
                  type="number"
                  min={1}
                  {...register(`items.${index}.quantity`)}
                />
              </Field>
              <div className={clsx(index === 0 && 'pt-6')}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="px-2 py-2 text-muted hover:border-danger hover:text-danger"
                >
                  {t('create.remove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {error && <ErrorText>{errorMessage(error, t('create.failed'))}</ErrorText>}
      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
        {isLoading ? t('create.creating') : t('create.submit')}
      </Button>
    </FormPanel>
  );
}
