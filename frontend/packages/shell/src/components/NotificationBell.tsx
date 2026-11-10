import { useEffect, useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
  Badge,
  EmptyState,
  subscribeNotificationConnection,
  subscribeNotificationStream,
  useTranslation,
  type PocNotificationEvent,
} from '@poc/shared';

const MAX_EVENTS = 100;

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function formatAt(at: string): string {
  try {
    return new Date(at).toLocaleString();
  } catch {
    return at;
  }
}

export function NotificationBell() {
  const { t } = useTranslation(['notification', 'common', 'shell']);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<PocNotificationEvent[]>([]);
  const [unread, setUnread] = useState(0);

  openRef.current = open;

  useEffect(() => {
    return subscribeNotificationConnection(setConnected);
  }, []);

  useEffect(() => {
    return subscribeNotificationStream((event) => {
      if (event.type === 'CONNECTED') return;
      setEvents((prev) => {
        const next = [event, ...prev];
        if (next.length > MAX_EVENTS) next.length = MAX_EVENTS;
        return next;
      });
      if (!openRef.current) {
        setUnread((count) => count + 1);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    setOpen((wasOpen) => {
      if (!wasOpen) setUnread(0);
      return !wasOpen;
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={clsx(
          'relative flex size-8 items-center justify-center rounded-lg transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
          open ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground',
        )}
        aria-label={t('shell:nav.notifications')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        title={t('shell:nav.notifications')}
        onClick={toggle}
      >
        <BellIcon className="size-4" />
        {unread > 0 && !open ? (
          <span className="absolute right-1 top-1 flex min-w-3.5 items-center justify-center rounded-full bg-danger px-0.5 text-[9px] font-semibold leading-3 text-on-accent">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('title')}
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-default bg-panel shadow-lg"
        >
          <div className="flex items-start justify-between gap-3 border-b border-default px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t('title')}</p>
              <p className="mt-0.5 text-xs text-muted">{t('subtitle')}</p>
            </div>
            <Badge tone={connected ? 'success' : 'danger'} pill>
              {connected ? t('sseConnected') : t('sseDisconnected')}
            </Badge>
          </div>

          <ol className="max-h-80 overflow-y-auto">
            {events.length === 0 ? (
              <li className="px-3 py-6">
                <EmptyState>{t('empty')}</EmptyState>
              </li>
            ) : (
              events.map((event, index) => (
                <li
                  key={`${event.orderId ?? 'none'}-${event.at}-${index}`}
                  className="border-b border-default px-3 py-2.5 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span className="font-mono text-accent">
                      {event.orderId ?? t('common:emDash')}
                    </span>
                    <span>{formatAt(event.at)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-foreground">{event.message}</p>
                    {typeof event.success === 'boolean' ? (
                      <Badge tone={event.success ? 'success' : 'danger'} pill>
                        {event.success ? t('outcomeOk') : t('outcomeKo')}
                      </Badge>
                    ) : null}
                  </div>
                  {event.type ? (
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">
                      {event.type}
                    </p>
                  ) : null}
                </li>
              ))
            )}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
