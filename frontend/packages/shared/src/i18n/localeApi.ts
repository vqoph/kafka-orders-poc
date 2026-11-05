import i18n from 'i18next';
import {
  getStoredLocale,
  LOCALE_CHANGE_EVENT,
  persistLocale,
  type Locale,
} from './locale';

export type { Locale } from './locale';
export { LOCALES, onLocaleChange } from './locale';

export function getLocale(): Locale {
  return getStoredLocale();
}

export function setLocale(locale: Locale): void {
  persistLocale(locale);
  void i18n.changeLanguage(locale);
  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }));
}

export function toggleLocale(): void {
  setLocale(getLocale() === 'en' ? 'fr' : 'en');
}
