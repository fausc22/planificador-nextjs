// pages/dashboard.jsx - Dashboard principal
import { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import NotificacionesLogueos from '../components/NotificacionesLogueos';
import { FiUsers, FiCalendar, FiClock, FiDollarSign, FiSun, FiStar } from 'react-icons/fi';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Definir accesos rápidos con permisos por rol
  const accesosRapidos = useMemo(() => {
    const todos = [
      {
        path: '/planificador',
        title: 'Planificador',
        description: 'Gestionar turnos mensuales',
        icon: FiCalendar,
        color: 'blue',
        roles: ['gerente']
      },
      {
        path: '/logueos',
        title: 'Logueos',
        description: 'Ver ingresos y egresos',
        icon: FiClock,
        color: 'green',
        roles: ['gerente', 'user']
      },
      {
        path: '/control-horas',
        title: 'Control de Horas',
        description: 'Fichajes y registros',
        icon: FiClock,
        color: 'orange',
        roles: ['gerente', 'user']
      },
      {
        path: '/asistencia',
        title: 'Asistencia',
        description: 'Marcar asistencia',
        icon: FiClock,
        color: 'teal',
        roles: ['gerente', 'user']
      },
      {
        path: '/recibos',
        title: 'Recibos',
        description: 'Generar recibos de sueldo',
        icon: FiDollarSign,
        color: 'purple',
        roles: ['gerente']
      },
      {
        path: '/pagos-extras',
        title: 'Pagos Extras',
        description: 'Bonificaciones y deducciones',
        icon: FiDollarSign,
        color: 'pink',
        roles: ['gerente']
      },
      {
        path: '/vacaciones',
        title: 'Vacaciones',
        description: 'Gestionar ausencias',
        icon: FiSun,
        color: 'indigo',
        roles: ['gerente']
      },
      {
        path: '/empleados',
        title: 'Empleados',
        description: 'Administrar personal',
        icon: FiUsers,
        color: 'teal',
        roles: ['gerente']
      },
      {
        path: '/turnos',
        title: 'Turnos',
        description: 'Configurar horarios',
        icon: FiClock,
        color: 'cyan',
        roles: ['gerente', 'user']
      },
      {
        path: '/feriados',
        title: 'Feriados',
        description: 'Configurar días no laborables',
        icon: FiStar,
        color: 'amber',
        roles: ['gerente', 'user']
      }
    ];

    // Filtrar según el rol del usuario
    if (!user || !user.rol) return todos;
    
    const userRole = user.rol.toLowerCase();
    return todos.filter(acceso => acceso.roles.includes(userRole));
  }, [user]);

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

  // Redirigir si no hay usuario después de cargar
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // No renderizar si no hay usuario (evitar error mientras redirige)
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8 w-full max-w-full overflow-x-hidden">
          {/* Bienvenida */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Bienvenido, {user?.nombre || 'Usuario'}! 👋
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
            
            {accesosRapidos.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No hay accesos rápidos disponibles para tu rol.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {accesosRapidos.map((acceso) => {
                  const Icon = acceso.icon;
                  const colorClasses = {
                    blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400',
                    green: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-200 dark:hover:border-green-800 text-green-600 dark:text-green-400',
                    orange: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-200 dark:hover:border-orange-800 text-orange-600 dark:text-orange-400',
                    purple: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-800 text-purple-600 dark:text-purple-400',
                    pink: 'bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:border-pink-200 dark:hover:border-pink-800 text-pink-600 dark:text-pink-400',
                    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800 text-indigo-600 dark:text-indigo-400',
                    teal: 'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:border-teal-200 dark:hover:border-teal-800 text-teal-600 dark:text-teal-400',
                    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:border-cyan-200 dark:hover:border-cyan-800 text-cyan-600 dark:text-cyan-400',
                    amber: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800 text-amber-600 dark:text-amber-400'
                  };

                  return (
                    <button
                      key={acceso.path}
                      onClick={() => router.push(acceso.path)}
                      className={`p-6 ${colorClasses[acceso.color]} rounded-lg transition-colors text-left border-2 border-transparent`}
                    >
                      <Icon className={`text-3xl mb-3`} />
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {acceso.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {acceso.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

