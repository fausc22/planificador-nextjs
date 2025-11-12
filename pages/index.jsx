// pages/index.jsx - Página principal
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si está autenticado, redirigir al dashboard
        router.push('/dashboard');
      } else {
        // Si no está autenticado, redirigir al login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

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

