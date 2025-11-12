// pages/logueos/index.jsx - Registro de logueos (ingresos y egresos)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FiClock, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Logueos() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  
  const [empleados, setEmpleados] = useState([]);
  const [logueos, setLogueos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cargar empleados al iniciar
  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Cargar logueos cuando cambien los filtros
  useEffect(() => {
    cargarLogueos();
  }, [anio, mes, empleadoSeleccionado]);

  const cargarEmpleados = async () => {
    try {
      const response = await apiClient.get('/empleados');
      if (response.data.success) {
        setEmpleados(response.data.empleados);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const cargarLogueos = async () => {
    setLoading(true);
    try {
      const mesNombre = MESES[mes - 1].toUpperCase();
      const url = `/logueo/${anio}/${mesNombre}`;
      
      const params = empleadoSeleccionado ? { nombre_empleado: empleadoSeleccionado } : {};
      
      const response = await apiClient.get(url, { params });
      
      if (response.data.success) {
        setLogueos(response.data.logueos);
      }
    } catch (error) {
      console.error('Error cargando logueos:', error);
      toast.error('Error al cargar logueos');
      setLogueos([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const ingresos = logueos.filter(l => l.accion === 'INGRESO').length;
    const egresos = logueos.filter(l => l.accion === 'EGRESO').length;
    
    return { ingresos, egresos };
  };

  const estadisticas = calcularEstadisticas();

  if (loadingEmpleados) {
    return <Layout><Loading /></Layout>;
  }

  return (
    <>
      <Head>
        <title>Logueos - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Logueos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Registro de ingresos y egresos de empleados
            </p>
          </div>

          {/* Filtros */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año
                </label>
                <select
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value))}
                  className="input"
                >
                  {[2024, 2025, 2026].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mes
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  className="input"
                >
                  {MESES.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empleado
                </label>
                <select 
                  className="input"
                  value={empleadoSeleccionado}
                  onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                >
                  <option value="">Todos los empleados</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={`${emp.nombre} ${emp.apellido}`}>
                      {emp.nombre} {emp.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {!loading && logueos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Logueos
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {logueos.length}
                    </p>
                  </div>
                  <FiClock className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Ingresos
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {estadisticas.ingresos}
                    </p>
                  </div>
                  <FiLogIn className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Egresos
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {estadisticas.egresos}
                    </p>
                  </div>
                  <FiLogOut className="text-3xl text-red-500" />
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Logueos */}
          <div className="card overflow-x-auto">
            {loading ? (
              <Loading />
            ) : logueos.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="No hay logueos"
                description="No se encontraron logueos para el período seleccionado"
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Empleado</th>
                    <th>Acción</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {logueos.map((logueo) => (
                    <tr key={logueo.id}>
                      <td>{logueo.fecha}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiUser className="text-gray-400" />
                          <span>{logueo.nombre_empleado}</span>
                        </div>
                      </td>
                      <td>
                        {logueo.accion === 'INGRESO' ? (
                          <span className="badge badge-success inline-flex items-center space-x-1">
                            <FiLogIn />
                            <span>INGRESO</span>
                          </span>
                        ) : (
                          <span className="badge badge-danger inline-flex items-center space-x-1">
                            <FiLogOut />
                            <span>EGRESO</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {logueo.hora}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

