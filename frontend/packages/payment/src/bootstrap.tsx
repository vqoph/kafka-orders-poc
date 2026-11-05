import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider, initI18n, initTheme } from '@poc/shared';
import App from './App';
import './styles.css';

initTheme();
initI18n();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </React.StrictMode>,
  );
}
