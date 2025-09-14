import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { useAuth } from '../../hooks/useAuth';

export function AuthTest() {
  const { user, login, logout, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Firebase Auth Test</h3>
      
      {user ? (
        <div className="space-y-4">
          <div className="text-green-600 font-medium">
            ✅ Signed in as: {user.name}
          </div>
          <div className="text-sm text-gray-600">
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            {user.pharmacy_id && <p>Pharmacy ID: {user.pharmacy_id}</p>}
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>Test accounts:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Admin: admin@nabha.gov.in / admin123</li>
              <li>Pharmacy: pharmacy@nabhamedical.com / pharmacy123</li>
            </ul>
          </div>
        </form>
      )}
    </Card>
  );
}

