import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token y tenant_id a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('tenant_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTENTICACIÓN ============
export const authAPI = {
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// ============ CITAS ============
export const citasAPI = {
  crear: (data) => api.post('/citas/crear', data),
  listar: (params) => api.get('/citas/listar', { params }),
  obtener: (id) => api.get(`/citas/${id}`),
  actualizar: (id, data) => api.put(`/citas/actualizar/${id}`, data),
  cancelar: (id, motivo) => api.delete(`/citas/cancelar/${id}`, { data: { motivo } }),
  disponibilidad: (params) => api.get('/citas/disponibilidad', { params }),
};

// ============ CLIENTES ============
export const clientesAPI = {
  crear: (data) => api.post('/clientes/crear', data),
  listar: (params) => api.get('/clientes/listar', { params }),
  buscar: (params) => api.get('/clientes/buscar', { params }),
  obtener: (id) => api.get(`/clientes/${id}`),
  actualizar: (id, data) => api.put(`/clientes/actualizar/${id}`, data),
};

// ============ SERVICIOS ============
export const serviciosAPI = {
  listar: (params) => api.get('/servicios/listar', { params }),
  crear: (data) => api.post('/servicios/crear', data),
  obtener: (id) => api.get(`/servicios/${id}`),
  actualizar: (id, data) => api.put(`/servicios/actualizar/${id}`, data),
  eliminar: (id) => api.delete(`/servicios/${id}`),
};

// ============ NEGOCIO/CONFIGURACIÓN ============
export const negocioAPI = {
  obtenerConfig: (params) => api.get('/negocio/config', { params }),
  actualizarConfig: (data) => api.put('/negocio/config', data),
  obtenerHorario: (params) => api.get('/negocio/horario', { params }),
  actualizarHorario: (data) => api.put('/negocio/horario', data),
};

export default api;
