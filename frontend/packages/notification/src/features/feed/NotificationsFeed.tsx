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
  useTranslation,
} from '@poc/shared';
import { useListNotificationsQuery } from '../../api/notificationApi';
import { useNotificationStream } from '../../hooks/useNotificationStream';

export function NotificationsFeed() {
  const { t } = useTranslation(['notification', 'common']);
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
          title={t('title')}
          subtitle={t('subtitle')}
          actions={
            <Badge tone={connected ? 'success' : 'danger'} pill>
              {connected ? t('sseConnected') : t('sseDisconnected')}
            </Badge>
          }
        />

        <Field label={t('filterLabel')} className="max-w-sm">
          <Input
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value.trim())}
            placeholder={t('filterPlaceholder')}
            className="bg-panel"
          />
        </Field>

        {isLoading && <LoadingText />}
        {error && (
          <ErrorText>{errorMessage(error, t('loadFailed'))}</ErrorText>
        )}

        <ol className="space-y-2 border-l border-default pl-4">
          {events.length === 0 && !isLoading && (
            <li>
              <EmptyState>{t('empty')}</EmptyState>
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
                  <span className="font-mono text-accent">
                    {event.orderId ?? t('common:emDash')}
                  </span>
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
