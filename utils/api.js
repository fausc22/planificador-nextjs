// utils/api.js - Cliente HTTP con Axios
import axios from 'axios';
import toast from 'react-hot-toast';
import { isTokenExpired, clearAuthData } from './tokenUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
  // Asegurar que axios serialice los datos como JSON
  transformRequest: [(data, headers) => {
    // Si los datos son un objeto (no FormData), serializar como JSON
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }
    return data;
  }]
});

// Nota: Cuando se envía FormData, NO establecer Content-Type manualmente
// Axios detecta FormData automáticamente y establece el Content-Type correcto
// con el boundary necesario para multipart/form-data

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor de request para agregar token automáticamente y verificar expiración
apiClient.interceptors.request.use(
  async (config) => {
    // Log para debugging (solo en desarrollo o cuando hay problemas)
    if (config.url?.includes('empleados')) {
      console.log('🔍 [interceptor] URL completa:', `${config.baseURL}${config.url}`);
      console.log('🔍 [interceptor] URL relativa:', config.url);
      console.log('🔍 [interceptor] Method:', config.method);
      console.log('🔍 [interceptor] Data type:', config.data instanceof FormData ? 'FormData' : typeof config.data);
      console.log('🔍 [interceptor] Data keys:', config.data instanceof FormData ? 'FormData' : Object.keys(config.data || {}));
      console.log('🔍 [interceptor] Headers antes:', config.headers);
      console.log('🔍 [interceptor] Data completo:', config.data);
    }
    
    // CRÍTICO: Para rutas de empleados, SIEMPRE usar JSON (no FormData)
    // Asegurar que NO sea FormData y que el Content-Type sea application/json
    if (config.url?.includes('/empleados') && !config.url?.includes('/uploads')) {
      if (config.data instanceof FormData) {
        console.error('❌ [interceptor] ERROR: Se está intentando enviar FormData a endpoint de empleados');
        console.error('❌ [interceptor] Convirtiendo FormData a objeto JSON');
        // Convertir FormData a objeto
        const obj = {};
        config.data.forEach((value, key) => {
          obj[key] = value;
        });
        config.data = obj;
      }
      // SIEMPRE establecer Content-Type JSON para empleados
      config.headers['Content-Type'] = 'application/json';
      console.log('✅ [interceptor] Content-Type establecido para empleados:', config.headers['Content-Type']);
    }
    
    // Si los datos son FormData (para otras rutas que NO sean empleados), NO establecer Content-Type (axios lo hace automáticamente)
    // Esto es crítico para que multer pueda parsear correctamente el FormData
    if (config.data instanceof FormData && !config.url?.includes('/empleados')) {
      // Eliminar Content-Type si fue establecido manualmente
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    
    if (config.url?.includes('empleados')) {
      console.log('🔍 [interceptor] Headers después:', config.headers);
      console.log('🔍 [interceptor] Data final:', config.data);
    }
    
    // Rutas públicas que no necesitan token
    const publicRoutes = [
      '/marcaciones/registrar-con-foto',
      '/marcaciones/verificar-empleado',
      '/marcaciones/verificar-accion',
      '/marcaciones/registrar',
      '/marcaciones/generar-qr',
      '/marcaciones/validar-password',
      '/auth/login',
      '/auth/refresh-token'
    ];
    
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
    const token = localStorage.getItem('token');
      
    if (token) {
        // Verificar si el token está expirado antes de hacer la petición
        if (isTokenExpired(token)) {
          // Token expirado, intentar refrescar
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken && !isRefreshing) {
            isRefreshing = true;
            
            try {
              const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken
              });
              
              const { accessToken } = response.data;
              localStorage.setItem('token', accessToken);
              config.headers.Authorization = `Bearer ${accessToken}`;
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              
              processQueue(null, accessToken);
              isRefreshing = false;
              
              return config;
            } catch (refreshError) {
              // Refresh falló, limpiar y redirigir
              clearAuthData();
              processQueue(refreshError, null);
              isRefreshing = false;
              
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              
              return Promise.reject(refreshError);
            }
          } else if (isRefreshing) {
            // Ya hay un refresh en proceso, esperar
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              config.headers.Authorization = `Bearer ${token}`;
              return config;
            }).catch(err => {
              return Promise.reject(err);
            });
          } else {
            // No hay refresh token, limpiar y redirigir
            clearAuthData();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(new Error('Token expirado y no hay refresh token'));
          }
        } else {
          // Token válido, agregar al header
      config.headers.Authorization = `Bearer ${token}`;
    }
      } else {
        // No hay token, redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('No hay token de autenticación'));
      }
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
    
    // Rutas públicas que manejan sus propios errores (no mostrar toast automático)
    const publicRoutes = [
      '/marcaciones/registrar-con-foto',
      '/marcaciones/verificar-empleado',
      '/marcaciones/verificar-accion',
      '/marcaciones/registrar',
      '/marcaciones/generar-qr'
    ];
    
    const isPublicRoute = publicRoutes.some(route => originalRequest?.url?.includes(route));

    // Si el error es 401 y no es un retry, intentar refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicRoute) {
      originalRequest._retry = true;

      // Si ya estamos refrescando, esperar a que termine
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            }, 
            reject 
          });
        });
      }

      isRefreshing = true;

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

          processQueue(null, accessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          throw new Error('No hay refresh token');
        }
      } catch (refreshError) {
        // Si el refresh falla, limpiar y redirigir al login
        clearAuthData();
        processQueue(refreshError, null);
        isRefreshing = false;
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Si es 401 y no se pudo refrescar, ya se redirigió al login
    if (error.response?.status === 401 && !isPublicRoute) {
      // Ya se intentó refrescar y falló, o no hay refresh token
      // No mostrar error, ya se redirigió
      return Promise.reject(error);
    }

    // Manejar otros errores
    // NO mostrar toast automático para rutas públicas (dejan que el componente maneje el error)
    if (!isPublicRoute) {
    const errorMessage = error.response?.data?.message || error.message || 'Error en la petición';
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
  
  crear: (datos) => {
    // Crear empleado - igual que logueos, usar apiClient.post directamente
    console.log('📤 [empleadosAPI.crear] Datos a enviar:', datos);
    console.log('📤 [empleadosAPI.crear] Tipo de datos:', typeof datos);
    console.log('📤 [empleadosAPI.crear] Es objeto:', datos instanceof Object);
    console.log('📤 [empleadosAPI.crear] Keys:', Object.keys(datos || {}));
    console.log('📤 [empleadosAPI.crear] JSON.stringify:', JSON.stringify(datos));
    
    // Asegurar que los datos sean un objeto válido
    if (!datos || typeof datos !== 'object') {
      console.error('❌ [empleadosAPI.crear] ERROR: datos no es un objeto válido');
      throw new Error('Los datos deben ser un objeto válido');
    }
    
    return apiClient.post('/empleados', datos);
  },
  
  actualizar: (id, datos) => {
    // Actualizar empleado - igual que logueos, usar apiClient.put directamente
    console.log(`📤 [empleadosAPI.actualizar] Actualizando empleado ${id}:`, datos);
    return apiClient.put(`/empleados/${id}`, datos);
  },
  
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

export const usuariosAPI = {
  obtenerTodos: () =>
    apiClient.get('/usuarios'),
  
  obtenerPorId: (id) =>
    apiClient.get(`/usuarios/${id}`),
  
  crear: (datos) =>
    apiClient.post('/usuarios', datos),
  
  actualizar: (id, datos) =>
    apiClient.put(`/usuarios/${id}`, datos),
  
  cambiarPassword: (id, password) =>
    apiClient.put(`/usuarios/${id}/password`, { password }),
  
  toggleActivo: (id, activo) =>
    apiClient.put(`/usuarios/${id}/toggle-activo`, { activo }),
  
  eliminar: (id) =>
    apiClient.delete(`/usuarios/${id}`),
};

export const notificacionesAPI = {
  obtenerLogueosFaltantes: () =>
    apiClient.get('/notificaciones/logueos-faltantes'),
  
  verificarYEnviar: () =>
    apiClient.post('/notificaciones/verificar-y-enviar'),
  
  obtenerEstadoWhatsApp: () =>
    apiClient.get('/notificaciones/whatsapp/estado'),
  
  enviarMensajePrueba: (mensaje) =>
    apiClient.post('/notificaciones/whatsapp/enviar-prueba', { mensaje }),
  
  obtenerEstadoNotificaciones: () =>
    apiClient.get('/notificaciones/estado'),
  
  cambiarEstadoNotificaciones: (estado) =>
    apiClient.post('/notificaciones/estado', { estado }),
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

