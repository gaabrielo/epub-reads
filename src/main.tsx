import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/epub-sw.js', { scope: '/' })
    .then((reg) => console.log('SW registered', reg))
    .catch(console.error);
}

createRoot(document.getElementById('root')!).render(<App />);
