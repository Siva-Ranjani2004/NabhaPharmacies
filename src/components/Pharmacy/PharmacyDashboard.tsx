import React, { useState, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Toast } from '../UI/Toast';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useOnlineStatus } from '../../hooks/useOnline';
import { t } from '../../utils/translations';
import { api } from '../../utils/api';
import type { Stock } from '../../types';
import { Search, Package, Edit, Plus } from 'lucide-react';

interface PharmacyDashboardProps {
  onUpdateStock: (stock: Stock) => void;
  onBulkUpdate: () => void;
  onActivityLog: () => void;
  onSettings: () => void;
  onHomeClick?: () => void;
  onStockUpdated?: (updatedStock: Stock) => void;
}

export function PharmacyDashboard({
  onUpdateStock,
  onBulkUpdate,
  onActivityLog,
  onSettings,
  onHomeClick,
  onStockUpdated
}: PharmacyDashboardProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isOnline = useOnlineStatus();
  const [stock, setStock] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicineUnit, setNewMedicineUnit] = useState('tablets');
  const [newMedicineQty, setNewMedicineQty] = useState<number | ''>('');
  const [isAdding, setIsAdding] = useState(false);


  useEffect(() => {
    loadStock();
    // Apply all simulated updates if present (reflect after redirect)
    try {
      const savedUpdates = localStorage.getItem('updated-stocks');
      if (savedUpdates) {
        const updatedStocks = JSON.parse(savedUpdates) as Stock[];
        setStock(prev => prev.map(item => {
          const updated = updatedStocks.find(updated => updated.id === item.id);
          return updated ? { ...item, ...updated } : item;
        }));
      }
    } catch (error) {
      console.error('Failed to load persisted stock updates:', error);
    }
  }, [user?.pharmacy_id]);

  const loadStock = async () => {
    if (!user?.pharmacy_id) return;
    
    try {
      setLoading(true);
      const stockData = await api.getStock(user.pharmacy_id);
      // First set the freshly loaded stock
      setStock(stockData);
      // Then merge any simulated updates saved during redirect so they win over API data
      try {
        const savedUpdates = localStorage.getItem('updated-stocks');
        if (savedUpdates) {
          const updatedStocks = JSON.parse(savedUpdates) as Stock[];
          setStock(prev => prev.map(item => {
            const updated = updatedStocks.find(updated => updated.id === item.id);
            return updated ? { ...item, ...updated } : item;
          }));
        }
      } catch (error) {
        console.error('Failed to apply persisted stock updates:', error);
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
      setToast({ message: 'Failed to load stock data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter(item =>
    item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleQuickUpdate = async (stockItem: Stock, newQuantity: number) => {
    try {
      const updatedStock = await api.updateStock({
        ...stockItem,
        quantity: newQuantity,
        out_of_stock: newQuantity === 0
      });
      
      setStock(prev => prev.map(item => 
        item.id === stockItem.id ? updatedStock : item
      ));
      
      // Persist the update to localStorage for simulation
      try {
        const existingUpdates = JSON.parse(localStorage.getItem('updated-stocks') || '[]') as Stock[];
        const updatedList = existingUpdates.filter(item => item.id !== updatedStock.id);
        updatedList.push(updatedStock);
        localStorage.setItem('updated-stocks', JSON.stringify(updatedList));
        localStorage.setItem('last-updated-stock', JSON.stringify(updatedStock));
      } catch (error) {
        console.error('Failed to persist quick update:', error);
      }
      
      setToast({ 
        message: t('stock_updated', language), 
        type: 'success' 
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'OFFLINE_SAVED') {
        setToast({ 
          message: t('saved_offline', language), 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: 'Failed to update stock', 
          type: 'error' 
        });
      }
    }
  };

  const handleStockUpdate = (updatedStock: Stock) => {
    console.log('Updating stock in dashboard:', updatedStock);
    setStock(prev => prev.map(item => 
      item.id === updatedStock.id ? updatedStock : item
    ));
    
    // Persist the update to localStorage for simulation
    try {
      const existingUpdates = JSON.parse(localStorage.getItem('updated-stocks') || '[]') as Stock[];
      const updatedList = existingUpdates.filter(item => item.id !== updatedStock.id);
      updatedList.push(updatedStock);
      localStorage.setItem('updated-stocks', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Failed to persist stock update:', error);
    }
    
    // Call the parent handler if provided
    if (onStockUpdated) {
      onStockUpdated(updatedStock);
    }
  };

  const handleAddNewMedicine = async () => {
    if (!user?.pharmacy_id) return;
    const trimmedName = newMedicineName.trim();
    const trimmedUnit = newMedicineUnit.trim();

    if (!trimmedName || !trimmedUnit || newMedicineQty === '' || Number(newMedicineQty) < 0) {
      setToast({ message: 'Please enter medicine name, unit and a valid quantity', type: 'error' });
      return;
    }

    // Prevent duplicates by name (case-insensitive)
    const duplicate = stock.some(s => s.medicine_name.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) {
      setToast({ message: 'Medicine already exists in stock', type: 'warning' });
      return;
    }

    const now = new Date();
    const newStock: Partial<Stock> = {
      pharmacy_id: user.pharmacy_id,
      medicine_id: `med-${Date.now()}`,
      medicine_name: trimmedName,
      quantity: Number(newMedicineQty),
      unit: trimmedUnit,
      out_of_stock: Number(newMedicineQty) === 0,
      last_updated_by: user.name,
      last_updated_at: now,
      version: 0
    };

    try {
      setIsAdding(true);
      const saved = await api.updateStock(newStock);
      setStock(prev => [saved, ...prev]);

      // Persist the new item to localStorage simulation list
      try {
        const existingUpdates = JSON.parse(localStorage.getItem('updated-stocks') || '[]') as Stock[];
        existingUpdates.push(saved);
        localStorage.setItem('updated-stocks', JSON.stringify(existingUpdates));
      } catch (error) {
        console.error('Failed to persist new medicine:', error);
      }

      setToast({ message: 'Medicine added', type: 'success' });
      setNewMedicineName('');
      setNewMedicineUnit('tablets');
      setNewMedicineQty('');
    } catch (error) {
      if (error instanceof Error && error.message === 'OFFLINE_SAVED') {
        setStock(prev => [newStock, ...prev]);
        setToast({ message: t('saved_offline', language), type: 'warning' });
        setNewMedicineName('');
        setNewMedicineUnit('tablets');
        setNewMedicineQty('');
      } else {
        setToast({ message: 'Failed to add medicine', type: 'error' });
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={user?.name} showProfile onHomeClick={() => {
        // Explicitly navigate back to home screen via callback
        if (onHomeClick) onHomeClick();
      }} />
      
      <main className="app-container px-4 py-4 lg:py-8">
        <div className="space-y-6 lg:space-y-8">

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                fullWidth
              />
            </div>

            {/* Add New Medicine */}
            <Card className="p-4 lg:p-6 w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine name</label>
                  <Input value={newMedicineName} onChange={(e) => setNewMedicineName(e.target.value)} placeholder="e.g., Paracetamol 500mg" fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <Input value={newMedicineUnit} onChange={(e) => setNewMedicineUnit(e.target.value)} placeholder="tablets / capsules / ml" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <Input type="number" min={0} value={newMedicineQty} onChange={(e) => setNewMedicineQty(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
                </div>
                <div>
                  <Button onClick={handleAddNewMedicine} variant="primary" className="w-full" disabled={isAdding}>
                    <Plus className="w-4 h-4 mr-2" /> {isAdding ? 'Adding...' : 'Add Medicine'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Stock Overview */}

            {/* Medicine List */}
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              {loading ? (
                <Card className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ) : filteredStock.length === 0 ? (
                <Card className="text-center py-8 lg:col-span-2">
                  <Package className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No medicines found' : 'No medicines added yet'}
                  </p>
                </Card>
              ) : (
                filteredStock.map((item) => (
                  <Card
                    key={item.id}
                    className={`${
                      item.out_of_stock || item.quantity === 0 
                        ? 'border-red-200 bg-red-50' 
                        : 'hover:shadow-md'
                    } transition-shadow cursor-pointer p-4 lg:p-6`}
                    onClick={() => onUpdateStock(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-3 lg:text-lg">
                          {item.medicine_name}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <span className={`text-2xl font-bold ${
                            item.quantity === 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-sm lg:text-base text-gray-600">
                            {item.unit}
                          </span>
                          {(item.out_of_stock || item.quantity === 0) && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs lg:text-sm rounded-full">
                              {t('out_of_stock', language)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStock(item);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={onBulkUpdate}
        className="mobile-nav fixed bottom-20 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        aria-label="Bulk Update"
      >
        <Edit className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="app-container px-4 py-3">
          <div className="flex justify-around">
            <button
              onClick={onActivityLog}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-gray-600 hover:text-green-600 min-h-[44px]"
            >
              <Package className="w-5 h-5" />
              <span className="text-xs">Activity</span>
            </button>
            <button
              onClick={onSettings}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-gray-600 hover:text-green-600 min-h-[44px]"
            >
              <Edit className="w-5 h-5" />
              <span className="text-xs">{t('settings', language)}</span>
            </button>
          </div>
        </div>
      </nav>

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