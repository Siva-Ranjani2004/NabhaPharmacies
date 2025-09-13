import React from 'react';
import { AuthContext, useAuthProvider } from '../hooks/useAuth';
import { LanguageContext, useLanguageProvider } from '../hooks/useLanguage';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const authProvider = useAuthProvider();
  const languageProvider = useLanguageProvider();

  return (
    <AuthContext.Provider value={authProvider}>
      <LanguageContext.Provider value={languageProvider}>
        {children}
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}




