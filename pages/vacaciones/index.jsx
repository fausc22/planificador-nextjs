// pages/vacaciones/index.jsx - Gestión de vacaciones
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { vacacionesAPI } from '../../utils/api';
import { FiPlus, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Vacaciones() {
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVacaciones();
  }, []);

  const cargarVacaciones = async () => {
    try {
      setLoading(true);
      const response = await vacacionesAPI.obtenerTodas();
      
      if (response.data.success) {
        setVacaciones(response.data.vacaciones || response.data.data?.vacaciones || []);
      }
    } catch (error) {
      console.error('Error al cargar vacaciones:', error);
      toast.error('Error al cargar vacaciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vacaciones - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Vacaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestión de períodos vacacionales
              </p>
            </div>

            <button
              className="btn-primary flex items-center space-x-2"
              onClick={() => toast.info('Función en desarrollo')}
            >
              <FiPlus />
              <span>Nueva Vacación</span>
            </button>
          </div>

          {/* Lista de vacaciones */}
          <div className="card">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="spinner"></div>
              </div>
            ) : vacaciones.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay vacaciones registradas
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vacaciones.map((vacacion) => (
                  <div
                    key={vacacion.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {vacacion.nombre_empleado}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {vacacion.dias} días
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Activo
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Salida:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {vacacion.salida}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Regreso:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {vacacion.regreso}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

