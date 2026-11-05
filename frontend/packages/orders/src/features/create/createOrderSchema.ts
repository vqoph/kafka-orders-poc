import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer id is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be >= 0.01'),
  items: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.coerce.number().int().positive('Quantity must be > 0'),
      }),
    )
    .min(1, 'At least one item is required'),
});

export type CreateOrderForm = z.infer<typeof createOrderSchema>;
