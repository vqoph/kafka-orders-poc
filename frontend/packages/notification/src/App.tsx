import { useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  listNotifications,
  notificationsStreamUrl,
  onPocEvent,
  type NotificationMessage,
} from '@poc/shared';
import './styles.css';

function parseEventData(raw: string): NotificationMessage | null {
  try {
    const parsed = JSON.parse(raw) as NotificationMessage;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      ...parsed,
      orderId: parsed.orderId ?? 'unknown',
      message: parsed.message ?? raw,
    };
  } catch {
    return {
      orderId: 'unknown',
      message: raw,
      timestamp: new Date().toISOString(),
    };
  }
}

export default function App() {
  const [events, setEvents] = useState<NotificationMessage[]>([]);
  const [filterOrderId, setFilterOrderId] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onPocEvent('poc:order-selected', ({ orderId }) => {
      setFilterOrderId(orderId);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const history = await listNotifications(filterOrderId || undefined);
        if (!cancelled) {
          setEvents(history);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load notifications');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterOrderId]);

  useEffect(() => {
    const source = new EventSource(notificationsStreamUrl());
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (event) => {
      const parsed = parseEventData(event.data);
      if (!parsed) return;
      if (filterOrderId && parsed.orderId !== filterOrderId) return;
      setEvents((prev) => [parsed, ...prev].slice(0, 100));
    };
    return () => source.close();
  }, [filterOrderId]);

  const statusLabel = useMemo(
    () => (connected ? 'SSE connected' : 'SSE disconnected'),
    [connected],
  );

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
            {statusLabel}
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

        {error && <p className="text-sm text-danger">{error}</p>}

        <ol className="space-y-2 border-l border-default pl-4">
          {events.length === 0 && <li className="text-sm text-muted">No notifications yet.</li>}
          {events.map((event, index) => (
            <li
              key={`${event.id ?? event.timestamp ?? index}-${index}`}
              className="relative rounded-lg border border-default bg-panel px-4 py-3"
            >
              <span className="absolute left-[-1.35rem] top-5 h-2.5 w-2.5 rounded-full bg-accent" />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span className="font-mono text-accent">{event.orderId}</span>
                <span>{event.timestamp ?? '—'}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{event.message}</p>
              {(event.type || event.status) && (
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                  {[event.type, event.status].filter(Boolean).join(' · ')}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
