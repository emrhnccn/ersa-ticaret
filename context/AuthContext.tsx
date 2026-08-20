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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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
  };

  const logout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
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
