import React, { useState, useEffect } from 'react';
import { Card } from '../UI/Card';

export function FirebaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [authStatus, setAuthStatus] = useState<'checking' | 'signed-in' | 'signed-out'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Dynamically import Firebase to avoid initialization issues
        const { auth, db } = await import('../../config/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const { onAuthStateChanged } = await import('firebase/auth');

        // Check if Firebase services are properly initialized
        if (!auth || !db) {
          setConnectionStatus('error');
          setAuthStatus('signed-out');
          setError('Firebase services not initialized');
          return;
        }

        // Test Firestore connection
        try {
          await getDocs(collection(db, 'test'));
          setConnectionStatus('connected');
        } catch (err) {
          console.error('Firestore connection error:', err);
          setConnectionStatus('error');
          setError(err instanceof Error ? err.message : 'Unknown error');
        }

        // Test Auth connection
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setAuthStatus('signed-in');
          } else {
            setAuthStatus('signed-out');
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setConnectionStatus('error');
        setAuthStatus('signed-out');
        setError(err instanceof Error ? err.message : 'Firebase initialization failed');
      }
    };

    const cleanup = testFirebase();
    
    return () => {
      cleanup.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'signed-in':
        return 'text-green-600';
      case 'testing':
      case 'checking':
        return 'text-yellow-600';
      case 'error':
      case 'signed-out':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Firebase Connection Test</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span>Firestore:</span>
          <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
            {connectionStatus === 'testing' ? 'Testing...' : 
             connectionStatus === 'connected' ? '✅ Connected' : '❌ Error'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Authentication:</span>
          <span className={`font-medium ${getStatusColor(authStatus)}`}>
            {authStatus === 'checking' ? 'Checking...' :
             authStatus === 'signed-in' ? '✅ Signed In' : '❌ Signed Out'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
            Error: {error}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Project ID: nabhapharmacies</p>
        <p>Auth Domain: nabhapharmacies.firebaseapp.com</p>
      </div>
    </Card>
  );
}
