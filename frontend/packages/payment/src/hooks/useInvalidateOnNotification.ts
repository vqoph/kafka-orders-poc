import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeNotificationStream } from '@poc/shared';
import { paymentApi } from '../api/paymentApi';
import type { AppDispatch } from '../store';

/** Refetch payments list/detail when a payment was processed. */
export function useInvalidateOnNotification(): void {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return subscribeNotificationStream((event) => {
      if (event.type === 'PAYMENT_PROCESSED') {
        dispatch(paymentApi.util.invalidateTags(['Payments']));
      }
    });
  }, [dispatch]);
}
