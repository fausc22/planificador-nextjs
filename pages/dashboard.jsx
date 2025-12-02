// pages/dashboard.jsx - Dashboard principal
import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import NotificacionesLogueos from '../components/NotificacionesLogueos';
import { FiUsers, FiCalendar, FiClock, FiDollarSign, FiSun, FiStar } from 'react-icons/fi';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // La protección de ruta se maneja en ProtectedRoute
  // Este useEffect es una verificación adicional
  useEffect(() => {
    if (!loading && router.isReady) {
      // Importar dinámicamente para evitar problemas de SSR
      import('../utils/tokenUtils').then(({ hasValidToken }) => {
        if (!hasValidToken()) {
      router.replace('/login');
        }
      });
    }
  }, [loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Bienvenida */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Bienvenido, {user.nombre}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Panel de control del sistema de planificación
            </p>
          </div>

          {/* Notificaciones de Logueos */}
          <div className="mb-6">
            <NotificacionesLogueos />
          </div>

          {/* Accesos Rápidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Accesos Rápidos
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/planificador')}
                className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                <FiCalendar className="text-3xl text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Planificador
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestionar turnos mensuales
                </p>
              </button>

              <button
                onClick={() => router.push('/logueos')}
                className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left border-2 border-transparent hover:border-green-200 dark:hover:border-green-800"
              >
                <FiClock className="text-3xl text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Logueos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ver ingresos y egresos
                </p>
              </button>

              <button
                onClick={() => router.push('/control-horas')}
                className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800"
              >
                <FiClock className="text-3xl text-orange-600 dark:text-orange-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Control de Horas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fichajes y registros
                </p>
              </button>

              <button
                onClick={() => router.push('/recibos')}
                className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800"
              >
                <FiDollarSign className="text-3xl text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Recibos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generar recibos de sueldo
                </p>
              </button>

              <button
                onClick={() => router.push('/pagos-extras')}
                className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-left border-2 border-transparent hover:border-pink-200 dark:hover:border-pink-800"
              >
                <FiDollarSign className="text-3xl text-pink-600 dark:text-pink-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Pagos Extras
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bonificaciones y deducciones
                </p>
              </button>

              <button
                onClick={() => router.push('/vacaciones')}
                className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                <FiSun className="text-3xl text-indigo-600 dark:text-indigo-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Vacaciones
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestionar ausencias
                </p>
              </button>

              <button
                onClick={() => router.push('/empleados')}
                className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-left border-2 border-transparent hover:border-teal-200 dark:hover:border-teal-800"
              >
                <FiUsers className="text-3xl text-teal-600 dark:text-teal-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Empleados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Administrar personal
                </p>
              </button>

              <button
                onClick={() => router.push('/turnos')}
                className="p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-left border-2 border-transparent hover:border-cyan-200 dark:hover:border-cyan-800"
              >
                <FiClock className="text-3xl text-cyan-600 dark:text-cyan-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Turnos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configurar horarios
                </p>
              </button>

              <button
                onClick={() => router.push('/feriados')}
                className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800"
              >
                <FiStar className="text-3xl text-amber-600 dark:text-amber-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Feriados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configurar días no laborables
                </p>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

