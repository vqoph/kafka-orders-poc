import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nProvider>
    </React.StrictMode>,
  );
}
