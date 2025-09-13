import React, { useState } from 'react';
import { ArrowLeft, User, Settings, LogOut, Globe, Menu, X, Home, BarChart3 } from 'lucide-react';
// Using provided PNG logo
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - allow importing asset with spaces in the filename
import logoSrc from '../../../ChatGPT Image Sep 11, 2025, 01_26_10 PM.png';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showProfile?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  onHomeClick?: () => void;
  showReports?: boolean;
  onReportsClick?: () => void;
  currentScreen?: string;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export function Header({ title, showBack, onBack, showProfile, showMenu, onMenuClick, onHomeClick, showReports, onReportsClick, currentScreen, onLoginClick, onRegisterClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Auto-show Reports for admin users, Profile for all logged-in users
  const shouldShowReports = user?.role === 'admin' && onReportsClick;
  const shouldShowProfile = !!user;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="app-container px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back/Menu Button */}
          {showBack ? (
            <button
              onClick={onBack}
              className="mobile-nav p-2 text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] items-center justify-center"
              aria-label={t('back', language)}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : showMenu ? (
            <button
              onClick={onMenuClick}
              className="mobile-nav p-2 text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] items-center justify-center"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : null}

          {/* Logo and Brand Name - Always visible */}
          <div className="flex items-center space-x-3">
            <img src={logoSrc} alt="Nabha Pharmacies" width={40} height={40} className="rounded" />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg lg:text-xl">
                {title || t('app_name', language)}
              </span>
              <span className="text-xs lg:text-sm text-gray-600 -mt-1">
                Nabha Pharmacies
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Home Button */}
          {onHomeClick && (
            <button
              onClick={onHomeClick}
              className="p-2 text-gray-600 hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center lg:min-w-[40px] lg:min-h-[40px]"
              aria-label="Home"
              title="Go to Home"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {/* Reports Button */}
          {shouldShowReports && (
            <button
              onClick={onReportsClick}
              className="p-2 text-gray-600 hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center lg:min-w-[40px] lg:min-h-[40px]"
              aria-label="Reports"
              title="Reports & Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          )}

          

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'pa')}
            className="text-xs lg:text-sm border border-gray-300 rounded px-2 py-1 bg-white min-h-[32px] lg:min-h-[36px]"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>

          {/* Login and Register Buttons - Only show when user is not logged in */}
          {!user && onLoginClick && onRegisterClick && (
            <>
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors min-h-[32px] lg:min-h-[36px]"
              >
                {t('login', language)}
              </button>
              <button
                onClick={onRegisterClick}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors min-h-[32px] lg:min-h-[36px]"
              >
                {t('create_account', language)}
              </button>
            </>
          )}

          {/* User Menu */}
          {user && shouldShowProfile && (
            <div className="relative">
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center lg:min-w-[40px] lg:min-h-[40px]"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="w-5 h-5" />
              </button>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 lg:w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-green-600 capitalize">{user.role}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded min-h-[44px] lg:min-h-[40px]">
                        <Settings className="w-4 h-4" />
                        <span>{t('settings', language)}</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded min-h-[44px] lg:min-h-[40px]"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout', language)}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}