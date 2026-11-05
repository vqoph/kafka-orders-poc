import { useEffect, useState } from 'react';
import { getTheme, onThemeChange, toggleTheme, type ThemeMode } from '@poc/shared';

function PaletteIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getTheme());

  useEffect(() => onThemeChange(setTheme), []);

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted transition hover:text-accent"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      aria-label={`Current theme ${theme}. Click to switch.`}
    >
      <span className="relative inline-flex h-4 w-6 shrink-0 items-center" aria-hidden="true">
        <span className="absolute left-0 h-3.5 w-3.5 rounded-full border border-default bg-surface" />
        <span className="absolute left-2.5 h-3.5 w-3.5 rounded-full bg-accent" />
      </span>
      <PaletteIcon />
      <span className="text-sm lowercase">{theme}</span>
    </button>
  );
}
