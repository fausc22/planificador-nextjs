// pages/logueos/index.jsx - Registro de logueos (ingresos y egresos)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FiClock, FiUser, FiLogIn, FiLogOut, FiEdit2, FiTrash2, FiKey, FiX, FiEye, FiEyeOff, FiPlus, FiImage, FiCalendar } from 'react-icons/fi';
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

  // Estados para modal de configuración
  const [modalConfiguracion, setModalConfiguracion] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarContrasenaActual, setMostrarContrasenaActual] = useState(false);
  const [mostrarContrasenaNueva, setMostrarContrasenaNueva] = useState(false);

  // Estados para modal de editar logueo
  const [modalEditarLogueo, setModalEditarLogueo] = useState(false);
  const [logueoEditar, setLogueoEditar] = useState(null);
  const [nuevaHora, setNuevaHora] = useState('');

  // Estados para modal de crear logueo
  const [modalCrearLogueo, setModalCrearLogueo] = useState(false);
  const [nuevoLogueo, setNuevoLogueo] = useState({
    empleado: '',
    fecha: '',
    hora: '',
    accion: 'INGRESO'
  });

  // Estados para modal de ver foto
  const [modalVerFoto, setModalVerFoto] = useState(false);
  const [fotoActual, setFotoActual] = useState(null);

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

  // Cargar configuración actual cuando se abre el modal
  const cargarConfiguracion = async () => {
    try {
      const response = await apiClient.get('/logueo/configuracion');
      if (response.data.success) {
        setContrasenaActual(response.data.contrasena);
        setTelefono(response.data.telefono || '');
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      toast.error('Error al cargar configuración');
    }
  };

  // Abrir modal de configuración
  const abrirModalConfiguracion = () => {
    setModalConfiguracion(true);
    cargarConfiguracion();
  };

  // Actualizar configuración de logueo
  const handleActualizarConfiguracion = async (e) => {
    e.preventDefault();
    
    if (!contrasenaNueva && !telefono) {
      toast.error('Por favor ingresa al menos una configuración para actualizar');
      return;
    }

    try {
      const response = await apiClient.post('/logueo/configuracion', {
        contrasenaNueva: contrasenaNueva || undefined,
        telefono: telefono || undefined
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Configuración actualizada exitosamente');
        setModalConfiguracion(false);
        setContrasenaActual('');
        setContrasenaNueva('');
        setTelefono('');
        setMostrarContrasenaActual(false);
        setMostrarContrasenaNueva(false);
      }
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar configuración');
    }
  };

  // Abrir modal para editar logueo
  const abrirModalEditar = (logueo) => {
    setLogueoEditar(logueo);
    setNuevaHora(logueo.hora);
    setModalEditarLogueo(true);
  };

  // Actualizar hora del logueo
  const handleActualizarLogueo = async (e) => {
    e.preventDefault();

    if (!nuevaHora) {
      toast.error('Ingresa una hora válida');
      return;
    }

    try {
      const response = await apiClient.put(`/logueo/${anio}/${logueoEditar.id}`, {
        hora: nuevaHora
      });

      if (response.data.success) {
        toast.success('Logueo actualizado exitosamente');
        setModalEditarLogueo(false);
        setLogueoEditar(null);
        setNuevaHora('');
        cargarLogueos();
      }
    } catch (error) {
      console.error('Error al actualizar logueo:', error);
      toast.error('Error al actualizar logueo');
    }
  };

  // Eliminar logueo
  const handleEliminarLogueo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este logueo?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/logueo/${anio}/${id}`);

      if (response.data.success) {
        toast.success('Logueo eliminado exitosamente');
        cargarLogueos();
      }
    } catch (error) {
      console.error('Error al eliminar logueo:', error);
      toast.error('Error al eliminar logueo');
    }
  };

  // Abrir modal para crear logueo
  const abrirModalCrear = () => {
    setNuevoLogueo({
      empleado: '',
      fecha: '',
      hora: '',
      accion: 'INGRESO'
    });
    setModalCrearLogueo(true);
  };

  // Crear nuevo logueo
  const handleCrearLogueo = async (e) => {
    e.preventDefault();

    if (!nuevoLogueo.empleado || !nuevoLogueo.fecha || !nuevoLogueo.hora || !nuevoLogueo.accion) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
      const [year, month, day] = nuevoLogueo.fecha.split('-');
      const fechaFormateada = `${day}/${month}/${year}`;
      
      // Obtener el mes en texto
      const mesNombre = MESES[parseInt(month) - 1].toUpperCase();

      const response = await apiClient.post(`/logueo/${year}`, {
        nombre_empleado: nuevoLogueo.empleado,
        fecha: fechaFormateada,
        hora: nuevoLogueo.hora,
        accion: nuevoLogueo.accion,
        mes: mesNombre
      });

      if (response.data.success) {
        toast.success('Logueo creado exitosamente');
        setModalCrearLogueo(false);
        cargarLogueos();
      }
    } catch (error) {
      console.error('Error al crear logueo:', error);
      toast.error(error.response?.data?.message || 'Error al crear logueo');
    }
  };

  const abrirModalFoto = (logueo) => {
    if (logueo.foto_logueo) {
      // Construir URL completa usando la API URL del backend (sin /api)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
      const fotoUrl = `${apiUrl}/uploads/logueos/${logueo.foto_logueo}`;
      
      setFotoActual({
        url: fotoUrl,
        empleado: logueo.nombre_empleado,
        fecha: logueo.fecha,
        hora: logueo.hora,
        accion: logueo.accion
      });
      setModalVerFoto(true);
    } else {
      toast.error('Este logueo no tiene foto de verificación');
    }
  };

  const cerrarModalFoto = () => {
    setModalVerFoto(false);
    setFotoActual(null);
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
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Logueos
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Registro de ingresos y egresos de empleados
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button 
                onClick={abrirModalConfiguracion}
                className="btn btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <FiKey />
                <span className="hidden sm:inline">Configuración Logueo</span>
                <span className="sm:hidden">Contraseña</span>
              </button>
              <button 
                onClick={abrirModalCrear}
                className="btn btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <FiPlus />
                <span className="hidden sm:inline">Crear Nuevo Logueo</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
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
          <div className="card">
            {loading ? (
              <Loading />
            ) : logueos.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="No hay logueos"
                description="No se encontraron logueos para el período seleccionado"
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
                    <th>Acción</th>
                    <th>Hora</th>
                        <th>Foto</th>
                    <th>Acciones</th>
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
                          <td>
                            {logueo.foto_logueo ? (
                              <button
                                onClick={() => abrirModalFoto(logueo)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                title="Ver foto de verificación"
                              >
                                <FiImage className="text-lg" />
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin foto</span>
                            )}
                          </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => abrirModalEditar(logueo)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <FiEdit2 className="text-lg" />
                          </button>
                          <button 
                            onClick={() => handleEliminarLogueo(logueo.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <FiTrash2 className="text-lg" />
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
                  {logueos.map((logueo) => (
                    <div key={logueo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiUser className="text-gray-400" />
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {logueo.nombre_empleado}
                            </h3>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{logueo.fecha}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FiClock className="text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">{logueo.hora}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {logueo.accion === 'INGRESO' ? (
                                <span className="badge badge-success inline-flex items-center space-x-1 text-xs">
                                  <FiLogIn />
                                  <span>INGRESO</span>
                                </span>
                              ) : (
                                <span className="badge badge-danger inline-flex items-center space-x-1 text-xs">
                                  <FiLogOut />
                                  <span>EGRESO</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-3">
                          {logueo.foto_logueo ? (
                            <button
                              onClick={() => abrirModalFoto(logueo)}
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Ver foto"
                            >
                              <FiImage size={18} />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Sin foto</span>
                          )}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => abrirModalEditar(logueo)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Editar"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleEliminarLogueo(logueo.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Eliminar"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Modal: Configuración Logueo */}
          {modalConfiguracion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Configuración Logueo
                  </h2>
                  <button 
                    onClick={() => {
                      setModalConfiguracion(false);
                      setContrasenaActual('');
                      setContrasenaNueva('');
                      setTelefono('');
                      setMostrarContrasenaActual(false);
                      setMostrarContrasenaNueva(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <form onSubmit={handleActualizarConfiguracion}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña Actual
                      </label>
                      <div className="relative">
                        <input 
                          type={mostrarContrasenaActual ? "text" : "password"}
                          value={contrasenaActual}
                          readOnly
                          className="input pr-10 bg-gray-100 dark:bg-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarContrasenaActual(!mostrarContrasenaActual)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {mostrarContrasenaActual ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Esta es la contraseña que los empleados usan actualmente
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input 
                          type={mostrarContrasenaNueva ? "text" : "password"}
                          value={contrasenaNueva}
                          onChange={(e) => setContrasenaNueva(e.target.value)}
                          className="input pr-10"
                          placeholder="Deja vacío para no cambiar"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarContrasenaNueva(!mostrarContrasenaNueva)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {mostrarContrasenaNueva ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Teléfono Notificaciones
                      </label>
                      <input 
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="input"
                        placeholder="Ej: 5493511234567"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        FORMATO OBLIGATORIO: 549XXXXXXXX
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setModalConfiguracion(false);
                        setContrasenaActual('');
                        setContrasenaNueva('');
                        setTelefono('');
                        setMostrarContrasenaActual(false);
                        setMostrarContrasenaNueva(false);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Actualizar Configuración
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Editar Logueo */}
          {modalEditarLogueo && logueoEditar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Editar Hora de Logueo
                  </h2>
                  <button 
                    onClick={() => {
                      setModalEditarLogueo(false);
                      setLogueoEditar(null);
                      setNuevaHora('');
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Empleado:</strong> {logueoEditar.nombre_empleado}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Fecha:</strong> {logueoEditar.fecha}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Acción:</strong> {logueoEditar.accion}
                  </p>
                </div>

                <form onSubmit={handleActualizarLogueo}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva Hora
                    </label>
                    <input 
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setModalEditarLogueo(false);
                        setLogueoEditar(null);
                        setNuevaHora('');
                      }}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Crear Nuevo Logueo */}
          {modalCrearLogueo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Crear Nuevo Logueo
                  </h2>
                  <button 
                    onClick={() => setModalCrearLogueo(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <form onSubmit={handleCrearLogueo}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Empleado
                      </label>
                      <select 
                        value={nuevoLogueo.empleado}
                        onChange={(e) => setNuevoLogueo({...nuevoLogueo, empleado: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="">Selecciona un empleado</option>
                        {empleados.map((emp) => (
                          <option key={emp.id} value={`${emp.nombre} ${emp.apellido}`}>
                            {emp.nombre} {emp.apellido}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha
                      </label>
                      <input 
                        type="date"
                        value={nuevoLogueo.fecha}
                        onChange={(e) => setNuevoLogueo({...nuevoLogueo, fecha: e.target.value})}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hora
                      </label>
                      <input 
                        type="time"
                        value={nuevoLogueo.hora}
                        onChange={(e) => setNuevoLogueo({...nuevoLogueo, hora: e.target.value})}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Acción
                      </label>
                      <select 
                        value={nuevoLogueo.accion}
                        onChange={(e) => setNuevoLogueo({...nuevoLogueo, accion: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="INGRESO">INGRESO</option>
                        <option value="EGRESO">EGRESO</option>
                      </select>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Nota:</strong> El sistema validará automáticamente que la secuencia de INGRESO/EGRESO sea correcta y que no haya duplicados.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => setModalCrearLogueo(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Crear Logueo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Ver Foto de Verificación */}
          {modalVerFoto && fotoActual && (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Foto de Verificación
                  </h2>
                  <button 
                    onClick={cerrarModalFoto}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Información del logueo */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Empleado:</span>
                        <p className="text-gray-900 dark:text-white">{fotoActual.empleado}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Fecha:</span>
                        <p className="text-gray-900 dark:text-white">{fotoActual.fecha}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Hora:</span>
                        <p className="text-gray-900 dark:text-white">{fotoActual.hora}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Acción:</span>
                        <p className="text-gray-900 dark:text-white">
                          {fotoActual.accion === 'INGRESO' ? (
                            <span className="badge badge-success">INGRESO</span>
                          ) : (
                            <span className="badge badge-danger">EGRESO</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Foto */}
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    <img
                      src={fotoActual.url}
                      alt={`Foto de verificación - ${fotoActual.empleado}`}
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-center py-8 text-gray-500 dark:text-gray-400';
                        errorDiv.textContent = 'Foto no disponible';
                        e.target.parentNode.appendChild(errorDiv);
                      }}
                    />
                  </div>

                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Esta foto fue capturada al momento del registro para verificar la identidad del empleado
                  </p>
                </div>

                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={cerrarModalFoto}
                    className="btn btn-secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

