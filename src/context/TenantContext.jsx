import { createContext, useState, useContext, useEffect } from 'react';
import { negocioAPI } from '../services/api';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenantConfig();
  }, []);

  const loadTenantConfig = async () => {
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      try {
        const response = await negocioAPI.obtenerConfig({ tenant_id: tenantId });
        setTenantConfig(response.data);
      } catch (error) {
        console.error('Error cargando configuración del negocio:', error);
      }
    }
    setLoading(false);
  };

  const updateTenantConfig = async (data) => {
    try {
      const response = await negocioAPI.actualizarConfig(data);
      setTenantConfig(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    tenantConfig,
    loading,
    loadTenantConfig,
    updateTenantConfig,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant debe usarse dentro de TenantProvider');
  }
  return context;
};

export default TenantContext;
