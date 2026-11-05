export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'poc-theme';
const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function resolvedTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getThemePreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isPreference(stored) ? stored : 'system';
}

export function setTheme(preference: ThemePreference): void {
  localStorage.setItem(STORAGE_KEY, preference);
  document.documentElement.dataset.theme = resolvedTheme(preference);
  window.dispatchEvent(new CustomEvent('poc:theme-changed', { detail: preference }));
}

export function initTheme(): void {
  setTheme(getThemePreference());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') setTheme('system');
  });
}

export function toggleTheme(): void {
  const current = getThemePreference();
  setTheme(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!);
}

export function onThemeChange(handler: (preference: ThemePreference) => void): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<ThemePreference>).detail);
  };
  window.addEventListener('poc:theme-changed', listener);
  return () => window.removeEventListener('poc:theme-changed', listener);
}
