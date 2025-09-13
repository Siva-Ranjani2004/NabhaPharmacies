import { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nabha-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Auth hook login called with:', { email, password });
    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedPassword = (password || '').trim();
      const { user, token } = await api.login(normalizedEmail, normalizedPassword);
      console.log('API login successful, user:', user);
      setUser(user);
      localStorage.setItem('nabha-user', JSON.stringify(user));
      localStorage.setItem('nabha-token', token);
      console.log('User state updated');
    } catch (err) {
      console.error('API login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nabha-user');
    localStorage.removeItem('nabha-token');
    // Clear all persisted stock updates on logout
    localStorage.removeItem('updated-stocks');
    localStorage.removeItem('last-updated-stock');
  };

  return {
    user,
    login,
    logout,
    isLoading,
    error
  };
}

export { AuthContext };