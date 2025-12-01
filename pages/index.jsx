// pages/index.jsx - Página principal
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      // Importar dinámicamente para evitar problemas de SSR
      import('../utils/tokenUtils').then(({ hasValidToken }) => {
        if (hasValidToken()) {
          // Si hay token válido, redirigir al dashboard
          router.replace('/dashboard');
        } else {
          // Si no hay token válido, redirigir al login
          router.replace('/login');
        }
      });
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Planificador de Empleados</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary-dark dark:to-secondary-dark">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    </>
  );
}

