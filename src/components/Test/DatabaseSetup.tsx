import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { initializeDatabase, checkDatabaseInitialized, migrateToPharmacySubcollections } from '../../utils/database-init';

export function DatabaseSetup() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const success = await initializeDatabase();
      if (success) {
        setIsInitialized(true);
      } else {
        setError('Failed to initialize database');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      const initialized = await checkDatabaseInitialized();
      setIsInitialized(initialized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setError(null);
    
    try {
      const success = await migrateToPharmacySubcollections();
      if (success) {
        setError('Migration completed successfully! Database now uses pharmacy subcollections.');
      } else {
        setError('Migration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Database Setup</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Database Status:</span>
          <span className={`font-medium ${isInitialized ? 'text-green-600' : 'text-yellow-600'}`}>
            {isInitialized ? '✅ Initialized' : '⚠️ Not Initialized'}
          </span>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={handleInitialize}
            disabled={isInitializing || isInitialized}
            variant="primary"
            className="w-full"
          >
            {isInitializing ? 'Initializing...' : 'Initialize Database'}
          </Button>
          
          <Button
            onClick={handleMigrate}
            disabled={isMigrating}
            variant="secondary"
            className="w-full"
          >
            {isMigrating ? 'Migrating...' : 'Migrate to Pharmacy Subcollections'}
          </Button>
          
          <Button
            onClick={handleCheckStatus}
            variant="secondary"
            className="w-full"
          >
            Check Status
          </Button>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            Error: {error}
          </div>
        )}
        
        {isInitialized && (
          <div className="text-green-600 text-sm p-2 bg-green-50 rounded">
            Database initialized successfully! You can now use the app with real data.
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This will create:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Admin and pharmacy users</li>
          <li>Sample pharmacy data</li>
          <li>Pharmacy-specific medicine catalog</li>
          <li>Pharmacy-specific stock inventory</li>
          <li>Multi-pharmacy structure: pharmacies/&#123;pharmacyId&#125;/medicines & stock</li>
        </ul>
      </div>
    </Card>
  );
}

