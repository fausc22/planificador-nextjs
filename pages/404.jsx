// pages/404.jsx - Página de error 404
import Head from 'next/head';
import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Página no encontrada</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary-dark dark:to-secondary-dark px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Lo sentimos, la página que buscas no existe o ha sido movida.
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

