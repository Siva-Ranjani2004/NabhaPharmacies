import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { HomePage } from './components/Home/HomePage';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { PharmacyDashboard } from './components/Pharmacy/PharmacyDashboard';
import { UpdateStock } from './components/Pharmacy/UpdateStock';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ReportsAnalytics } from './components/Admin/ReportsAnalytics';
import { storage } from './utils/storage';
import type { Stock, Pharmacy } from './types';

type Screen = 
  | 'home' 
  | 'login' 
  | 'register' 
  | 'pharmacy-dashboard' 
  | 'update-stock' 
  | 'bulk-update' 
  | 'activity-log' 
  | 'settings' 
  | 'admin-dashboard'
  | 'admin-pharmacy-detail'
  | 'admin-reports';

function App() {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  // Initialize storage on app start
  useEffect(() => {
    storage.init();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  // Navigate based on user login status
  useEffect(() => {
    console.log('User state changed:', user, 'Current screen:', currentScreen);
    
    if (user) {
      // If user just logged in from login/register page, redirect to appropriate dashboard
      if (currentScreen === 'login' || currentScreen === 'register') {
        console.log('Redirecting from login/register to dashboard');
        if (user.role === 'admin') {
          setCurrentScreen('admin-dashboard');
        } else {
          setCurrentScreen('pharmacy-dashboard');
        }
      }
    }
  }, [user, currentScreen]);

  const handleUpdateStock = (stock: Stock) => {
    setSelectedStock(stock);
    setCurrentScreen('update-stock');
  };

  const handleStockUpdated = (updatedStock: Stock) => {
    // This would update the stock in the parent component
    console.log('Stock updated:', updatedStock);
    // The PharmacyDashboard will handle the stock update through its own state
  };

  const handleStockUpdateFromDashboard = (updatedStock: Stock) => {
    console.log('Stock update received in App:', updatedStock);
    // Persist the last updated stock so dashboard can reflect after redirect (simulation only)
    try {
      localStorage.setItem('last-updated-stock', JSON.stringify(updatedStock));
    } catch {}
    // Update the selected stock if it's the same one being updated
    if (selectedStock && selectedStock.id === updatedStock.id) {
      setSelectedStock(updatedStock);
      console.log('Selected stock updated:', updatedStock);
    }
  };

  const handlePharmacyDetail = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setCurrentScreen('admin-pharmacy-detail');
  };

  const handleHomeClick = () => {
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginPage 
            onBack={() => setCurrentScreen('home')} 
            onHomeClick={handleHomeClick}
          />
        );
      
      case 'register':
        return (
          <RegisterPage 
            onBack={() => setCurrentScreen('home')} 
            onHomeClick={handleHomeClick}
          />
        );
      
      case 'pharmacy-dashboard':
        return (
          <PharmacyDashboard
            onUpdateStock={handleUpdateStock}
            onBulkUpdate={() => setCurrentScreen('bulk-update')}
            onActivityLog={() => setCurrentScreen('activity-log')}
            onSettings={() => setCurrentScreen('settings')}
            onHomeClick={handleHomeClick}
            onStockUpdated={handleStockUpdateFromDashboard}
          />
        );
      
      case 'update-stock':
        return selectedStock ? (
          <UpdateStock
            stock={selectedStock}
            onBack={() => setCurrentScreen('pharmacy-dashboard')}
            onUpdated={handleStockUpdated}
            onHomeClick={handleHomeClick}
            onStockUpdate={handleStockUpdateFromDashboard}
          />
        ) : null;
      
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onPharmacyDetail={handlePharmacyDetail}
            onReports={() => setCurrentScreen('admin-reports')}
            onHomeClick={handleHomeClick}
          />
        );
      
      case 'admin-reports':
        return (
          <ReportsAnalytics
            onBack={() => setCurrentScreen('admin-dashboard')}
            onHomeClick={handleHomeClick}
            onReportsClick={() => setCurrentScreen('admin-reports')}
          />
        );
      
      case 'admin-pharmacy-detail':
        return (
          <div className="min-h-screen bg-gray-50">
            <Header 
              title="Pharmacy Details" 
              showBack 
              onBack={() => setCurrentScreen('admin-dashboard')}
              onHomeClick={handleHomeClick}
              onReportsClick={() => setCurrentScreen('admin-reports')}
            />
            <main className="app-container px-4 py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Pharmacy Detail Page</h1>
                <p className="text-gray-600">This page will show detailed pharmacy information.</p>
              </div>
            </main>
          </div>
        );
      
      default:
        return (
          <HomePage
            onLoginClick={() => setCurrentScreen('login')}
            onRegisterClick={() => setCurrentScreen('register')}
            onDashboardClick={() => setCurrentScreen(user?.role === 'admin' ? 'admin-dashboard' : 'pharmacy-dashboard')}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;