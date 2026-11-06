import { useCallback, useEffect, useRef, useState, type ReactNode, type TransitionEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Button } from '../atoms/Button';
import { PageHeader } from '../molecules/PageHeader';

const EXIT_MS = 200;

export type SidePanelProps = {
  title: string;
  onClose: () => void;
  /** Called as soon as the user requests close (before the exit animation). */
  onExitStart?: () => void;
  children: ReactNode;
  className?: string;
};

export function SidePanel({
  title,
  onClose,
  onExitStart,
  children,
  className,
}: SidePanelProps) {
  const { t } = useTranslation('common');
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const closedRef = useRef(false);
  const visible = entered && !exiting;

  const finishClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestClose = useCallback(() => {
    if (exiting || closedRef.current) return;
    onExitStart?.();
    setExiting(true);
  }, [exiting, onExitStart]);

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(finishClose, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [exiting, finishClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [requestClose]);

  function onPanelTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    // Tailwind v4 may animate `translate` instead of `transform`
    if (event.propertyName !== 'transform' && event.propertyName !== 'translate') return;
    if (exiting) finishClose();
  }

  return (
    <div
      className={clsx(
        // layout
        'fixed inset-0 z-40 flex justify-end',
        // state
        { 'pointer-events-none': !visible },
      )}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label={t('closePanel')}
        className={clsx(
          // layout / surface
          'absolute inset-0 bg-foreground/30',
          // motion
          'transition-opacity duration-200',
          // state
          {
            'pointer-events-auto opacity-100': visible,
            'opacity-0': !visible,
          },
        )}
        onClick={requestClose}
      />
      <aside
        className={clsx(
          // layout / surface
          'relative z-10 flex h-full w-full max-w-xl flex-col border-l border-default bg-panel shadow-lg',
          // motion
          'pointer-events-auto transition-transform duration-200 ease-out',
          // state
          {
            'translate-x-0': visible,
            'translate-x-full': !visible,
          },
          className,
        )}
        onTransitionEnd={onPanelTransitionEnd}
      >
        <div className="border-b border-default px-4 py-4">
          <PageHeader
            title={title}
            actions={
              <Button variant="ghost" onClick={requestClose} aria-label={t('close')}>
                {t('close')}
              </Button>
            }
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}
