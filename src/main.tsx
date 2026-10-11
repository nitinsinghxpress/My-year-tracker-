import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically register the service worker for full offline PWA / WebAPK support
registerSW({
  immediate: true,
  onNeedRefresh() {
    // New version available
  },
  onOfflineReady() {
    console.log('My Year Tracker is ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
