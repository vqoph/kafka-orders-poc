import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import {
  getThemePreference,
  onThemeChange,
  toggleTheme,
  type ThemePreference,
} from '../../theme';

type IconProps = SVGProps<SVGSVGElement>;

function Monitor(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

function Sun(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function Moon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

const THEMES: { value: ThemePreference; icon: ComponentType<IconProps>; labelKey: string }[] =
  [
    { value: 'system', icon: Monitor, labelKey: 'theme.system' },
    { value: 'light', icon: Sun, labelKey: 'theme.light' },
    { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  ];

export function ThemeSwitcher() {
  const { t } = useTranslation('common');
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPreference(getThemePreference());
    setMounted(true);
    return onThemeChange(setPreference);
  }, []);

  if (!mounted) {
    return <div className="size-8 rounded-lg border border-default bg-panel" aria-hidden />;
  }

  const current = THEMES.find((item) => item.value === preference) ?? THEMES[0]!;
  const CurrentIcon = current.icon;
  const label = t(current.labelKey);
  const isLight = preference === 'light';
  const isDark = preference === 'dark';

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={t('theme.ariaLabel')}
      title={t('theme.title', { label })}
      data-testid="theme-switcher"
      className={clsx(
        // layout
        'flex size-8 cursor-pointer items-center justify-center rounded-lg',
        // interaction
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        // state
        {
          'text-warning': isLight,
          'text-accent': isDark,
          'text-muted hover:text-foreground': !isLight && !isDark,
        },
      )}
    >
      <CurrentIcon
        className={clsx('size-4', { 'fill-warning/40': isLight })}
        aria-hidden
      />
    </button>
  );
}
