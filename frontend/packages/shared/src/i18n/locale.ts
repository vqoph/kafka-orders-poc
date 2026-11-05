export type Locale = 'en' | 'fr';

export const LOCALES: Locale[] = ['en', 'fr'];

const STORAGE_KEY = 'poc-locale';
export const LOCALE_CHANGE_EVENT = 'poc:locale-changed';

export function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'fr';
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const language = navigator.language?.toLowerCase() ?? '';
  return language.startsWith('fr') ? 'fr' : 'en';
}

export function getStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return detectBrowserLocale();
  const stored = localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : detectBrowserLocale();
}

export function persistLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
}

export function onLocaleChange(handler: (locale: Locale) => void): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<Locale>).detail);
  };
  window.addEventListener(LOCALE_CHANGE_EVENT, listener);
  return () => window.removeEventListener(LOCALE_CHANGE_EVENT, listener);
}
