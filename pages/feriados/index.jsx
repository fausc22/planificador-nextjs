// pages/feriados/index.jsx - Gestión de feriados
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CustomSelect from '../../components/ui/CustomSelect';
import { FiStar, FiPlus, FiEdit, FiTrash2, FiX, FiCalendar } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Feriados() {
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [feriados, setFeriados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [feriadoEditando, setFeriadoEditando] = useState(null);
  const [formData, setFormData] = useState({
    fecha: '',
    festejo: '',
    dia: '',
    periodo: ''
  });

  useEffect(() => {
    cargarFeriados();
  }, [anioFiltro]);

  const cargarFeriados = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/feriados/periodo/${anioFiltro}`);
      
      if (response.data.success) {
        setFeriados(response.data.feriados);
      }
    } catch (error) {
      console.error('Error cargando feriados:', error);
      toast.error('Error al cargar feriados');
      setFeriados([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (feriado = null) => {
    if (feriado) {
      setFeriadoEditando(feriado);
      setFormData({
        fecha: feriado.fecha,
        festejo: feriado.festejo,
        dia: feriado.dia,
        periodo: feriado.periodo || anioFiltro
      });
    } else {
      setFeriadoEditando(null);
      setFormData({
        fecha: '',
        festejo: '',
        dia: '',
        periodo: anioFiltro
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFeriadoEditando(null);
    setFormData({
      fecha: '',
      festejo: '',
      dia: '',
      periodo: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.festejo || !formData.dia) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      if (feriadoEditando) {
        // Actualizar
        await apiClient.put(`/feriados/${feriadoEditando.id}`, formData);
        toast.success('Feriado actualizado exitosamente');
      } else {
        // Crear
        await apiClient.post('/feriados', formData);
        toast.success('Feriado creado exitosamente');
      }
      
      cerrarModal();
      cargarFeriados();
    } catch (error) {
      console.error('Error al guardar feriado:', error);
      toast.error(error.response?.data?.message || 'Error al guardar feriado');
    }
  };

  const handleEliminar = async (id, festejo) => {
    if (!confirm(`¿Eliminar el feriado "${festejo}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/feriados/${id}`);
      toast.success('Feriado eliminado exitosamente');
      cargarFeriados();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar feriado');
    }
  };

  return (
    <>
      <Head>
        <title>Feriados - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Feriados
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Gestión de días feriados y no laborables
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <FiPlus />
              <span className="hidden sm:inline">Nuevo Feriado</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Filtro por Año */}
          <div className="card mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <CustomSelect
                  label="Filtrar por Año"
                  value={anioFiltro}
                  onChange={(e) => setAnioFiltro(parseInt(e.target.value))}
                  options={[2024, 2025, 2026, 2027].map(a => ({
                    value: a,
                    label: a.toString()
                  }))}
                  containerClassName="mb-0"
                />
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {!loading && feriados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Total Feriados
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                      {feriados.length}
                    </p>
                  </div>
                  <FiStar className="text-2xl sm:text-3xl text-purple-500" />
                </div>
              </div>

              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Año Seleccionado
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                      {anioFiltro}
                    </p>
                  </div>
                  <FiCalendar className="text-2xl sm:text-3xl text-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Feriados */}
          <div className="card">
            {loading ? (
              <Loading />
            ) : feriados.length === 0 ? (
              <EmptyState
                icon={FiStar}
                title="No hay feriados"
                description={`No se encontraron feriados para el año ${anioFiltro}`}
              />
            ) : (
              <>
                {/* Vista Desktop - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Festejo</th>
                        <th className="text-center">Día</th>
                        <th className="text-center">Período</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feriados.map((feriado) => (
                        <tr key={feriado.id}>
                          <td>
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="text-purple-500 flex-shrink-0" />
                              <span className="font-medium">{feriado.fecha}</span>
                            </div>
                          </td>
                          <td>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {feriado.festejo}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {feriado.dia}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {feriado.periodo || anioFiltro}
                            </span>
                          </td>
                          <td>
                            <div className="flex justify-end items-center space-x-2">
                              <button
                                onClick={() => abrirModal(feriado)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleEliminar(feriado.id, feriado.festejo)}
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

                {/* Vista Mobile - Cards */}
                <div className="md:hidden space-y-3">
                  {feriados.map((feriado) => (
                    <div
                      key={feriado.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiCalendar className="text-purple-500 flex-shrink-0" size={18} />
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {feriado.fecha}
                            </h3>
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {feriado.festejo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {feriado.dia}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {feriado.periodo || anioFiltro}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModal(feriado)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminar(feriado.id, feriado.festejo)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal de Crear/Editar */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-2xl w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {feriadoEditando ? 'Editar Feriado' : 'Nuevo Feriado'}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-ternary-dark rounded-lg transition-colors"
                >
                  <FiX className="text-lg sm:text-2xl text-gray-500" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="input w-full text-sm sm:text-base"
                    placeholder="DD/MM/YYYY"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Formato: DD/MM/YYYY (ejemplo: 25/12/2025)
                  </p>
                </div>

                {/* Festejo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Festejo/Motivo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.festejo}
                    onChange={(e) => setFormData({ ...formData, festejo: e.target.value })}
                    className="input w-full text-sm sm:text-base"
                    placeholder="Ej: Navidad, Año Nuevo, Día del Trabajador"
                    required
                  />
                </div>

                {/* Día */}
                <div>
                  <CustomSelect
                    label="Día de la Semana *"
                    value={formData.dia}
                    onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                    options={[
                      { value: 'Lunes', label: 'Lunes' },
                      { value: 'Martes', label: 'Martes' },
                      { value: 'Miércoles', label: 'Miércoles' },
                      { value: 'Jueves', label: 'Jueves' },
                      { value: 'Viernes', label: 'Viernes' },
                      { value: 'Sábado', label: 'Sábado' },
                      { value: 'Domingo', label: 'Domingo' }
                    ]}
                    containerClassName="mb-0"
                  />
                </div>

                {/* Período (Año) - Opcional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período/Año
                  </label>
                  <input
                    type="text"
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    className="input w-full text-sm sm:text-base"
                    placeholder="Se extraerá automáticamente de la fecha"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si no se ingresa, se tomará el año de la fecha
                  </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1 text-sm sm:text-base py-2 sm:py-3"
                  >
                    {feriadoEditando ? 'Actualizar' : 'Crear'} Feriado
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-3"
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

