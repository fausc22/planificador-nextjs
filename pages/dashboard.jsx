// pages/dashboard.jsx - Dashboard principal
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { FiUsers, FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi';
import CountUp from 'react-countup';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    totalTurnos: 0,
    horasDelMes: 0,
    totalAcumulado: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
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

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Empleados */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiUsers className="text-2xl text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Empleados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={stats.totalEmpleados} duration={1} />
                  </p>
                </div>
              </div>
            </div>

            {/* Turnos del Mes */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FiCalendar className="text-2xl text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Turnos Asignados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={stats.totalTurnos} duration={1} />
                  </p>
                </div>
              </div>
            </div>

            {/* Horas del Mes */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <FiClock className="text-2xl text-orange-600 dark:text-orange-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Horas del Mes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={stats.horasDelMes} duration={1} />
                  </p>
                </div>
              </div>
            </div>

            {/* Acumulado */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FiDollarSign className="text-2xl text-purple-600 dark:text-purple-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Acumulado</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $<CountUp end={stats.totalAcumulado} duration={1} separator="." />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Accesos Rápidos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/planificador')}
                className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
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
                onClick={() => router.push('/empleados')}
                className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
              >
                <FiUsers className="text-3xl text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Empleados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Administrar personal
                </p>
              </button>

              <button
                onClick={() => router.push('/turnos')}
                className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
              >
                <FiClock className="text-3xl text-orange-600 dark:text-orange-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Turnos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configurar horarios
                </p>
              </button>

              <button
                onClick={() => router.push('/vacaciones')}
                className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
              >
                <FiCalendar className="text-3xl text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Vacaciones
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestionar ausencias
                </p>
              </button>

              <button
                onClick={() => router.push('/control-horas')}
                className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-left"
              >
                <FiClock className="text-3xl text-pink-600 dark:text-pink-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Control de Horas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fichajes y registros
                </p>
              </button>

              <button
                onClick={() => router.push('/recibos')}
                className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left"
              >
                <FiDollarSign className="text-3xl text-indigo-600 dark:text-indigo-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Recibos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generar recibos de sueldo
                </p>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

