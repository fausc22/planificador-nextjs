// components/ProtectedRoute.jsx - Componente para proteger rutas
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/asistencia', '/login', '/marcar-asistencia'];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Si la ruta es pública, permitir acceso
      if (PUBLIC_ROUTES.includes(router.pathname)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Verificar token en localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // No hay token, redirigir a login
        router.replace('/login');
        setIsChecking(false);
        return;
      }

      // Hay token, permitir acceso
      setIsAuthorized(true);
      setIsChecking(false);
    };

    // Esperar a que el router esté listo y termine de cargar el auth
    if (router.isReady && !loading) {
      checkAuth();
    }
  }, [router.pathname, router.isReady, loading]);

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

