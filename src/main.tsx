import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      if (import.meta.env.PROD) {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('Service worker registered:', reg))
          .catch((err) => console.warn('Service worker registration failed:', err));
      }
    } catch (err) {
      // ignore (import.meta may not exist in some contexts)
      console.warn('SW register error', err);
    }
  });
}
