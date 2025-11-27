// pages/vacaciones/index.jsx - Gestión de vacaciones
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FiPlus, FiCalendar, FiEdit, FiTrash2, FiX, FiUser, FiSun, FiAlertCircle, FiMaximize2, FiMinimize2, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Vacaciones() {
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [empleadoFiltro, setEmpleadoFiltro] = useState('');
  
  const [empleados, setEmpleados] = useState([]);
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  
  // Paginación
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vacacionEditando, setVacacionEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre_empleado: '',
    dias: '',
    salida: '',
    regreso: '',
    salidaISO: '',
    regresoISO: '',
    mes: '',
    anio: ''
  });
  
  const [diasDisponibles, setDiasDisponibles] = useState(null);
  const [errores, setErrores] = useState({});
  
  // Modal de edición de días
  const [modalDiasAbierto, setModalDiasAbierto] = useState(false);
  const [empleadoEditandoDias, setEmpleadoEditandoDias] = useState(null);
  const [diasEditando, setDiasEditando] = useState('');
  
  // Modal de confirmación de eliminación
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [vacacionEliminar, setVacacionEliminar] = useState(null);
  
  // Estado para expandir/colapsar listado de empleados
  const [empleadosExpandido, setEmpleadosExpandido] = useState(false);
  const [modalEmpleadosAbierto, setModalEmpleadosAbierto] = useState(false);

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    cargarVacaciones(1);
  }, [anioFiltro, empleadoFiltro]);

  const cargarEmpleados = async () => {
    try {
      const response = await apiClient.get('/vacaciones/empleados');
      if (response.data.success) {
        setEmpleados(response.data.empleados);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
      // Fallback a endpoint de empleados si el nuevo no existe
      try {
        const responseFallback = await apiClient.get('/empleados');
        if (responseFallback.data.success) {
          setEmpleados(responseFallback.data.empleados);
        }
      } catch (errorFallback) {
      toast.error('Error al cargar empleados');
      }
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const cargarVacaciones = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      if (empleadoFiltro) params.nombre_empleado = empleadoFiltro;
      if (anioFiltro) params.anio = anioFiltro;
      
      const response = await apiClient.get('/vacaciones', { params });
      
      if (response.data.success) {
        setVacaciones(response.data.vacaciones || []);
        setPaginacion({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        });
      }
    } catch (error) {
      console.error('Error cargando vacaciones:', error);
      toast.error('Error al cargar vacaciones');
      setVacaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Convertir de DD/MM/YYYY a YYYY-MM-DD para el input date
  const convertirAInputDate = (fecha) => {
    if (!fecha) return '';
    try {
      const [dia, mes, anio] = fecha.split('/');
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    } catch (error) {
      return '';
    }
  };

  // Convertir de YYYY-MM-DD a DD/MM/YYYY para el backend
  const convertirAFormatoBackend = (fecha) => {
    if (!fecha) return '';
    try {
      const [anio, mes, dia] = fecha.split('-');
      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      return '';
    }
  };

  const calcularDias = (salida, regreso) => {
    if (!salida || !regreso) return 0;
    
    try {
      const fechaSalida = new Date(salida);
      const fechaRegreso = new Date(regreso);
      
      const diffTime = Math.abs(fechaRegreso - fechaSalida);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return diffDays;
    } catch (error) {
      console.error('Error calculando días:', error);
      return 0;
    }
  };

  const handleFechaSalidaChange = (fechaISO) => {
    const dias = calcularDias(fechaISO, formData.regresoISO);
    setFormData({ 
      ...formData, 
      salidaISO: fechaISO,
      salida: convertirAFormatoBackend(fechaISO),
      dias: dias
    });
  };

  const handleFechaRegresoChange = (fechaISO) => {
    const dias = calcularDias(formData.salidaISO, fechaISO);
    setFormData({ 
      ...formData, 
      regresoISO: fechaISO,
      regreso: convertirAFormatoBackend(fechaISO),
      dias: dias
    });
  };

  const abrirModal = async (vacacion = null) => {
    if (vacacion) {
      setVacacionEditando(vacacion);
      setFormData({
        nombre_empleado: vacacion.nombre_empleado,
        dias: vacacion.dias,
        salida: vacacion.salida,
        regreso: vacacion.regreso,
        salidaISO: convertirAInputDate(vacacion.salida),
        regresoISO: convertirAInputDate(vacacion.regreso),
        mes: '',
        anio: vacacion.salida.split('/')[2]
      });
      
      // Obtener días disponibles del empleado
      const empleado = empleados.find(e => `${e.nombre} ${e.apellido}` === vacacion.nombre_empleado);
      if (empleado) {
        setDiasDisponibles(empleado.dia_vacaciones + vacacion.dias); // Sumar los días que usó en esta vacación
      }
    } else {
      setVacacionEditando(null);
      setFormData({
        nombre_empleado: empleadoFiltro || '',
        dias: '',
        salida: '',
        regreso: '',
        salidaISO: '',
        regresoISO: '',
        mes: '',
        anio: anioFiltro.toString()
      });
      setDiasDisponibles(null);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVacacionEditando(null);
    setFormData({
      nombre_empleado: '',
      dias: '',
      salida: '',
      regreso: '',
      salidaISO: '',
      regresoISO: '',
      mes: '',
      anio: ''
    });
    setDiasDisponibles(null);
  };

  const handleEmpleadoChange = (nombreCompleto) => {
    setFormData({ ...formData, nombre_empleado: nombreCompleto });
    
    // Obtener días disponibles
    const empleado = empleados.find(e => `${e.nombre} ${e.apellido}` === nombreCompleto);
    if (empleado) {
      setDiasDisponibles(empleado.dia_vacaciones);
    } else {
      setDiasDisponibles(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre_empleado || !formData.salida || !formData.regreso || !formData.dias) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    // Extraer mes y año de la fecha de salida
    const [dia, mes, anio] = formData.salida.split('/');
    const mesNombre = MESES[parseInt(mes) - 1].toUpperCase();

    const datosEnviar = {
      ...formData,
      mes: mesNombre,
      anio: parseInt(anio),
      dias: parseInt(formData.dias)
    };

    try {
      if (vacacionEditando) {
        // Actualizar
        await apiClient.put(`/vacaciones/${vacacionEditando.id}`, datosEnviar);
        toast.success('Vacaciones actualizadas exitosamente');
      } else {
        // Crear
        await apiClient.post('/vacaciones', datosEnviar);
        toast.success('Vacaciones creadas exitosamente. Se actualizó el planificador.');
      }
      
      cerrarModal();
      cargarVacaciones(paginacion.page);
      cargarEmpleados(); // Recargar para actualizar días disponibles
    } catch (error) {
      console.error('Error al guardar vacaciones:', error);
      toast.error(error.response?.data?.message || 'Error al guardar vacaciones');
    }
  };

  const abrirModalEliminar = (vacacion) => {
    setVacacionEliminar(vacacion);
    setModalEliminarAbierto(true);
  };

  const cerrarModalEliminar = () => {
    setModalEliminarAbierto(false);
    setVacacionEliminar(null);
  };

  const handleEliminar = async () => {
    if (!vacacionEliminar) return;

    try {
      await apiClient.delete(`/vacaciones/${vacacionEliminar.id}`);
      toast.success('Vacaciones eliminadas exitosamente. El planificador ha sido actualizado.');
      cerrarModalEliminar();
      cargarVacaciones(paginacion.page);
      cargarEmpleados();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar vacaciones');
    }
  };

  const abrirModalDias = (empleado) => {
    setEmpleadoEditandoDias(empleado);
    setDiasEditando(empleado.dia_vacaciones.toString());
    setModalDiasAbierto(true);
  };

  const cerrarModalDias = () => {
    setModalDiasAbierto(false);
    setEmpleadoEditandoDias(null);
    setDiasEditando('');
  };

  const handleActualizarDias = async (e) => {
    e.preventDefault();
    
    if (!empleadoEditandoDias) return;
    
    const diasNum = parseInt(diasEditando);
    if (isNaN(diasNum) || diasNum < 0) {
      toast.error('Los días deben ser un número positivo');
      return;
    }

    try {
      await apiClient.put(`/vacaciones/empleado/${empleadoEditandoDias.id}/dias`, {
        dia_vacaciones: diasNum
      });
      toast.success('Días de vacaciones actualizados exitosamente');
      cerrarModalDias();
      cargarEmpleados();
    } catch (error) {
      console.error('Error al actualizar días:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar días de vacaciones');
    }
  };

  if (loadingEmpleados) {
    return <Layout><Loading /></Layout>;
  }

  return (
    <>
      <Head>
        <title>Vacaciones - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Vacaciones
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Gestión de períodos vacacionales
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <FiPlus />
              <span>Nueva Vacación</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="card mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año
                </label>
                <select
                  value={anioFiltro}
                  onChange={(e) => setAnioFiltro(parseInt(e.target.value))}
                  className="input"
                >
                  {[2024, 2025, 2026, 2027].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empleado
                </label>
                <select 
                  className="input"
                  value={empleadoFiltro}
                  onChange={(e) => setEmpleadoFiltro(e.target.value)}
                >
                  <option value="">Todos los empleados</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={`${emp.nombre} ${emp.apellido}`}>
                      {emp.nombre} {emp.apellido} ({emp.dia_vacaciones} días disponibles)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {!loading && vacaciones.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Vacaciones
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {vacaciones.length}
                    </p>
                  </div>
                  <FiSun className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Total Días
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {vacaciones.reduce((sum, v) => sum + v.dias, 0)}
                    </p>
                  </div>
                  <FiCalendar className="text-3xl text-green-500" />
                </div>
              </div>
            </div>
          )}

          {/* Layout principal: Empleados a la izquierda, Vacaciones a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Listado de Empleados - Columna lateral */}
            <div className={`lg:col-span-1 ${empleadosExpandido ? 'lg:col-span-2' : ''} order-2 lg:order-1`}>
              <div className="card sticky top-4 sm:top-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Días Disponibles
                  </h2>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setModalEmpleadosAbierto(true)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Ver completo"
                    >
                      <FiMaximize2 className="text-sm sm:text-base" />
                    </button>
                    <button
                      onClick={() => setEmpleadosExpandido(!empleadosExpandido)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors hidden lg:block"
                      title={empleadosExpandido ? "Colapsar" : "Expandir"}
                    >
                      {empleadosExpandido ? <FiChevronLeft /> : <FiChevronRight />}
                    </button>
                  </div>
                </div>
                {loadingEmpleados ? (
                  <Loading />
                ) : (
                  <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                    {empleados.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => abrirModalDias(emp)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                              {emp.nombre_completo || `${emp.nombre} ${emp.apellido}`}
                            </p>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <span className={`text-base sm:text-lg font-bold ${
                              (emp.dia_vacaciones || 0) > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {emp.dia_vacaciones || 0}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-500">días</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Listado de Vacaciones - Columna principal */}
            <div className={`lg:col-span-3 ${empleadosExpandido ? 'lg:col-span-2' : ''} order-1 lg:order-2`}>
          {/* Tabla de Vacaciones */}
          <div className="card overflow-x-auto">
            {loading ? (
              <Loading />
            ) : vacaciones.length === 0 ? (
              <EmptyState
                icon={FiSun}
                title="No hay vacaciones"
                description="No se encontraron vacaciones para el período seleccionado"
              />
            ) : (
              <>
                {/* Vista de escritorio - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                <table className="table w-full">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Días</th>
                    <th>Fecha Salida</th>
                    <th>Fecha Regreso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vacaciones.map((vacacion) => (
                    <tr key={vacacion.id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiUser className="text-gray-400" />
                          <span className="font-medium">{vacacion.nombre_empleado}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {vacacion.dias} días
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-green-500" />
                          <span>{vacacion.salida}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-red-500" />
                          <span>{vacacion.regreso}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => abrirModal(vacacion)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                          >
                            <FiEdit />
                          </button>
                          <button
                              onClick={() => abrirModalEliminar(vacacion)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Vista móvil - Cards */}
              <div className="md:hidden space-y-3">
                {vacaciones.map((vacacion) => (
                  <div key={vacacion.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FiUser className="text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{vacacion.nombre_empleado}</span>
                        </div>
                        <span className="badge badge-info text-xs">
                          {vacacion.dias} días
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => abrirModal(vacacion)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(vacacion)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <FiCalendar className="text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Salida:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vacacion.salida}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <FiCalendar className="text-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">Regreso:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vacacion.regreso}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
              </div>

              {/* Paginación */}
              {paginacion.totalPages > 1 && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {((paginacion.page - 1) * paginacion.limit) + 1} - {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de {paginacion.total} vacaciones
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => cargarVacaciones(paginacion.page - 1)}
                      disabled={paginacion.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, paginacion.totalPages) }, (_, i) => {
                        let pageNum;
                        if (paginacion.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (paginacion.page <= 3) {
                          pageNum = i + 1;
                        } else if (paginacion.page >= paginacion.totalPages - 2) {
                          pageNum = paginacion.totalPages - 4 + i;
                        } else {
                          pageNum = paginacion.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => cargarVacaciones(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              paginacion.page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => cargarVacaciones(paginacion.page + 1)}
                      disabled={paginacion.page === paginacion.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Crear/Editar */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vacacionEditando ? 'Editar Vacaciones' : 'Nueva Vacación'}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-ternary-dark rounded-lg transition-colors"
                >
                  <FiX className="text-2xl text-gray-500" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empleado <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.nombre_empleado}
                    onChange={(e) => handleEmpleadoChange(e.target.value)}
                    className="input w-full"
                    required
                    disabled={vacacionEditando !== null}
                  >
                    <option value="">Seleccionar empleado...</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={`${emp.nombre} ${emp.apellido}`}>
                        {emp.nombre} {emp.apellido} ({emp.dia_vacaciones} días disponibles)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Días Disponibles */}
                {diasDisponibles !== null && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <FiAlertCircle className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-900 dark:text-blue-200">
                        <strong>Días disponibles:</strong> {diasDisponibles} días
                      </span>
                    </div>
                  </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Salida <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.salidaISO}
                      onChange={(e) => handleFechaSalidaChange(e.target.value)}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Regreso <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.regresoISO}
                      onChange={(e) => handleFechaRegresoChange(e.target.value)}
                      className="input w-full"
                      min={formData.salidaISO}
                      required
                    />
                  </div>
                </div>

                {/* Días Calculados */}
                {formData.dias && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-900 dark:text-green-200">
                        <strong>Días de vacaciones:</strong>
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formData.dias} días
                      </span>
                    </div>
                    {diasDisponibles !== null && formData.dias > diasDisponibles && (
                      <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <FiAlertCircle />
                        <span className="text-xs">
                          ¡Excede los días disponibles! ({formData.dias} {'>'} {diasDisponibles})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={diasDisponibles !== null && formData.dias > diasDisponibles}
                  >
                    {vacacionEditando ? 'Actualizar' : 'Crear'} Vacaciones
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Listado Completo de Empleados */}
        {modalEmpleadosAbierto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Días de Vacaciones Disponibles - Todos los Empleados
                </h2>
                <button
                  onClick={() => setModalEmpleadosAbierto(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-ternary-dark rounded-lg transition-colors"
                >
                  <FiX className="text-2xl text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingEmpleados ? (
                  <Loading />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {empleados.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => {
                          setModalEmpleadosAbierto(false);
                          abrirModalDias(emp);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {emp.nombre_completo || `${emp.nombre} ${emp.apellido}`}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Días disponibles
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <span className={`text-3xl font-bold ${
                              (emp.dia_vacaciones || 0) > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {emp.dia_vacaciones || 0}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-500">días</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición de Días de Vacaciones */}
        {modalDiasAbierto && empleadoEditandoDias && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Editar Días de Vacaciones
                </h2>
                <button
                  onClick={cerrarModalDias}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-ternary-dark rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleActualizarDias} className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Empleado
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {empleadoEditandoDias.nombre_completo || `${empleadoEditandoDias.nombre} ${empleadoEditandoDias.apellido}`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Días de Vacaciones Disponibles <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={diasEditando}
                    onChange={(e) => setDiasEditando(e.target.value)}
                    className="input w-full"
                    min="0"
                    max="365"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModalDias}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {modalEliminarAbierto && vacacionEliminar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Confirmar Eliminación
                </h2>
                <button
                  onClick={cerrarModalEliminar}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-ternary-dark rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  ¿Estás seguro de que deseas eliminar estas vacaciones?
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Empleado:</span> {vacacionEliminar.nombre_empleado}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Días:</span> {vacacionEliminar.dias} días
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Salida:</span> {vacacionEliminar.salida}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Regreso:</span> {vacacionEliminar.regreso}
                  </p>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Los días de vacaciones serán restaurados y el planificador será actualizado.
                </p>
              </div>

              <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleEliminar}
                  className="btn-danger flex-1"
                >
                  Eliminar
                </button>
                <button
                  onClick={cerrarModalEliminar}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
