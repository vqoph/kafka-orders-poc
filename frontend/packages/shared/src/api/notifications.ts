import { API } from './config';
import { requestJson } from './http';
import type { NotificationMessage } from '../types/api';

export function listNotifications(orderId?: string): Promise<NotificationMessage[]> {
  const query = orderId ? `?orderId=${encodeURIComponent(orderId)}` : '';
  return requestJson<NotificationMessage[]>(`${API.notification}/notifications${query}`);
}

export function notificationsStreamUrl(): string {
  return `${API.notification}/notifications/stream`;
}
