// pages/empleados/index.jsx - Gestión completa de empleados (Refactorizado)
import { useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useEmpleados } from '../../hooks/useEmpleados';
import { useEmpleadoForm } from '../../hooks/useEmpleadoForm';
import CustomSelect from '../../components/ui/CustomSelect';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser, FiMail, FiCalendar, FiDollarSign, FiX, FiSave, FiGrid, FiList, FiAlertCircle, FiCheck } from 'react-icons/fi';

export default function Empleados() {
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');
  const [vistaCards, setVistaCards] = useState(true);
  
  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  
  // Hook para manejar empleados
  const {
    empleados,
    loading,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado
  } = useEmpleados();
  
  // Hook personalizado para manejar el formulario
  const {
    formData,
    errors,
    actualizarCampo,
    resetearFormulario,
    validarFormulario,
    obtenerDatos
  } = useEmpleadoForm(null);
  
  // Modal para opciones de cambio de tarifa
  const [modalCambioTarifa, setModalCambioTarifa] = useState(false);
  const [horaNormalAnterior, setHoraNormalAnterior] = useState(null);
  const [opcionAplicacion, setOpcionAplicacion] = useState('desde_hoy');

  const abrirModal = (empleado = null) => {
    if (empleado) {
      setEmpleadoEditando(empleado);
      setHoraNormalAnterior(empleado.hora_normal);
      resetearFormulario(empleado);
    } else {
      setEmpleadoEditando(null);
      setHoraNormalAnterior(null);
      resetearFormulario();
    }
    setModalAbierto(true);
    setModalCambioTarifa(false);
    setOpcionAplicacion('desde_hoy');
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalCambioTarifa(false);
    setEmpleadoEditando(null);
    setHoraNormalAnterior(null);
    resetearFormulario();
    setOpcionAplicacion('desde_hoy');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await guardarEmpleado();
  };

  const guardarEmpleado = async () => {
    try {
      // Validar formulario primero
      const validacion = validarFormulario(!!empleadoEditando);
      if (!validacion.valido) {
        return;
      }

      // Si está editando y cambió la hora_normal, mostrar modal de opciones
      if (empleadoEditando && horaNormalAnterior && parseFloat(formData.hora_normal) !== parseFloat(horaNormalAnterior)) {
        setModalCambioTarifa(true);
        return;
      }

      // Obtener datos del formulario
      const datosEnviar = obtenerDatos();

      // Si hay cambio de tarifa, agregar la opción seleccionada
      if (empleadoEditando && horaNormalAnterior && parseFloat(formData.hora_normal) !== parseFloat(horaNormalAnterior)) {
        datosEnviar.aplicar_cambio_tarifa = opcionAplicacion;
      }

      // Crear o actualizar empleado (sin foto - la foto es solo para visualización)
      if (empleadoEditando) {
        await actualizarEmpleado(empleadoEditando.id, datosEnviar);
      } else {
        await crearEmpleado(datosEnviar);
      }
      
      cerrarModal();
    } catch (error) {
      // Los errores ya se manejan en los hooks
      console.error('Error al guardar empleado:', error);
    }
  };

  const handleEliminar = async (id, nombre, apellido) => {
    if (!window.confirm(`¿Eliminar a ${nombre} ${apellido}?\n\nSe eliminarán todos sus turnos asignados.`)) {
      return;
    }

    try {
      await eliminarEmpleado(id);
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error al eliminar empleado:', error);
    }
  };

  const ordenarEmpleados = (campo) => {
    if (ordenarPor === campo) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdenDireccion('asc');
    }
  };

  const empleadosFiltrados = useMemo(() => {
    return empleados
      .filter(emp =>
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(busqueda.toLowerCase()))
      )
      .sort((a, b) => {
        const aVal = a[ordenarPor];
        const bVal = b[ordenarPor];
        
        if (ordenDireccion === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
  }, [empleados, busqueda, ordenarPor, ordenDireccion]);

  const getFotoUrl = (empleado) => {
    if (empleado.foto_perfil_url) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/planificador';
      const baseUrl = apiUrl.replace(/\/planificador$/, '');
      return `${baseUrl}${empleado.foto_perfil_url}`;
    }
    return null;
  };

  return (
    <>
      <Head>
        <title>Empleados - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Empleados
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {empleados.length} empleados activos
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setVistaCards(true)}
                  className={`p-2 rounded transition-colors ${vistaCards ? 'bg-white dark:bg-secondary-dark shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="Vista Cards"
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setVistaCards(false)}
                  className={`p-2 rounded transition-colors ${!vistaCards ? 'bg-white dark:bg-secondary-dark shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="Vista Tabla"
                >
                  <FiList />
                </button>
            </div>

            <button
                onClick={() => abrirModal()}
                className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <FiPlus />
                <span className="hidden sm:inline">Nuevo Empleado</span>
                <span className="sm:hidden">Nuevo</span>
            </button>
            </div>
          </div>

          {/* Barra de búsqueda y ordenamiento */}
          <div className="card mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                  className="input pl-10 w-full text-sm sm:text-base"
                />
              </div>
              
              <CustomSelect
                value={ordenarPor}
                onChange={(e) => ordenarEmpleados(e.target.value)}
                options={[
                  { value: 'nombre', label: 'Ordenar por Nombre' },
                  { value: 'apellido', label: 'Ordenar por Apellido' },
                  { value: 'fecha_ingreso', label: 'Ordenar por Antigüedad' },
                  { value: 'hora_normal', label: 'Ordenar por Tarifa' }
                ]}
                containerClassName="mb-0 w-full sm:w-auto sm:min-w-[200px]"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Contenido */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="spinner"></div>
              </div>
            ) : empleadosFiltrados.length === 0 ? (
              <div className="card text-center py-12">
                <FiUser className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {busqueda ? 'No se encontraron empleados' : 'No hay empleados registrados'}
                </p>
                {!busqueda && (
                  <button
                    onClick={() => abrirModal()}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Crear Primer Empleado</span>
                  </button>
                )}
              </div>
            ) : vistaCards ? (
              /* VISTA CARDS */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {empleadosFiltrados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    {/* Foto de perfil */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        {getFotoUrl(empleado) ? (
                          <img
                            src={getFotoUrl(empleado)}
                            alt={`${empleado.nombre} ${empleado.apellido}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${empleado.nombre}+${empleado.apellido}&size=200&background=4299E1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-100 dark:border-blue-900">
                            {empleado.nombre[0]}{empleado.apellido[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {empleado.nombre} {empleado.apellido}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-1">
                        <FiMail size={14} />
                        {empleado.email || empleado.mail}
                      </p>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FiCalendar size={14} />
                          Ingreso:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {empleado.fecha_ingreso}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          Antigüedad:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {empleado.antiguedad} {empleado.antiguedad === 1 ? 'año' : 'años'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FiDollarSign size={14} />
                          Tarifa/hora:
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          ${empleado.hora_normal}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          Vacaciones:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {empleado.dia_vacaciones} días
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => abrirModal(empleado)}
                        className="flex-1 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 font-medium text-sm sm:text-base"
                      >
                        <FiEdit size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        onClick={() => handleEliminar(empleado.id, empleado.nombre, empleado.apellido)}
                        className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Eliminar"
                      >
                        <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* VISTA TABLA - Mantener el código existente */
              <>
                {/* Vista de escritorio - Tabla */}
                <div className="hidden md:block card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('nombre')}>
                          Nombre {ordenarPor === 'nombre' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('apellido')}>
                          Apellido {ordenarPor === 'apellido' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                          <th>Email</th>
                        <th className="hidden lg:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('fecha_ingreso')}>
                          Fecha Ingreso {ordenarPor === 'fecha_ingreso' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                          <th className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('hora_normal')}>
                          Tarifa/hora {ordenarPor === 'hora_normal' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="hidden xl:table-cell">Vacaciones</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosFiltrados.map((empleado) => (
                        <tr key={empleado.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              {getFotoUrl(empleado) ? (
                                <img
                                  src={getFotoUrl(empleado)}
                                  alt={empleado.nombre}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${empleado.nombre}+${empleado.apellido}&size=100&background=4299E1&color=fff`;
                                  }}
                                />
                              ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                  {empleado.nombre[0]}
                                </div>
                              )}
                              <span className="font-medium">{empleado.nombre}</span>
                            </div>
                          </td>
                          <td className="font-medium">{empleado.apellido}</td>
                            <td className="text-gray-600 dark:text-gray-400 text-sm">
                            {empleado.email || empleado.mail}
                          </td>
                          <td className="hidden lg:table-cell">
                            {empleado.fecha_ingreso}
                          </td>
                            <td>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                            ${empleado.hora_normal}
                            </span>
                          </td>
                          <td className="hidden xl:table-cell text-center">
                            {empleado.dia_vacaciones} días
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => abrirModal(empleado)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleEliminar(empleado.id, empleado.nombre, empleado.apellido)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              </div>

                {/* Vista móvil - Cards compactas */}
                <div className="md:hidden space-y-3">
                  {empleadosFiltrados.map((empleado) => (
                    <div key={empleado.id} className="card">
                      <div className="flex items-start gap-3">
                        {getFotoUrl(empleado) ? (
                          <img
                            src={getFotoUrl(empleado)}
                            alt={empleado.nombre}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${empleado.nombre}+${empleado.apellido}&size=100&background=4299E1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {empleado.nombre[0]}{empleado.apellido[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">
                            {empleado.nombre} {empleado.apellido}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {empleado.email || empleado.mail}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Tarifa:</span> ${empleado.hora_normal}/h
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => abrirModal(empleado)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Editar"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminar(empleado.id, empleado.nombre, empleado.apellido)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar"
                              >
                                <FiTrash2 size={16} />
                              </button>
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

        {/* MODAL DE OPCIONES DE CAMBIO DE TARIFA */}
        {modalCambioTarifa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiAlertCircle className="text-yellow-500 text-2xl" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Cambio de Tarifa Detectado
                  </h2>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Tarifa anterior:</strong> ${horaNormalAnterior}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Nueva tarifa:</strong> ${formData.hora_normal}
                  </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ¿Cómo deseas aplicar este cambio en los acumulados del planificador?
                </p>

                <div className="space-y-3 mb-6">
                  <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ borderColor: opcionAplicacion === 'retroactivo_mes' ? '#3B82F6' : '#E5E7EB' }}>
                    <input
                      type="radio"
                      name="aplicar_cambio"
                      value="retroactivo_mes"
                      checked={opcionAplicacion === 'retroactivo_mes'}
                      onChange={(e) => setOpcionAplicacion(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Retroactivo - Todo el mes actual
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Recalcula todos los días del mes actual con la nueva tarifa
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ borderColor: opcionAplicacion === 'desde_hoy' ? '#3B82F6' : '#E5E7EB' }}>
                    <input
                      type="radio"
                      name="aplicar_cambio"
                      value="desde_hoy"
                      checked={opcionAplicacion === 'desde_hoy'}
                      onChange={(e) => setOpcionAplicacion(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Desde hoy en adelante
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Recalcula desde el día de hoy hasta el final del año
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ borderColor: opcionAplicacion === 'proximo_mes' ? '#3B82F6' : '#E5E7EB' }}>
                    <input
                      type="radio"
                      name="aplicar_cambio"
                      value="proximo_mes"
                      checked={opcionAplicacion === 'proximo_mes'}
                      onChange={(e) => setOpcionAplicacion(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Desde el próximo mes
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        No modifica el mes actual, aplica desde el primer día del próximo mes
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setModalCambioTarifa(false);
                      actualizarCampo('hora_normal', horaNormalAnterior);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarEmpleado}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  >
                    <FiCheck />
                    Aplicar Cambio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CREAR/EDITAR */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-2xl w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado'}
                  </h2>
                  <button
                    onClick={cerrarModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX className="text-lg sm:text-xl" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Foto de perfil - SOLO VISUALIZACIÓN para empleados existentes */}
                    {empleadoEditando && getFotoUrl(empleadoEditando) && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                          Foto de Perfil
                        </label>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <img
                            src={getFotoUrl(empleadoEditando)}
                            alt={`${empleadoEditando.nombre} ${empleadoEditando.apellido}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${empleadoEditando.nombre}+${empleadoEditando.apellido}&size=200&background=4299E1&color=fff`;
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📸 La foto es solo para visualización y no puede ser editada desde esta interfaz.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => actualizarCampo('nombre', e.target.value)}
                        className={`input w-full ${errors.nombre ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.nombre && (
                        <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
                      )}
                    </div>

                    {/* Apellido */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => actualizarCampo('apellido', e.target.value)}
                        className={`input w-full ${errors.apellido ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.apellido && (
                        <p className="text-xs text-red-500 mt-1">{errors.apellido}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.mail}
                        onChange={(e) => actualizarCampo('mail', e.target.value)}
                        className={`input w-full ${errors.mail ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.mail && (
                        <p className="text-xs text-red-500 mt-1">{errors.mail}</p>
                      )}
                    </div>

                    {/* Fecha de ingreso */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Fecha de Ingreso *
                      </label>
                      <input
                        type="text"
                        value={formData.fecha_ingreso}
                        onChange={(e) => actualizarCampo('fecha_ingreso', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className={`input w-full ${errors.fecha_ingreso ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.fecha_ingreso && (
                        <p className="text-xs text-red-500 mt-1">{errors.fecha_ingreso}</p>
                      )}
                    </div>

                    {/* Hora normal (tarifa) */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Tarifa por Hora * ($)
                      </label>
                      <input
                        type="number"
                        value={formData.hora_normal}
                        onChange={(e) => actualizarCampo('hora_normal', e.target.value)}
                        className={`input w-full text-sm sm:text-base ${errors.hora_normal ? 'border-red-500' : ''}`}
                        min="0"
                        step="0.01"
                        required
                      />
                      {errors.hora_normal && (
                        <p className="text-xs text-red-500 mt-1">{errors.hora_normal}</p>
                      )}
                      {empleadoEditando && horaNormalAnterior && parseFloat(formData.hora_normal) !== parseFloat(horaNormalAnterior) && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
                          <FiAlertCircle size={12} />
                          Se detectó un cambio de tarifa. Se te pedirá cómo aplicarlo al guardar.
                        </p>
                      )}
                    </div>

                    {/* Días de vacaciones */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Días de Vacaciones
                      </label>
                      <input
                        type="number"
                        value={formData.dia_vacaciones}
                        onChange={(e) => actualizarCampo('dia_vacaciones', e.target.value)}
                        className="input w-full"
                        min="0"
                      />
                    </div>

                    {/* Antigüedad */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Antigüedad (años)
                      </label>
                      <input
                        type="number"
                        value={formData.antiguedad}
                        onChange={(e) => actualizarCampo('antiguedad', e.target.value)}
                        className="input w-full"
                        min="0"
                      />
                    </div>

                    {/* Tarifa hora vacaciones */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Tarifa Hora Vacaciones ($)
                      </label>
                      <input
                        type="number"
                        value={formData.horas_vacaciones}
                        onChange={(e) => actualizarCampo('horas_vacaciones', e.target.value)}
                        className="input w-full"
                        min="0"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  {/* Info sobre generación de turnos */}
                  {!empleadoEditando && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        ℹ️ Al crear el empleado se generarán automáticamente los turnos para los años <strong>2024-2027</strong> (aproximadamente 1,460 días).
                      </p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FiSave />
                      <span className="hidden sm:inline">{empleadoEditando ? 'Actualizar Empleado' : 'Crear Empleado'}</span>
                      <span className="sm:hidden">{empleadoEditando ? 'Actualizar' : 'Crear'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
