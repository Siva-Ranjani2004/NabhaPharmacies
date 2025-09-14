import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';

export function IntegrationTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults({});

    const tests = [
      {
        name: 'Authentication',
        test: async () => {
          if (!user) throw new Error('No user logged in');
          return `Logged in as ${user.name} (${user.role})`;
        }
      },
      {
        name: 'Stock Data',
        test: async () => {
          if (!user?.pharmacy_id) throw new Error('No pharmacy ID');
          const stock = await api.getStock(user.pharmacy_id);
          return `Found ${stock.length} stock items`;
        }
      },
      {
        name: 'Activity Log',
        test: async () => {
          if (!user?.pharmacy_id) throw new Error('No pharmacy ID');
          const logs = await api.getActivityLog(user.pharmacy_id);
          return `Found ${logs.length} activity logs`;
        }
      },
      {
        name: 'Pharmacies List',
        test: async () => {
          const pharmacies = await api.getPharmacies();
          return `Found ${pharmacies.length} pharmacies`;
        }
      }
    ];

    for (const test of tests) {
      setTestResults(prev => ({ ...prev, [test.name]: 'pending' }));
      
      try {
        const result = await test.test();
        setTestResults(prev => ({ ...prev, [test.name]: 'success' }));
        console.log(`✅ ${test.name}: ${result}`);
      } catch (error) {
        setTestResults(prev => ({ ...prev, [test.name]: 'error' }));
        console.error(`❌ ${test.name}:`, error);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⭕';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Integration Test</h3>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          {user ? (
            <p>Testing with user: <strong>{user.name}</strong> ({user.role})</p>
          ) : (
            <p>Please log in to run tests</p>
          )}
        </div>

        <Button
          onClick={runTests}
          disabled={isRunning || !user}
          variant="primary"
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {Object.entries(testResults).map(([testName, status]) => (
              <div key={testName} className="flex items-center justify-between">
                <span>{testName}:</span>
                <span className={`font-medium ${getStatusColor(status)}`}>
                  {getStatusIcon(status)} {status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

