'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserCompany {
  id: string;
  legalName: string;
  taxNo?: string | null;
  taxOffice?: string | null;
  status: string;
  customerGroup?: {
    id: string;
    name: string;
    code: string;
  } | null;
  currentAccount?: {
    creditLimit: number;
  } | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  role: string;
  status: string;
  company?: UserCompany | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isB2B: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'ersa_authenticated_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem(USER_STORAGE_KEY);
    }
    return true;
  });

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          }
        } else {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      }
    } catch {
      // Keep existing local user on temporary network glitch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Giriş başarısız');
    }
    setUser(data.user);
    if (typeof window !== 'undefined' && data.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const isB2B = user?.role === 'B2B_CUSTOMER' || user?.role === 'DEALER' || user?.role === 'WHOLESALER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isB2B,
        isAdmin,
        login,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth bir AuthProvider içinde kullanılmalıdır');
  }
  return context;
}
