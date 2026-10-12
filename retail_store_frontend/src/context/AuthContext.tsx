import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserSummary } from '../types/auth';
import { authService } from '../api/authService';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserSummary>;
  logout: () => void;
  activeTenantSlug: string | null;
  setActiveTenantSlug: (slug: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => {
    const saved = localStorage.getItem('saas_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('saas_token'));
  const [activeTenantSlug, setActiveTenantSlugState] = useState<string | null>(() => localStorage.getItem('saas_tenant_slug'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setActiveTenantSlug = useCallback((slug: string | null) => {
    setActiveTenantSlugState(slug);
    if (slug) {
      localStorage.setItem('saas_tenant_slug', slug);
    } else {
      localStorage.removeItem('saas_tenant_slug');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setActiveTenantSlugState(null);
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_tenant_slug');
  }, []);

  // Check current user validity on mount
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('saas_token');
      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('saas_user', JSON.stringify(currentUser));
          if (currentUser.tenantSlug && !activeTenantSlug) {
            setActiveTenantSlug(currentUser.tenantSlug);
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [logout, activeTenantSlug, setActiveTenantSlug]);

  const login = async (email: string, password: string): Promise<UserSummary> => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('saas_token', response.token);
    localStorage.setItem('saas_user', JSON.stringify(response.user));

    if (response.user.tenantSlug) {
      setActiveTenantSlug(response.user.tenantSlug);
    } else {
      setActiveTenantSlug(null);
    }

    return response.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        activeTenantSlug,
        setActiveTenantSlug,
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
