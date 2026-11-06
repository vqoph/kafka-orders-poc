/**
 * Backend base URLs — injected at build time via webpack DefinePlugin
 * from `frontend/.env` (see `.env.example`).
 */
export const ORDERS_API_BASE_URL =
  process.env.ORDERS_API_BASE_URL ?? 'http://localhost:8081';

export const PAYMENT_API_BASE_URL =
  process.env.PAYMENT_API_BASE_URL ?? 'http://localhost:8082';

export const NOTIFICATION_API_BASE_URL =
  process.env.NOTIFICATION_API_BASE_URL ?? 'http://localhost:8084';

export const INVENTORY_API_BASE_URL =
  process.env.INVENTORY_API_BASE_URL ?? 'http://localhost:8085';

export const NOTIFICATION_STREAM_URL = `${NOTIFICATION_API_BASE_URL}/notifications/stream`;
