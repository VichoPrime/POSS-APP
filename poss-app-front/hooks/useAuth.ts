// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get('/check-auth');
      if (response.data.logged_in) {
        setUser({
          id: response.data.user_id,
          username: response.data.username,
          email: response.data.email,
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', { email, password });
      setUser({
        id: response.data.user_id,
        username: response.data.username,
        email: response.data.email,
      });
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
};