// pages/control-horas/index.jsx - Control de horas trabajadas
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FiClock, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ControlHoras() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  
  const [empleados, setEmpleados] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const MESES_ES = {
    'ENERO': 'Enero', 'FEBRERO': 'Febrero', 'MARZO': 'Marzo',
    'ABRIL': 'Abril', 'MAYO': 'Mayo', 'JUNIO': 'Junio',
    'JULIO': 'Julio', 'AGOSTO': 'Agosto', 'SEPTIEMBRE': 'Septiembre',
    'OCTUBRE': 'Octubre', 'NOVIEMBRE': 'Noviembre', 'DICIEMBRE': 'Diciembre'
  };

  // Cargar empleados al iniciar
  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Cargar registros cuando cambien los filtros
  useEffect(() => {
    cargarRegistros();
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

  const cargarRegistros = async () => {
    setLoading(true);
    try {
      const mesNombre = MESES[mes - 1].toUpperCase();
      const url = `/control-hs/${anio}/${mesNombre}`;
      
      const params = empleadoSeleccionado ? { nombre_empleado: empleadoSeleccionado } : {};
      
      const response = await apiClient.get(url, { params });
      
      if (response.data.success) {
        setRegistros(response.data.registros);
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
      toast.error('Error al cargar registros');
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const formatearHoras = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const formatearDinero = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(valor);
  };

  const calcularTotales = () => {
    const totalMinutos = registros.reduce((sum, r) => sum + (r.horas_trabajadas || 0), 0);
    const totalDinero = registros.reduce((sum, r) => sum + (parseFloat(r.acumulado) || 0), 0);
    
    return {
      minutos: totalMinutos,
      dinero: totalDinero
    };
  };

  const totales = calcularTotales();

  if (loadingEmpleados) {
    return <Layout><Loading /></Layout>;
  }

  return (
    <>
      <Head>
        <title>Control de Horas - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Control de Horas
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Registro de fichajes y horas trabajadas
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
          {!loading && registros.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Registros
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {registros.length}
                    </p>
                  </div>
                  <FiCalendar className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Total Horas
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatearHoras(totales.minutos)}
                    </p>
                  </div>
                  <FiClock className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Total Acumulado
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatearDinero(totales.dinero)}
                    </p>
                  </div>
                  <FiDollarSign className="text-3xl text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Registros */}
          <div className="card">
            {loading ? (
              <Loading />
            ) : registros.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="No hay registros"
                description="No se encontraron registros para el período seleccionado"
              />
            ) : (
              <>
                {/* Vista de escritorio - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Empleado</th>
                        <th>Ingreso</th>
                        <th>Egreso</th>
                        <th>Horas Trabajadas</th>
                        <th>Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((registro) => (
                        <tr key={registro.id}>
                          <td>{registro.fecha}</td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <FiUser className="text-gray-400" />
                              <span>{registro.nombre_empleado}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success">
                              {registro.hora_ingreso}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-danger">
                              {registro.hora_egreso}
                            </span>
                          </td>
                          <td>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {formatearHoras(registro.horas_trabajadas)}
                            </span>
                          </td>
                          <td>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {formatearDinero(registro.acumulado)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista móvil - Cards */}
                <div className="md:hidden space-y-3">
                  {registros.map((registro) => (
                    <div key={registro.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiUser className="text-gray-400" />
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {registro.nombre_empleado}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{registro.fecha}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Ingreso:</span>
                                <span className="badge badge-success ml-1 text-xs">{registro.hora_ingreso}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Egreso:</span>
                                <span className="badge badge-danger ml-1 text-xs">{registro.hora_egreso}</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Horas:</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {formatearHoras(registro.horas_trabajadas)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Total:</span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {formatearDinero(registro.acumulado)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

