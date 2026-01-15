'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { chatAPI } from '../api/chat';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = chatAPI.getToken();
    if (token) {
      chatAPI.getMe()
        .then(setUser)
        .catch(() => {
          chatAPI.clearToken();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const data = await chatAPI.login(username, password);
    const userData = await chatAPI.getMe();
    setUser(userData);
  };

  const register = async (username: string, email: string, password: string) => {
    await chatAPI.register(username, email, password);
    await login(username, password);
  };

  const logout = () => {
    chatAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
