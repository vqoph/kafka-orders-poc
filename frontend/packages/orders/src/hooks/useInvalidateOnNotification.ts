import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeNotificationStream } from '@poc/shared';
import { inventoryStockApi } from '../api/inventoryStockApi';
import { ordersApi } from '../api/ordersApi';
import type { AppDispatch } from '../store';

/**
 * Refetch orders (list + detail) and the create-form stock picker when domain SSE events arrive.
 */
export function useInvalidateOnNotification(): void {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return subscribeNotificationStream((event) => {
      if (event.type === 'ORDER_STATUS') {
        dispatch(ordersApi.util.invalidateTags(['Orders']));
      }
      if (event.type === 'INVENTORY_RESERVED') {
        dispatch(inventoryStockApi.util.invalidateTags(['Stock']));
      }
    });
  }, [dispatch]);
}
