import { z } from 'zod';

type Translate = (key: string) => string;

export function createOrderSchema(t: Translate) {
  return z.object({
    customerId: z.string().min(1, t('create.customerIdRequired')),
    amount: z.coerce.number().min(0.01, t('create.amountMin')),
    items: z
      .array(
        z.object({
          sku: z.string().min(1, t('create.skuRequired')),
          quantity: z.coerce.number().int().positive(t('create.quantityPositive')),
        }),
      )
      .min(1, t('create.itemsRequired')),
  });
}

export type CreateOrderForm = z.infer<ReturnType<typeof createOrderSchema>>;
