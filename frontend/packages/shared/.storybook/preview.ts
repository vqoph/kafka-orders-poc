import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import { I18nProvider, initI18n, setLocale, type Locale } from '../src/i18n';
import '@poc/config/tailwind/index.css';

initI18n();

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'padded',
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'UI locale',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'fr', title: 'Français' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    locale: 'en',
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || 'light';
      const locale = ((context.globals.locale as string) || 'en') as Locale;
      document.documentElement.dataset.theme = theme;
      setLocale(locale);
      return createElement(I18nProvider, null, createElement(Story));
    },
  ],
};

export default preview;
