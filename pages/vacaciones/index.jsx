// pages/vacaciones/index.jsx - Gestión de vacaciones
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FiPlus, FiCalendar, FiEdit, FiTrash2, FiX, FiUser, FiSun, FiAlertCircle } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Vacaciones() {
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [empleadoFiltro, setEmpleadoFiltro] = useState('');
  
  const [empleados, setEmpleados] = useState([]);
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  
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

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    cargarVacaciones();
  }, [anioFiltro, empleadoFiltro]);

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

  const cargarVacaciones = async () => {
    setLoading(true);
    try {
      const params = {};
      if (empleadoFiltro) params.nombre_empleado = empleadoFiltro;
      if (anioFiltro) params.anio = anioFiltro;
      
      const response = await apiClient.get('/vacaciones', { params });
      
      if (response.data.success) {
        setVacaciones(response.data.vacaciones || []);
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
      cargarVacaciones();
      cargarEmpleados(); // Recargar para actualizar días disponibles
    } catch (error) {
      console.error('Error al guardar vacaciones:', error);
      toast.error(error.response?.data?.message || 'Error al guardar vacaciones');
    }
  };

  const handleEliminar = async (id, nombreEmpleado) => {
    if (!confirm(`¿Eliminar las vacaciones de ${nombreEmpleado}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/vacaciones/${id}`);
      toast.success('Vacaciones eliminadas exitosamente');
      cargarVacaciones();
      cargarEmpleados();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar vacaciones');
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Vacaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestión de períodos vacacionales
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Nueva Vacación</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <table className="table">
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
                            onClick={() => handleEliminar(vacacion.id, vacacion.nombre_empleado)}
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
            )}
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
      </Layout>
    </>
  );
}
