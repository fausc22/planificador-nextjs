// pages/turnos/index.jsx - Gestión completa de turnos/horarios
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { turnosAPI } from '../../utils/api';
import CustomSelect from '../../components/ui/CustomSelect';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiX, FiSave, FiAlertCircle } from 'react-icons/fi';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

export default function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState(null);
  const [formData, setFormData] = useState({
    turnos: '',
    horaInicio: '',
    horaFin: '',
    horas: ''
  });
  const [errores, setErrores] = useState({});
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [turnoEliminar, setTurnoEliminar] = useState(null);

  useEffect(() => {
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    try {
      setLoading(true);
      const response = await turnosAPI.obtenerTodos();
      
      if (response.data.success) {
        setTurnos(response.data.turnos || []);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
      toast.error('Error al cargar turnos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (turno = null) => {
    if (turno) {
      // Editar
      setTurnoEditando(turno);
      setFormData({
        turnos: turno.turnos,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        horas: turno.horas
      });
    } else {
      // Nuevo
      setTurnoEditando(null);
      setFormData({
        turnos: '',
        horaInicio: '',
        horaFin: '',
        horas: ''
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTurnoEditando(null);
    setErrores({});
    setFormData({
      turnos: '',
      horaInicio: '',
      horaFin: '',
      horas: ''
    });
  };

  const abrirModalEliminar = (turno) => {
    setTurnoEliminar(turno);
    setModalEliminarAbierto(true);
  };

  const cerrarModalEliminar = () => {
    setModalEliminarAbierto(false);
    setTurnoEliminar(null);
  };

  const calcularHoras = () => {
    const { horaInicio, horaFin } = formData;
    if (horaInicio === '' || horaFin === '') {
      setFormData(prev => ({ ...prev, horas: '' }));
      return;
    }

    const inicio = parseInt(horaInicio);
    const fin = parseInt(horaFin);
    
    let horas = fin - inicio;
    if (horas < 0) {
      horas = 24 + horas; // Turno que cruza medianoche
    }
    
    setFormData(prev => ({ ...prev, horas: horas.toString() }));
    
    // Limpiar error si existe
    if (errores.horas) {
      setErrores(prev => ({ ...prev, horas: null }));
    }
  };

  useEffect(() => {
    if (formData.horaInicio !== '' && formData.horaFin !== '') {
      calcularHoras();
    }
  }, [formData.horaInicio, formData.horaFin]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.turnos || formData.turnos.trim() === '') {
      nuevosErrores.turnos = 'El nombre del turno es obligatorio';
    } else if (formData.turnos.trim().length > 50) {
      nuevosErrores.turnos = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.horaInicio === '' || formData.horaInicio === null) {
      nuevosErrores.horaInicio = 'La hora de inicio es obligatoria';
    }

    if (formData.horaFin === '' || formData.horaFin === null) {
      nuevosErrores.horaFin = 'La hora de fin es obligatoria';
    }

    if (!formData.horas || formData.horas === '') {
      nuevosErrores.horas = 'Las horas son obligatorias';
    } else {
      const horasNum = parseInt(formData.horas);
      if (isNaN(horasNum) || horasNum < 0 || horasNum > 24) {
        nuevosErrores.horas = 'Las horas deben estar entre 0 y 24';
      }
    }

    // Validar que las horas coincidan con el cálculo
    if (formData.horaInicio !== '' && formData.horaFin !== '' && formData.horas) {
      const inicio = parseInt(formData.horaInicio);
      const fin = parseInt(formData.horaFin);
      const horasNum = parseInt(formData.horas);
      
      let horasCalculadas = fin - inicio;
      if (horasCalculadas < 0) {
        horasCalculadas = 24 + horasCalculadas;
      }

      if (horasCalculadas !== horasNum) {
        nuevosErrores.horas = `Las horas deben ser ${horasCalculadas} (calculadas automáticamente)`;
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      const datosEnviar = {
        turnos: formData.turnos.trim(),
        horaInicio: parseInt(formData.horaInicio),
        horaFin: parseInt(formData.horaFin),
        horas: parseInt(formData.horas)
      };

      if (turnoEditando) {
        // Actualizar
        await turnosAPI.actualizar(turnoEditando.id, datosEnviar);
        toast.success('Turno actualizado exitosamente');
      } else {
        // Crear
        await turnosAPI.crear(datosEnviar);
        toast.success('Turno creado exitosamente');
      }
      
      cerrarModal();
      cargarTurnos();
    } catch (error) {
      console.error('Error al guardar turno:', error);
      
      // Manejar errores de validación del backend
      if (error.response?.data?.errors) {
        const erroresBackend = {};
        error.response.data.errors.forEach(err => {
          erroresBackend[err.field] = err.message;
        });
        setErrores(erroresBackend);
      }
      
      toast.error(error.response?.data?.message || 'Error al guardar turno');
    }
  };

  const handleEliminar = async () => {
    if (!turnoEliminar) return;

    try {
      await turnosAPI.eliminar(turnoEliminar.id);
      toast.success('Turno eliminado exitosamente');
      cerrarModalEliminar();
      cargarTurnos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar turno');
    }
  };

  return (
    <>
      <Head>
        <title>Turnos - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Turnos y Horarios
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Configuración de jornadas laborales
              </p>
            </div>

            <button
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              onClick={() => abrirModal()}
            >
              <FiPlus />
              <span className="hidden sm:inline">Nuevo Turno</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Tabla de turnos */}
          <div className="card">
            {loading ? (
              <Loading />
            ) : turnos.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="No hay turnos configurados"
                description="Crea tu primer turno para comenzar a configurar los horarios laborales"
                action={
                <button
                  onClick={() => abrirModal()}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <FiPlus />
                  <span>Crear Primer Turno</span>
                </button>
                }
              />
            ) : (
              <>
                {/* Vista de escritorio - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Nombre del Turno</th>
                      <th className="text-center">Hora Inicio</th>
                      <th className="text-center">Hora Fin</th>
                      <th className="text-center">Horas</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnos.map((turno) => (
                      <tr key={turno.id}>
                        <td className="font-medium">
                          <div className="flex items-center space-x-2">
                            <FiClock className="text-blue-500" />
                            <span>{turno.turnos}</span>
                          </div>
                        </td>
                        <td className="text-center">
                            {String(turno.horaInicio).padStart(2, '0')}:00 hs
                        </td>
                        <td className="text-center">
                            {turno.horaFin === 0 ? '00:00 hs' : `${String(turno.horaFin).padStart(2, '0')}:00 hs`}
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {turno.horas}h
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => abrirModal(turno)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <FiEdit />
                            </button>
                            <button
                                onClick={() => abrirModalEliminar(turno)}
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

                {/* Vista móvil - Cards */}
                <div className="md:hidden space-y-3">
                  {turnos.map((turno) => (
                    <div key={turno.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiClock className="text-blue-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {turno.turnos}
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Inicio:</span>
                              <span className="font-medium text-gray-900 dark:text-white ml-1">
                                {String(turno.horaInicio).padStart(2, '0')}:00 hs
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Fin:</span>
                              <span className="font-medium text-gray-900 dark:text-white ml-1">
                                {turno.horaFin === 0 ? '00:00 hs' : `${String(turno.horaFin).padStart(2, '0')}:00 hs`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {turno.horas}h
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => abrirModal(turno)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Editar"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => abrirModalEliminar(turno)}
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

            {/* Resumen */}
            {!loading && turnos.length > 0 && (
              <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{turnos.length}</strong> {turnos.length === 1 ? 'turno' : 'turnos'} configurado{turnos.length === 1 ? '' : 's'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {modalEliminarAbierto && turnoEliminar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
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
                  ¿Estás seguro de que deseas eliminar este turno?
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Turno:</span> {turnoEliminar.turnos}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Horario:</span> {String(turnoEliminar.horaInicio).padStart(2, '0')}:00 - {turnoEliminar.horaFin === 0 ? '00:00' : `${String(turnoEliminar.horaFin).padStart(2, '0')}:00`} hs
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Duración:</span> {turnoEliminar.horas} horas
                  </p>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Esto no afectará los turnos ya asignados a empleados en el planificador.
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

        {/* Modal Crear/Editar */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-md w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {turnoEditando ? 'Editar Turno' : 'Nuevo Turno'}
                </h2>
                <button
                  onClick={cerrarModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FiX className="text-lg sm:text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Nombre del turno */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Nombre del Turno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.turnos}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, turnos: e.target.value }));
                      if (errores.turnos) {
                        setErrores(prev => ({ ...prev, turnos: null }));
                      }
                    }}
                    placeholder="Ej: 8 a 14, Mañana, Tarde, etc."
                    className={`input w-full text-sm sm:text-base ${errores.turnos ? 'border-red-500' : ''}`}
                    maxLength={50}
                    required
                  />
                  {errores.turnos && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errores.turnos}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Puede ser descriptivo o con formato "HH a HH"
                  </p>
                </div>

                {/* Hora inicio */}
                <div>
                  <CustomSelect
                    label="Hora Inicio *"
                    value={formData.horaInicio}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, horaInicio: e.target.value }));
                      if (errores.horaInicio) {
                        setErrores(prev => ({ ...prev, horaInicio: null }));
                      }
                    }}
                    options={Array.from({ length: 24 }, (_, i) => ({
                      value: i.toString(),
                      label: `${String(i).padStart(2, '0')}:00 hs`
                    }))}
                    error={errores.horaInicio}
                    containerClassName="mb-0"
                    className="text-sm sm:text-base"
                  />
                  {errores.horaInicio && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errores.horaInicio}
                    </p>
                  )}
                </div>

                {/* Hora fin */}
                <div>
                  <CustomSelect
                    label="Hora Fin *"
                    value={formData.horaFin}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, horaFin: e.target.value }));
                      if (errores.horaFin) {
                        setErrores(prev => ({ ...prev, horaFin: null }));
                      }
                    }}
                    options={Array.from({ length: 24 }, (_, i) => ({
                      value: i.toString(),
                      label: i === 0 ? '00:00 hs (medianoche)' : `${String(i).padStart(2, '0')}:00 hs`
                    }))}
                    error={errores.horaFin}
                    containerClassName="mb-0"
                    className="text-sm sm:text-base"
                  />
                  {errores.horaFin && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errores.horaFin}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si cruza medianoche (ej: 20 a 02), el sistema lo calcula automáticamente
                  </p>
                </div>

                {/* Horas calculadas */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Total Horas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.horas}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, horas: e.target.value }));
                      if (errores.horas) {
                        setErrores(prev => ({ ...prev, horas: null }));
                      }
                    }}
                    className={`input w-full text-sm sm:text-base bg-gray-50 dark:bg-gray-800 ${errores.horas ? 'border-red-500' : ''}`}
                    min="0"
                    max="24"
                    readOnly
                    required
                  />
                  {errores.horas && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errores.horas}
                    </p>
                  )}
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    ✓ Se calcula automáticamente al seleccionar hora inicio y fin
                  </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <FiSave />
                    <span>{turnoEditando ? 'Actualizar' : 'Crear'} Turno</span>
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
