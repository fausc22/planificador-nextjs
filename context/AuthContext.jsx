// context/AuthContext.jsx - Context de autenticación
import { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../utils/api';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Configurar token en axios
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Cargar usuario desde localStorage (sin validar con backend para evitar redirecciones innecesarias)
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          delete apiClient.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Login
  const login = async (username, password, remember = false) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
        remember
      });

      const { token, refreshToken, empleado } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(empleado));
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Configurar token en axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(empleado);

      return empleado;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar datos locales
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  // Renovar token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No hay refresh token');
      }

      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken
      });

      const { accessToken } = response.data;
      
      localStorage.setItem('token', accessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return accessToken;
    } catch (error) {
      // Si falla el refresh, hacer logout
      await logout();
      throw error;
    }
  };

  // Actualizar perfil
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshAccessToken,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

