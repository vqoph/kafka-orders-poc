import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import {
  getLocale,
  onLocaleChange,
  toggleLocale,
  type Locale,
} from '../../i18n/localeApi';

const LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
};

export function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getLocale());
    setMounted(true);
    return onLocaleChange(setLocaleState);
  }, []);

  if (!mounted) {
    return <div className="size-8 rounded-lg border border-default bg-panel" aria-hidden />;
  }

  const label = LABELS[locale];

  return (
    <button
      type="button"
      onClick={() => toggleLocale()}
      aria-label={t('language.ariaLabel')}
      title={t('language.title', { label })}
      data-testid="language-switcher"
      className={clsx(
        // layout
        'flex size-8 cursor-pointer items-center justify-center rounded-lg',
        // typography
        'text-xs font-semibold tracking-wide text-muted',
        // interaction
        'transition-colors duration-200 hover:text-foreground',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
      )}
    >
      {label}
    </button>
  );
}
