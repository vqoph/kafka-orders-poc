import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import {
  getThemePreference,
  onThemeChange,
  toggleTheme,
  type ThemePreference,
} from '../../theme';
import { cn } from '../../utils/cn';

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

const THEMES: { value: ThemePreference; icon: ComponentType<IconProps>; label: string }[] =
  [
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ];

export function ThemeSwitcher() {
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

  const CurrentIcon = THEMES.find((item) => item.value === preference)?.icon ?? Monitor;
  const label = THEMES.find((item) => item.value === preference)?.label ?? 'System';
  const isLight = preference === 'light';
  const isDark = preference === 'dark';

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label="Theme"
      title={`Theme: ${label}`}
      data-testid="theme-switcher"
      className={cn(
        'flex size-8 cursor-pointer items-center justify-center rounded-lg',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        isLight && 'text-warning',
        isDark && 'text-accent',
        !isLight && !isDark && 'text-muted hover:text-foreground',
      )}
    >
      <CurrentIcon
        className={cn('size-4', isLight && 'fill-warning/40')}
        aria-hidden
      />
    </button>
  );
}
