import React, { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { Header } from '../Layout/Header';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onHomeClick?: () => void;
}

export function LoginPage({ onBack, onHomeClick }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with:', { email, password });
    try {
      await login(email.trim().toLowerCase(), password.trim());
      console.log('Login successful');
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header showBack onBack={onBack} title={t('login', language)} onHomeClick={onHomeClick} />
      
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card padding="lg" className="shadow-professional-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Header Section */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-6 h-6 border-3 border-green-600 rounded-full relative">
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full"></div>
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                {t('login', language)}
              </h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
                  <p className="text-gray-600 text-lg">
                Enter your credentials to continue
              </p>
                </div>
            </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('pharmacy_id', language)}
                  </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                placeholder="Enter your email address"
                    className="h-12 text-base"
              />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('password', language)}
                  </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter your password"
                      className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
              </div>
            )}

              {/* Forgot Password */}
            <div className="flex justify-center">
                <button 
                  type="button" 
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-colors min-h-[44px] flex items-center"
                >
                {t('forgot_password', language)}
              </button>
            </div>

              {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
                className="h-14 text-lg font-semibold shadow-professional hover:shadow-professional-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {t('login', language)}
            </Button>

              {/* Terms */}
              <div className="text-center">
                <p className="text-sm text-gray-500 leading-relaxed">
              By logging in, you agree to Punjab Health Department's terms & policies.
                </p>
            </div>

            {/* Demo Credentials */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="text-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-blue-800">Demo Credentials</p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-semibold text-gray-800">Admin Access</p>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Email:</span> admin@nabha.gov.in</p>
                      <p><span className="font-medium">Password:</span> admin123</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-semibold text-gray-800">Pharmacy Access</p>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Email:</span> pharmacy@nabhamedical.com</p>
                      <p><span className="font-medium">Password:</span> pharmacy123</p>
                    </div>
                  </div>
              </div>
            </div>
          </form>
        </Card>
        </div>
      </main>
    </div>
  );
}