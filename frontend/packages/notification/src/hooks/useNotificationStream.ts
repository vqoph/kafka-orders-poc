import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NOTIFICATION_BASE_URL } from '../api/emptyApi';
import { notificationApi } from '../api/notificationApi';
import type { NotificationEvent } from '../api/generatedApi';
import type { AppDispatch } from '../store';

function parseEventData(raw: string): NotificationEvent | null {
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationEvent>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      orderId: parsed.orderId ?? null,
      type: parsed.type ?? 'MESSAGE',
      message: parsed.message ?? raw,
      at: parsed.at ?? new Date().toISOString(),
    };
  } catch {
    return {
      orderId: null,
      type: 'MESSAGE',
      message: raw,
      at: new Date().toISOString(),
    };
  }
}

export function useNotificationStream(filterOrderId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [connected, setConnected] = useState(false);
  const queryArg = { orderId: filterOrderId || undefined };

  useEffect(() => {
    const source = new EventSource(`${NOTIFICATION_BASE_URL}/notifications/stream`);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (event) => {
      const parsed = parseEventData(event.data);
      if (!parsed) return;
      if (filterOrderId && parsed.orderId !== filterOrderId) return;

      dispatch(
        notificationApi.util.updateQueryData('listNotifications', queryArg, (draft) => {
          draft.unshift(parsed);
          if (draft.length > 100) draft.length = 100;
        }),
      );
    };
    return () => source.close();
  }, [dispatch, filterOrderId, queryArg.orderId]);

  return connected;
}
