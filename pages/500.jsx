// pages/500.jsx - Página de error 500
import Head from 'next/head';
import Link from 'next/link';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Error del Servidor</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-primary-dark dark:to-secondary-dark px-4">
        <div className="text-center">
          <FiAlertCircle className="text-9xl text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Error del Servidor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Lo sentimos, algo salió mal en el servidor. Por favor intenta nuevamente más tarde.
          </p>
          
          <Link href="/dashboard" className="btn-primary inline-flex items-center space-x-2">
            <FiHome />
            <span>Volver al Dashboard</span>
          </Link>
        </div>
      </div>
    </>
  );
}

