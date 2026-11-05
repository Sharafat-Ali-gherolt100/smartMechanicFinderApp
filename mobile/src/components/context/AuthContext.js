import React, { createContext, useState, useContext, useEffect } from 'react';
import { authManager } from '../services/auth';
import { cacheUserProfile } from '../../utils/offlineCache';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      await authManager.init();
      if (mounted) {
        setUser(authManager.getUser());
        setIsAuthenticated(authManager.isAuthenticated());
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ─── actions ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const response = await authManager.login(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
    // Cache user profile for offline use
    if (response.user) {
      await cacheUserProfile(response.user);
    }
    return response;
  };

  const logout = async () => {
    await authManager.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData) => {
    const updated = await authManager.updateUser(userData);
    setUser(updated);
    return updated;
  };

  // ─── role helpers (call-through to authManager) ─────────────────────────────
  const isMechanic = () => authManager.isMechanic();
  const isAdmin = () => authManager.isAdmin();
  const getRole = () => authManager.getRole();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        isMechanic,
        isAdmin,
        getRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
