import { useState, useEffect } from 'react';
import { serviciosAPI } from '../services/api';

export const useServices = (params = {}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async (customParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviciosAPI.listar({ ...params, ...customParams });
      setServices(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los servicios');
      console.error('Error fetching services:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createService = async (data) => {
    try {
      const response = await serviciosAPI.crear(data);
      await fetchServices();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al crear el servicio' };
    }
  };

  const updateService = async (id, data) => {
    try {
      const response = await serviciosAPI.actualizar(id, data);
      await fetchServices();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar el servicio' };
    }
  };

  const deleteService = async (id) => {
    try {
      await serviciosAPI.eliminar(id);
      await fetchServices();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al eliminar el servicio' };
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      fetchServices();
    }
  }, []);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};

export default useServices;
