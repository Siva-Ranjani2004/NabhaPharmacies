import { useState } from 'react';
import { Button } from '../UI/Button';
import { Header } from '../Layout/Header';
import { ContactModal } from '../Modals/ContactModal';
import { LearnModal } from '../Modals/LearnModal';
import { FirebaseTest } from '../Test/FirebaseTest';
import { DatabaseSetup } from '../Test/DatabaseSetup';
import { AuthTest } from '../Test/AuthTest';
import { IntegrationTest } from '../Test/IntegrationTest';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../utils/translations';
// Using provided PNG logo
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - allow importing asset with spaces in the filename
import logoSrc from '../../../ChatGPT Image Sep 11, 2025, 01_26_10 PM.png';
import { CheckCircle, Wifi, Eye } from 'lucide-react';

interface HomePageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onDashboardClick?: () => void;
}

export function HomePage({ onLoginClick, onRegisterClick, onDashboardClick }: HomePageProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        title={t('app_name', language)} 
        onHomeClick={onDashboardClick}
        onReportsClick={onDashboardClick}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />
      
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center hero-gradient">
        <div className="app-container px-4 py-8 lg:py-12 w-full">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center space-y-12 fade-in">
              {/* Logo and Title */}
              <div className="space-y-8">
                <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto shadow-2xl">
                  <img 
                    src={logoSrc} 
                    alt="Nabha Pharmacies" 
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    {t('app_name', language)}
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
                  <p className="text-xl lg:text-3xl text-green-600 font-semibold">
                    {t('tagline', language)}
                  </p>
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                    {t('description', language)}
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white shadow-professional hover:shadow-professional-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('daily_updates', language)}</h3>
                  <p className="text-gray-600 text-center text-sm">Real-time inventory tracking</p>
                </div>
                
                <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white shadow-professional hover:shadow-professional-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wifi className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('offline_first', language)}</h3>
                  <p className="text-gray-600 text-center text-sm">Works without internet connection</p>
                </div>
                
                <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white shadow-professional hover:shadow-professional-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('monitored_by', language)}</h3>
                  <p className="text-gray-600 text-center text-sm">Government oversight and compliance</p>
                </div>
              </div>

              {/* Firebase Connection Test */}
              <div className="space-y-8">
                <div className="max-w-md mx-auto">
                  <FirebaseTest />
                </div>
              </div>

              {/* Database Setup */}
              <div className="space-y-8">
                <div className="max-w-md mx-auto">
                  <DatabaseSetup />
                </div>
              </div>

              {/* Firebase Auth Test */}
              <div className="space-y-8">
                <div className="max-w-md mx-auto">
                  <AuthTest />
                </div>
              </div>

              {/* Integration Test */}
              <div className="space-y-8">
                <div className="max-w-md mx-auto">
                  <IntegrationTest />
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-8">
                {!user ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                      <Button
                        onClick={onLoginClick}
                        variant="primary"
                        size="lg" 
                        className="text-lg py-4 px-8 w-full sm:w-auto shadow-professional hover:shadow-professional-lg transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        {t('login_to_continue', language)}
                      </Button>
                      
                      <Button
                        onClick={onRegisterClick}
                        variant="secondary"
                        size="lg" 
                        className="text-lg py-4 px-8 w-full sm:w-auto shadow-professional hover:shadow-professional-lg transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        {t('create_account', language)}
                      </Button>
                    </div>
                    
                    <button 
                      onClick={() => setShowLearnModal(true)}
                      className="text-blue-600 text-base lg:text-lg hover:text-blue-700 hover:underline transition-colors min-h-[44px] flex items-center justify-center mx-auto"
                    >
                      {t('learn_how', language)}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 max-w-2xl mx-auto shadow-professional">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Welcome back, {user.name}!</h3>
                        <p className="text-gray-600">
                          You're already logged in. Use the navigation above to access your dashboard.
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowLearnModal(true)}
                      className="text-blue-600 text-base lg:text-lg hover:text-blue-700 hover:underline transition-colors min-h-[44px] flex items-center justify-center mx-auto"
                    >
                      {t('learn_how', language)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="app-container px-4 py-8 lg:py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full relative">
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold text-gray-900 text-lg">
                {t('app_name', language)}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-600 text-sm lg:text-base">
                {t('powered_by', language)}
              </p>
              <p className="text-gray-500 text-xs">
                Version 1.0.0 • © 2024 Nabha Pharmacies
              </p>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={() => setShowContactModal(true)}
                className="text-blue-600 text-sm lg:text-base hover:text-blue-700 hover:underline transition-colors min-h-[44px] flex items-center justify-center mx-auto"
              >
                {t('contact_queries', language)}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}
      {showLearnModal && (
        <LearnModal onClose={() => setShowLearnModal(false)} />
      )}
    </div>
  );
}