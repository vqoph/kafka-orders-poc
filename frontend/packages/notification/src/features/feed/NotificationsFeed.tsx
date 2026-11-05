import { useEffect, useState } from 'react';
import {
  Badge,
  EmptyState,
  ErrorText,
  Field,
  Input,
  ListCard,
  LoadingText,
  PageHeader,
  PageShell,
  errorMessage,
  onPocEvent,
} from '@poc/shared';
import { useListNotificationsQuery } from '../../api/notificationApi';
import { useNotificationStream } from '../../hooks/useNotificationStream';

export function NotificationsFeed() {
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
    <PageShell maxWidth="md">
      <section className="space-y-4">
        <PageHeader
          title="Notifications"
          subtitle="Live SSE stream plus optional order filter."
          actions={
            <Badge tone={connected ? 'success' : 'danger'} pill>
              {connected ? 'SSE connected' : 'SSE disconnected'}
            </Badge>
          }
        />

        <Field label="Filter by order id" className="max-w-sm">
          <Input
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value.trim())}
            placeholder="optional"
            className="bg-panel"
          />
        </Field>

        {isLoading && <LoadingText />}
        {error && (
          <ErrorText>{errorMessage(error, 'Failed to load notifications')}</ErrorText>
        )}

        <ol className="space-y-2 border-l border-default pl-4">
          {events.length === 0 && !isLoading && (
            <li>
              <EmptyState>No notifications yet.</EmptyState>
            </li>
          )}
          {events.map((event, index) => (
            <li
              key={`${event.orderId ?? 'none'}-${event.at}-${index}`}
              className="relative"
            >
              <span className="absolute left-[-1.35rem] top-5 h-2.5 w-2.5 rounded-full bg-accent" />
              <ListCard>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <span className="font-mono text-accent">{event.orderId ?? '—'}</span>
                  <span>{event.at}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{event.message}</p>
                {event.type && (
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                    {event.type}
                  </p>
                )}
              </ListCard>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
