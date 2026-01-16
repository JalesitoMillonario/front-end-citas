import { useState, useEffect } from 'react';
import { citasAPI } from '../services/api';

export const useAppointments = (params = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (customParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await citasAPI.listar({ ...params, ...customParams });
      setAppointments(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las citas');
      console.error('Error fetching appointments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (data) => {
    try {
      const response = await citasAPI.crear(data);
      await fetchAppointments();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al crear la cita' };
    }
  };

  const updateAppointment = async (id, data) => {
    try {
      const response = await citasAPI.actualizar(id, data);
      await fetchAppointments();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar la cita' };
    }
  };

  const cancelAppointment = async (id, motivo = '') => {
    try {
      await citasAPI.cancelar(id, motivo);
      await fetchAppointments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al cancelar la cita' };
    }
  };

  const checkAvailability = async (params) => {
    try {
      const response = await citasAPI.disponibilidad(params);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al verificar disponibilidad' };
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      fetchAppointments();
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    checkAvailability,
  };
};

export default useAppointments;
