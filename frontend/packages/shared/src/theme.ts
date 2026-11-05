export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'poc-theme';

export function getTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'dark') return current;
  }

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent('poc:theme-changed', { detail: { theme } }));
}

export function initTheme(): ThemeMode {
  const theme = getTheme();
  applyTheme(theme);
  return theme;
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function onThemeChange(handler: (theme: ThemeMode) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const listener = (event: Event) => {
    const custom = event as CustomEvent<{ theme: ThemeMode }>;
    handler(custom.detail.theme);
  };

  window.addEventListener('poc:theme-changed', listener);
  return () => window.removeEventListener('poc:theme-changed', listener);
}
