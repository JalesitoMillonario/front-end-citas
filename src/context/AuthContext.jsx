import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('tenant_id');
      }
    }
    setLoading(false);
  };

  const login = async (credential) => {
    try {
      const response = await authAPI.googleLogin(credential);
      const { token, user, tenant_id } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('tenant_id', tenant_id);

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tenant_id');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
