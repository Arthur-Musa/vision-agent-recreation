import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TenantProvider } from './contexts/TenantContext'

console.log('Main: Starting application');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Main: Root element not found');
  throw new Error('Root element not found');
}

console.log('Main: Root element found, creating React root');

createRoot(rootElement).render(
  <TenantProvider>
    <App />
  </TenantProvider>
);

console.log('Main: React app rendered');
