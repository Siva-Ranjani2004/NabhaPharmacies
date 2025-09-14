import { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '../types';
import { firebaseService } from '../services/firebase-service';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up Firebase Auth state listener
    const unsubscribe = firebaseService.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        localStorage.setItem('nabha-user', JSON.stringify(user));
      } else {
        localStorage.removeItem('nabha-user');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Auth hook login called with:', { email, password });
    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedPassword = (password || '').trim();
      const { user, token } = await firebaseService.signIn(normalizedEmail, normalizedPassword);
      console.log('Firebase login successful, user:', user);
      setUser(user);
      localStorage.setItem('nabha-user', JSON.stringify(user));
      localStorage.setItem('nabha-token', token);
      console.log('User state updated');
    } catch (err) {
      console.error('Firebase login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseService.signOut();
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
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