import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProviders } from './providers/AppProviders';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <AuthErrorBoundary>
          <App />
        </AuthErrorBoundary>
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>
);
