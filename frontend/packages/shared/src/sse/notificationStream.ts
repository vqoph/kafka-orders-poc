import { NOTIFICATION_STREAM_URL } from '../env/apiBaseUrls';

export type PocNotificationEvent = {
  orderId?: string | null;
  type: string;
  message: string;
  at: string;
};

type Handler = (event: PocNotificationEvent) => void;
type ConnectionHandler = (connected: boolean) => void;

type StreamState = {
  source: EventSource | null;
  handlers: Set<Handler>;
  connectionHandlers: Set<ConnectionHandler>;
};

const WINDOW_KEY = '__pocNotificationStream';

function getState(): StreamState {
  const w = window as Window & { [WINDOW_KEY]?: StreamState };
  if (!w[WINDOW_KEY]) {
    w[WINDOW_KEY] = {
      source: null,
      handlers: new Set(),
      connectionHandlers: new Set(),
    };
  }
  return w[WINDOW_KEY];
}

function notifyConnection(connected: boolean): void {
  for (const handler of getState().connectionHandlers) {
    handler(connected);
  }
}

function parseEventData(raw: string): PocNotificationEvent | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PocNotificationEvent>;
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

function dispatchToHandlers(raw: string): void {
  const parsed = parseEventData(raw);
  if (!parsed) return;
  for (const handler of getState().handlers) {
    handler(parsed);
  }
}

function ensureConnected(): void {
  if (typeof window === 'undefined') return;
  const state = getState();
  if (state.source) return;

  const source = new EventSource(NOTIFICATION_STREAM_URL);
  state.source = source;

  source.onopen = () => notifyConnection(true);
  source.addEventListener('notification', (event) => {
    dispatchToHandlers((event as MessageEvent).data);
  });
  source.addEventListener('connected', (event) => {
    dispatchToHandlers((event as MessageEvent).data);
  });
  source.onmessage = (event) => {
    dispatchToHandlers(event.data);
  };
  source.onerror = () => {
    notifyConnection(false);
  };
}

function maybeClose(): void {
  const state = getState();
  if (state.handlers.size === 0 && state.connectionHandlers.size === 0 && state.source) {
    state.source.close();
    state.source = null;
  }
}

/**
 * One EventSource for the whole shell (window singleton — safe with Module Federation).
 */
export function subscribeNotificationStream(handler: Handler): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const state = getState();
  state.handlers.add(handler);
  ensureConnected();

  return () => {
    state.handlers.delete(handler);
    maybeClose();
  };
}

/** SSE connection open/error status for UI badges. */
export function subscribeNotificationConnection(handler: ConnectionHandler): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const state = getState();
  state.connectionHandlers.add(handler);
  ensureConnected();
  if (state.source?.readyState === EventSource.OPEN) {
    handler(true);
  }

  return () => {
    state.connectionHandlers.delete(handler);
    maybeClose();
  };
}
