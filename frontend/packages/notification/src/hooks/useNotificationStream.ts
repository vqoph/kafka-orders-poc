import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  subscribeNotificationConnection,
  subscribeNotificationStream,
  type PocNotificationEvent,
} from '@poc/shared';
import { notificationApi } from '../api/notificationApi';
import type { NotificationEvent } from '../api/generatedApi';
import type { AppDispatch } from '../store';

function toNotificationEvent(event: PocNotificationEvent): NotificationEvent {
  return {
    orderId: event.orderId ?? null,
    type: event.type,
    message: event.message,
    at: event.at,
  };
}

export function useNotificationStream(filterOrderId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [connected, setConnected] = useState(false);
  const queryArg = { orderId: filterOrderId || undefined };

  useEffect(() => {
    return subscribeNotificationConnection(setConnected);
  }, []);

  useEffect(() => {
    return subscribeNotificationStream((event) => {
      if (event.type === 'CONNECTED') return;
      if (filterOrderId && event.orderId !== filterOrderId) return;

      const parsed = toNotificationEvent(event);
      dispatch(
        notificationApi.util.updateQueryData('listNotifications', queryArg, (draft) => {
          draft.unshift(parsed);
          if (draft.length > 100) draft.length = 100;
        }),
      );
    });
  }, [dispatch, filterOrderId, queryArg.orderId]);

  return connected;
}
