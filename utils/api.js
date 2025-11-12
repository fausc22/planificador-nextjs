// utils/api.js - Cliente HTTP con Axios
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor de request para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores y refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un retry, intentar refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken } = response.data;
          
          localStorage.setItem('token', accessToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh falla, limpiar y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Manejar otros errores
    const errorMessage = error.response?.data?.message || error.message || 'Error en la petición';
    
    // Mostrar toast solo si no es un 401 (ya se maneja con redirect)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Funciones helper para las APIs
export const authAPI = {
  login: (username, password, remember) =>
    apiClient.post('/auth/login', { username, password, remember }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
  
  changePassword: (currentPassword, newPassword) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
};

export const empleadosAPI = {
  obtenerTodos: (params) =>
    apiClient.get('/empleados', { params }),
  
  obtenerPorId: (id) =>
    apiClient.get(`/empleados/${id}`),
  
  crear: (datos) =>
    apiClient.post('/empleados', datos, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  actualizar: (id, datos) =>
    apiClient.put(`/empleados/${id}`, datos, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  eliminar: (id) =>
    apiClient.delete(`/empleados/${id}`),
};

export const planificadorAPI = {
  cargarPlanificador: (mes, anio) =>
    apiClient.get(`/planeamiento/planificador/${mes}/${anio}`),
  
  cargarPlanificadorDetallado: (mes, anio, campo) =>
    apiClient.get(`/planeamiento/planificador-detallado/${mes}/${anio}`, { params: { campo } }),
  
  cargarTotales: (mes, anio, campo = 'horas') =>
    apiClient.get(`/planeamiento/totales/${mes}/${anio}`, { params: { campo } }),
  
  actualizarTurno: (mes, anio, datos) =>
    apiClient.put(`/planeamiento/turno/${mes}/${anio}`, datos),
  
  generarAnio: (anio) =>
    apiClient.post(`/planeamiento/generar/${anio}`),
};

export const turnosAPI = {
  obtenerTodos: () =>
    apiClient.get('/turnos'),
  
  crear: (datos) =>
    apiClient.post('/turnos', datos),
  
  actualizar: (id, datos) =>
    apiClient.put(`/turnos/${id}`, datos),
  
  eliminar: (id) =>
    apiClient.delete(`/turnos/${id}`),
};

export const feriadosAPI = {
  obtenerTodos: () =>
    apiClient.get('/feriados'),
  
  obtenerPorPeriodo: (periodo) =>
    apiClient.get(`/feriados/periodo/${periodo}`),
  
  verificar: (fecha) =>
    apiClient.get(`/feriados/verificar/${fecha}`),
  
  crear: (datos) =>
    apiClient.post('/feriados', datos),
  
  actualizar: (id, datos) =>
    apiClient.put(`/feriados/${id}`, datos),
  
  eliminar: (id) =>
    apiClient.delete(`/feriados/${id}`),
};

export const vacacionesAPI = {
  obtenerTodas: () =>
    apiClient.get('/vacaciones'),
  
  obtenerPorEmpleado: (nombre_empleado) =>
    apiClient.get(`/vacaciones/empleado/${nombre_empleado}`),
  
  crear: (datos) =>
    apiClient.post('/vacaciones', datos),
  
  actualizar: (id, datos) =>
    apiClient.put(`/vacaciones/${id}`, datos),
  
  eliminar: (id) =>
    apiClient.delete(`/vacaciones/${id}`),
};

export const recibosAPI = {
  obtenerRecibo: (nombre_empleado, mes, anio) =>
    apiClient.get(`/recibos/${nombre_empleado}/${mes}/${anio}`),
  
  cargarDatos: (nombre_empleado, mes, anio) =>
    apiClient.get(`/recibos/${nombre_empleado}/${mes}/${anio}/datos`),
  
  guardar: (datos) =>
    apiClient.post('/recibos', datos),
  
  eliminar: (nombre_empleado, mes, anio) =>
    apiClient.delete(`/recibos/${nombre_empleado}/${mes}/${anio}`),
};

export default apiClient;

