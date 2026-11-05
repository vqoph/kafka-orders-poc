import React from 'react';
import { createRoot } from 'react-dom/client';
import { initTheme } from '@poc/shared';
import App from './App';
import './styles.css';

initTheme();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
