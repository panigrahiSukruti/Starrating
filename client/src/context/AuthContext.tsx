import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; address: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('store_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('store_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('store_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('store_user', JSON.stringify(response.data.user));
      }
    } catch {
      localStorage.removeItem('store_token');
      localStorage.removeItem('store_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: loggedInUser } = response.data;

    localStorage.setItem('store_token', receivedToken);
    localStorage.setItem('store_user', JSON.stringify(loggedInUser));

    setToken(receivedToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    address: string;
  }): Promise<void> => {
    await api.post('/auth/register', data);
  };

  const logout = () => {
    localStorage.removeItem('store_token');
    localStorage.removeItem('store_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getDefaultRouteForRole = (role?: Role): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'STORE_OWNER':
      return '/owner/dashboard';
    case 'USER':
    default:
      return '/stores';
  }
};

