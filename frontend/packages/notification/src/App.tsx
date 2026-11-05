import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { onPocEvent } from '@poc/shared';
import { useListNotificationsQuery } from './api/notificationApi';
import { useNotificationStream } from './hooks/useNotificationStream';
import { store } from './store';
import './styles.css';

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const err = error as { status?: number | string; data?: unknown };
    if (typeof err.data === 'string' && err.data) return err.data;
    if (err.status != null) return `Request failed (${err.status})`;
  }
  return fallback;
}

function NotificationsApp() {
  const [filterOrderId, setFilterOrderId] = useState('');
  const connected = useNotificationStream(filterOrderId);
  const {
    data: events = [],
    error,
    isLoading,
  } = useListNotificationsQuery({ orderId: filterOrderId || undefined });

  useEffect(() => {
    return onPocEvent('poc:order-selected', ({ orderId }) => {
      setFilterOrderId(orderId);
    });
  }, []);

  return (
    <div className="p-4 md:p-6">
      <section className="mx-auto max-w-3xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            <p className="mt-1 text-sm text-muted">Live SSE stream plus optional order filter.</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              connected ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
            }`}
          >
            {connected ? 'SSE connected' : 'SSE disconnected'}
          </span>
        </header>

        <label className="block max-w-sm space-y-1 text-sm">
          <span className="text-muted">Filter by order id</span>
          <input
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value.trim())}
            placeholder="optional"
            className="w-full rounded-md border border-default bg-panel px-3 py-2 text-foreground"
          />
        </label>

        {isLoading && <p className="text-sm text-muted">Loading…</p>}
        {error && (
          <p className="text-sm text-danger">
            {errorMessage(error, 'Failed to load notifications')}
          </p>
        )}

        <ol className="space-y-2 border-l border-default pl-4">
          {events.length === 0 && !isLoading && (
            <li className="text-sm text-muted">No notifications yet.</li>
          )}
          {events.map((event, index) => (
            <li
              key={`${event.orderId ?? 'none'}-${event.at}-${index}`}
              className="relative rounded-lg border border-default bg-panel px-4 py-3"
            >
              <span className="absolute left-[-1.35rem] top-5 h-2.5 w-2.5 rounded-full bg-accent" />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span className="font-mono text-accent">{event.orderId ?? '—'}</span>
                <span>{event.at}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{event.message}</p>
              {event.type && (
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">{event.type}</p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NotificationsApp />
    </Provider>
  );
}
