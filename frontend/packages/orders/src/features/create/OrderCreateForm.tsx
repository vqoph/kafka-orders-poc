import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useWatch, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import {
  Button,
  ErrorText,
  Field,
  FormPanel,
  Input,
  LoadingText,
  Select,
  emitPocEvent,
  errorMessage,
  useTranslation,
} from '@poc/shared';
import { useListStockForOrdersQuery } from '../../api/inventoryStockApi';
import { useCreateOrderMutation } from '../../api/ordersApi';
import { createOrderSchema, type CreateOrderForm } from './createOrderSchema';

const MANUAL_SKU = '__manual__';

function generateDemoCustomerId(): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `cust-${suffix}`;
}

export const ORDER_CREATE_EMPTY: DefaultValues<CreateOrderForm> = {
  customerId: '',
  amount: undefined,
  items: [{ sku: '', quantity: undefined }],
};

export const ORDER_CREATE_DEMO: CreateOrderForm = {
  customerId: 'cust-1',
  amount: 19.99,
  items: [{ sku: 'SKU-001', quantity: 1 }],
};

export type OrderCreateFormHandle = {
  reset: () => void;
};

export const OrderCreateForm = forwardRef<OrderCreateFormHandle>(
  function OrderCreateForm(_props, ref) {
    const { t } = useTranslation('orders');
    const navigate = useNavigate();
    const [createOrder, { error, isLoading, reset: resetMutation }] =
      useCreateOrderMutation();
    const {
      data: stock = [],
      error: stockError,
      isLoading: stockLoading,
    } = useListStockForOrdersQuery();
    const schema = useMemo(() => createOrderSchema(t), [t]);
    const {
      control,
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors },
    } = useForm<CreateOrderForm>({
      resolver: zodResolver(schema),
      defaultValues: ORDER_CREATE_EMPTY,
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'items' });
    const itemSkus = useWatch({ control, name: 'items' });
    const knownSkus = useMemo(() => new Set(stock.map((s) => s.sku)), [stock]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          reset(ORDER_CREATE_EMPTY);
          resetMutation();
        },
      }),
      [reset, resetMutation],
    );

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
        reset(ORDER_CREATE_EMPTY);
        navigate(`/orders/${order.id}`);
      } catch {
        // Error is surfaced via mutation `error`
      }
    });

    const fillDemo = () => {
      const demoSku = stock[0]?.sku ?? ORDER_CREATE_DEMO.items[0].sku;
      reset({
        customerId: generateDemoCustomerId(),
        amount: ORDER_CREATE_DEMO.amount,
        items: [{ sku: demoSku, quantity: 1 }],
      });
    };

    return (
      <FormPanel onSubmit={onSubmit} className="space-y-3">
        <div className="flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={fillDemo}>
            {t('create.fillDemo')}
          </Button>
        </div>
        <Field label={t('create.customerId')} error={errors.customerId?.message}>
          <Input {...register('customerId')} />
        </Field>
        <Field label={t('create.amount')} error={errors.amount?.message}>
          <Input
            type="number"
            step="0.01"
            min={0.01}
            {...register('amount', { valueAsNumber: true })}
          />
        </Field>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{t('create.items')}</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({ sku: stock[0]?.sku ?? '', quantity: 1 })
              }
            >
              {t('create.addItem')}
            </Button>
          </div>
          {stockLoading && <LoadingText />}
          {stockError && (
            <ErrorText>{errorMessage(stockError, t('create.stockLoadFailed'))}</ErrorText>
          )}
          {!stockLoading && !stockError && stock.length === 0 && (
            <ErrorText>{t('create.stockEmpty')}</ErrorText>
          )}
          {errors.items?.root && <ErrorText>{errors.items.root.message}</ErrorText>}
          {typeof errors.items?.message === 'string' && (
            <ErrorText>{errors.items.message}</ErrorText>
          )}
          <ul className="space-y-2">
            {fields.map((field, index) => {
              const currentSku = itemSkus?.[index]?.sku ?? '';
              const selectValue = knownSkus.has(currentSku) ? currentSku : MANUAL_SKU;
              const manual = selectValue === MANUAL_SKU;

              return (
                <li
                  key={field.id}
                  className="grid grid-cols-[1fr_5rem_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem_auto]"
                >
                  <Field
                    label={index === 0 ? t('create.product') : ''}
                    error={errors.items?.[index]?.sku?.message}
                    className="sm:col-span-1"
                  >
                    <Select
                      value={selectValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === MANUAL_SKU) {
                          setValue(`items.${index}.sku`, '', {
                            shouldValidate: true,
                          });
                        } else {
                          setValue(`items.${index}.sku`, value, {
                            shouldValidate: true,
                          });
                        }
                      }}
                    >
                      {stock.map((item) => (
                        <option key={item.sku} value={item.sku}>
                          {t('create.productOption', {
                            sku: item.sku,
                            quantity: item.quantity,
                          })}
                        </option>
                      ))}
                      <option value={MANUAL_SKU}>{t('create.manualSku')}</option>
                    </Select>
                  </Field>
                  {manual ? (
                    <Field
                      label={index === 0 ? t('create.sku') : ''}
                      error={errors.items?.[index]?.sku?.message}
                    >
                      <Input
                        placeholder={t('create.skuManualPlaceholder')}
                        {...register(`items.${index}.sku`)}
                      />
                    </Field>
                  ) : (
                    <div className="hidden sm:block" aria-hidden />
                  )}
                  <Field
                    label={index === 0 ? t('create.qty') : ''}
                    error={errors.items?.[index]?.quantity?.message}
                  >
                    <Input
                      type="number"
                      min={1}
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
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
              );
            })}
          </ul>
        </div>
        {error && <ErrorText>{errorMessage(error, t('create.failed'))}</ErrorText>}
        <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? t('create.creating') : t('create.submit')}
        </Button>
      </FormPanel>
    );
  },
);
