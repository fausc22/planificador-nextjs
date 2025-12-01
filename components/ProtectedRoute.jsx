// components/ProtectedRoute.jsx - Componente para proteger rutas
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { hasValidToken, isTokenExpired, clearAuthData } from '../utils/tokenUtils';
import { apiClient } from '../utils/api';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/asistencia', '/login', '/marcar-asistencia'];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { loading, refreshAccessToken } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Si la ruta es pública, permitir acceso
      if (PUBLIC_ROUTES.includes(router.pathname)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Verificar token en localStorage
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        // No hay token, redirigir a login
        clearAuthData();
        router.replace('/login');
        setIsChecking(false);
        return;
      }

      // Verificar si el token está expirado
      if (isTokenExpired(token)) {
        // Token expirado, intentar refrescar
        if (refreshToken) {
          try {
            await refreshAccessToken();
            // Token refrescado exitosamente
            setIsAuthorized(true);
            setIsChecking(false);
            return;
          } catch (error) {
            // Refresh falló, limpiar y redirigir
            console.error('Error refrescando token:', error);
            clearAuthData();
            router.replace('/login');
            setIsChecking(false);
            return;
          }
        } else {
          // No hay refresh token, limpiar y redirigir
          clearAuthData();
          router.replace('/login');
          setIsChecking(false);
          return;
        }
      }

      // Token válido, permitir acceso
      setIsAuthorized(true);
      setIsChecking(false);
    };

    // Esperar a que el router esté listo y termine de cargar el auth
    if (router.isReady && !loading) {
      checkAuth();
    }
  }, [router.pathname, router.isReady, loading, refreshAccessToken]);

  // Mostrar loading mientras se verifica
  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary-dark dark:to-secondary-dark">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autorizado, no renderizar nada (ya se redirigió)
  if (!isAuthorized) {
    return null;
  }

  // Renderizar el contenido protegido
  return <>{children}</>;
}

