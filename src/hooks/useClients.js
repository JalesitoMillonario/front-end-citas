import { useState, useEffect } from 'react';
import { clientesAPI } from '../services/api';

export const useClients = (params = {}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = async (customParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientesAPI.listar({ ...params, ...customParams });
      setClients(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los clientes');
      console.error('Error fetching clients:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (data) => {
    try {
      const response = await clientesAPI.crear(data);
      await fetchClients();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al crear el cliente' };
    }
  };

  const updateClient = async (id, data) => {
    try {
      const response = await clientesAPI.actualizar(id, data);
      await fetchClients();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar el cliente' };
    }
  };

  const searchClient = async (searchParams) => {
    try {
      const response = await clientesAPI.buscar(searchParams);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al buscar el cliente' };
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      fetchClients();
    }
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    searchClient,
  };
};

export default useClients;
