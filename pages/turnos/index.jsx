// pages/turnos/index.jsx - Gestión completa de turnos/horarios
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { turnosAPI } from '../../utils/api';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiX, FiSave } from 'react-icons/fi';
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
    setFormData({
      turnos: '',
      horaInicio: '',
      horaFin: '',
      horas: ''
    });
  };

  const calcularHoras = () => {
    const { horaInicio, horaFin } = formData;
    if (horaInicio === '' || horaFin === '') return;

    const inicio = parseInt(horaInicio);
    const fin = parseInt(horaFin);
    
    let horas = fin - inicio;
    if (horas < 0) {
      horas = 24 + horas; // Turno que cruza medianoche
    }
    
    setFormData(prev => ({ ...prev, horas }));
  };

  useEffect(() => {
    if (formData.horaInicio !== '' && formData.horaFin !== '') {
      calcularHoras();
    }
  }, [formData.horaInicio, formData.horaFin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.turnos || formData.horaInicio === '' || formData.horaFin === '' || !formData.horas) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      if (turnoEditando) {
        // Actualizar
        await turnosAPI.actualizar(turnoEditando.id, formData);
        toast.success('Turno actualizado exitosamente');
      } else {
        // Crear
        await turnosAPI.crear(formData);
        toast.success('Turno creado exitosamente');
      }
      
      cerrarModal();
      cargarTurnos();
    } catch (error) {
      console.error('Error al guardar turno:', error);
      toast.error(error.response?.data?.message || 'Error al guardar turno');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar el turno "${nombre}"?\n\nEsto no afectará los turnos ya asignados a empleados.`)) {
      return;
    }

    try {
      await turnosAPI.eliminar(id);
      toast.success('Turno eliminado exitosamente');
      cargarTurnos();
    } catch (error) {
      toast.error('Error al eliminar turno');
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Turnos y Horarios
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configuración de jornadas laborales
              </p>
            </div>

            <button
              className="btn-primary flex items-center space-x-2"
              onClick={() => abrirModal()}
            >
              <FiPlus />
              <span>Nuevo Turno</span>
            </button>
          </div>

          {/* Tabla de turnos */}
          <div className="card">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="spinner"></div>
              </div>
            ) : turnos.length === 0 ? (
              <div className="text-center py-12">
                <FiClock className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No hay turnos configurados
                </p>
                <button
                  onClick={() => abrirModal()}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <FiPlus />
                  <span>Crear Primer Turno</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
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
                          {turno.horaInicio}:00 hs
                        </td>
                        <td className="text-center">
                          {turno.horaFin === 0 ? '00:00 hs' : `${turno.horaFin}:00 hs`}
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
                              onClick={() => handleEliminar(turno.id, turno.turnos)}
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
            )}

            {/* Resumen */}
            {!loading && turnos.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{turnos.length}</strong> turnos configurados
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {turnoEditando ? 'Editar Turno' : 'Nuevo Turno'}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del turno */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Nombre del Turno
                  </label>
                  <input
                    type="text"
                    value={formData.turnos}
                    onChange={(e) => setFormData(prev => ({ ...prev, turnos: e.target.value }))}
                    placeholder="Ej: 8 a 14"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Puede ser descriptivo o con formato "HH a HH"
                  </p>
                </div>

                {/* Hora inicio */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Hora Inicio
                  </label>
                  <select
                    value={formData.horaInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}:00 hs
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hora fin */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Hora Fin
                  </label>
                  <select
                    value={formData.horaFin}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaFin: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '00:00 hs (medianoche)' : `${i}:00 hs`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si cruza medianoche (ej: 20 a 02), el sistema lo calcula automáticamente
                  </p>
                </div>

                {/* Horas calculadas */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Total Horas
                  </label>
                  <input
                    type="number"
                    value={formData.horas}
                    onChange={(e) => setFormData(prev => ({ ...prev, horas: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                    min="0"
                    max="24"
                    required
                  />
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    Se calcula automáticamente al seleccionar horas
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
                  >
                    <FiSave />
                    <span>{turnoEditando ? 'Actualizar' : 'Crear'}</span>
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
