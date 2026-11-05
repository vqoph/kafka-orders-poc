import i18n from 'i18next';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import commonEn from './locales/en/common.json';
import shellEn from './locales/en/shell.json';
import ordersEn from './locales/en/orders.json';
import inventoryEn from './locales/en/inventory.json';
import paymentEn from './locales/en/payment.json';
import notificationEn from './locales/en/notification.json';
import commonFr from './locales/fr/common.json';
import shellFr from './locales/fr/shell.json';
import ordersFr from './locales/fr/orders.json';
import inventoryFr from './locales/fr/inventory.json';
import paymentFr from './locales/fr/payment.json';
import notificationFr from './locales/fr/notification.json';
import { getLocale } from './localeApi';

export type { Locale } from './localeApi';
export {
  LOCALES,
  getLocale,
  onLocaleChange,
  setLocale,
  toggleLocale,
} from './localeApi';

const resources = {
  en: {
    common: commonEn,
    shell: shellEn,
    orders: ordersEn,
    inventory: inventoryEn,
    payment: paymentEn,
    notification: notificationEn,
  },
  fr: {
    common: commonFr,
    shell: shellFr,
    orders: ordersFr,
    inventory: inventoryFr,
    payment: paymentFr,
    notification: notificationFr,
  },
};

let initialized = false;

export function initI18n(): typeof i18n {
  if (!initialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: getLocale(),
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'shell', 'orders', 'inventory', 'payment', 'notification'],
      interpolation: { escapeValue: false },
    });
    initialized = true;
  } else if (i18n.language !== getLocale()) {
    void i18n.changeLanguage(getLocale());
  }
  return i18n;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  initI18n();
  return createElement(I18nextProvider, { i18n }, children);
}

export { i18n, useTranslation };
