import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserSafetySettings, RoleType } from '@safewalk/shared-types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  safetySettings: UserSafetySettings | null;
  role: RoleType;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: 'user' | 'responder' | 'admin') => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [safetySettings, setSafetySettings] = useState<UserSafetySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setSafetySettings(data.safety_settings);
    } catch (err) {
      console.warn('Failed to fetch session profile:', err);
      api.setToken(null);
      setUser(null);
      setSafetySettings(null);
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      // Auto-load demo user for seamless startup preview
      loginAsDemo('user').finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setSafetySettings(res.safety_settings);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: 'user' | 'responder' | 'admin') => {
    setIsLoading(true);
    try {
      const token = `demo-${role}`;
      api.setToken(token);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setSafetySettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        safetySettings,
        role: user?.role || 'USER',
        isLoading,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        register,
        logout,
        refreshProfile
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
