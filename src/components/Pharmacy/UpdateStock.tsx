import React, { useState } from 'react';
import { Header } from '../Layout/Header';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { Toast } from '../UI/Toast';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';
import { api } from '../../utils/api';
import type { Stock } from '../../types';
import { Package, Plus, Minus } from 'lucide-react';

interface UpdateStockProps {
  stock: Stock;
  onBack: () => void;
  onUpdated: (updatedStock: Stock) => void;
  onHomeClick?: () => void;
  onStockUpdate?: (updatedStock: Stock) => void;
}

export function UpdateStock({ stock, onBack, onUpdated, onHomeClick, onStockUpdate }: UpdateStockProps) {
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(stock.quantity);
  const [outOfStock, setOutOfStock] = useState(stock.out_of_stock);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedStock = await api.updateStock({
        ...stock,
        quantity,
        out_of_stock: outOfStock || quantity === 0
      });
      
      // Store all updated stocks in localStorage for simulation persistence
      try {
        const existingUpdates = JSON.parse(localStorage.getItem('updated-stocks') || '[]') as Stock[];
        const updatedList = existingUpdates.filter(item => item.id !== updatedStock.id);
        updatedList.push(updatedStock);
        localStorage.setItem('updated-stocks', JSON.stringify(updatedList));
        
        // Also keep the last updated for backward compatibility
        localStorage.setItem('last-updated-stock', JSON.stringify(updatedStock));
      } catch (error) {
        console.error('Failed to save stock update to localStorage:', error);
      }
      
      setToast({ 
        message: t('stock_updated', language), 
        type: 'success' 
      });
      
      setTimeout(() => {
        onUpdated(updatedStock);
        // Call the stock update handler to update the dashboard
        if (onStockUpdate) {
          onStockUpdate(updatedStock);
        }
        onBack();
      }, 1000);
    } catch (error) {
      if (error instanceof Error && error.message === 'OFFLINE_SAVED') {
        setToast({ 
          message: t('saved_offline', language), 
          type: 'warning' 
        });
        setTimeout(() => {
          onBack();
        }, 1000);
      } else {
        setToast({ 
          message: 'Failed to update stock', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
    setOutOfStock(false);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(0, prev - 1));
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    setQuantity(Math.max(0, num));
    if (num === 0) {
      setOutOfStock(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={stock.medicine_name}
        showBack
        onBack={onBack}
        onHomeClick={onHomeClick}
      />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card className="p-8 bg-white shadow-xl border-0 rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {stock.medicine_name}
            </h1>
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm font-semibold text-gray-600">
                Current stock: <span className="text-blue-600 font-bold">{stock.quantity} {stock.unit}</span>
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quantity Control */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
                {t('quantity', language)}
              </label>
              <div className="flex items-center space-x-6">
                <Button
                  onClick={decrementQuantity}
                  variant="secondary"
                  size="sm"
                  className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-2 border-gray-200 hover:border-gray-300"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    value={quantity.toString()}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="text-center text-3xl font-bold border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl py-4"
                    fullWidth
                    min="0"
                  />
                  <p className="text-center text-sm font-semibold text-gray-600 mt-2">
                    {stock.unit}
                  </p>
                </div>

                <Button
                  onClick={incrementQuantity}
                  variant="secondary"
                  size="sm"
                  className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-2 border-gray-200 hover:border-gray-300"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Out of Stock Toggle */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${outOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <p className="font-semibold text-gray-900 text-lg">
                  {t('out_of_stock', language)}
                </p>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {outOfStock ? 'Medicine is currently unavailable' : 'Medicine is available for sale'}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => {
                  setOutOfStock(!outOfStock);
                  if (!outOfStock) {
                    setQuantity(0);
                  }
                }}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                    outOfStock 
                      ? 'bg-red-600 focus:ring-red-300' 
                      : 'bg-gray-300 focus:ring-gray-300'
                }`}
              >
                <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                      outOfStock ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  outOfStock ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {outOfStock ? 'UNAVAILABLE' : 'AVAILABLE'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button
                onClick={onBack}
                variant="secondary"
                size="lg"
                fullWidth
                className="py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('cancel', language)}
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('save', language)}
              </Button>
            </div>
          </div>
        </Card>

        {/* Previous Updates */}
        <Card className="p-6 bg-white shadow-lg border-0 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Previous Updates</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">
                Last updated: <span className="text-blue-600">{new Date(stock.last_updated_at).toLocaleDateString()}</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">
                Updated by: <span className="text-green-600">{stock.last_updated_by}</span>
              </span>
            </div>
          </div>
        </Card>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}