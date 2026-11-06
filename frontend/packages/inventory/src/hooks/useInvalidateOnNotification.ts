import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeNotificationStream } from '@poc/shared';
import { inventoryApi } from '../api/inventoryApi';
import type { AppDispatch } from '../store';

/** Refetch stock list/detail when inventory was reserved (saga). */
export function useInvalidateOnNotification(): void {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return subscribeNotificationStream((event) => {
      if (event.type === 'INVENTORY_RESERVED') {
        dispatch(inventoryApi.util.invalidateTags(['Stock']));
      }
    });
  }, [dispatch]);
}
