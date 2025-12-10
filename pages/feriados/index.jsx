// pages/feriados/index.jsx - Gestión de feriados
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Select from '../../components/ui/Select';
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
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
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
              className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <FiPlus />
              <span>Nuevo Feriado</span>
            </button>
          </div>

          {/* Filtro por Año */}
          <div className="card mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Total Feriados
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {feriados.length}
                    </p>
                  </div>
                  <FiStar className="text-3xl text-purple-500" />
                </div>
              </div>

              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Año
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {anioFiltro}
                    </p>
                  </div>
                  <FiCalendar className="text-3xl text-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Feriados */}
          <div className="card overflow-x-auto">
            {loading ? (
              <Loading />
            ) : feriados.length === 0 ? (
              <EmptyState
                icon={FiStar}
                title="No hay feriados"
                description={`No se encontraron feriados para el año ${anioFiltro}`}
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Festejo</th>
                    <th>Día</th>
                    <th>Período</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {feriados.map((feriado) => (
                    <tr key={feriado.id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-purple-500" />
                          <span className="font-medium">{feriado.fecha}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {feriado.festejo}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {feriado.dia}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feriado.periodo || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => abrirModal(feriado)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleEliminar(feriado.id, feriado.festejo)}
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
                  {feriadoEditando ? 'Editar Feriado' : 'Nuevo Feriado'}
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
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="input w-full"
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
                    className="input w-full"
                    placeholder="Ej: Navidad, Año Nuevo, Día del Trabajador"
                    required
                  />
                </div>

                {/* Día */}
                <div>
                  <Select
                    label="Día de la Semana"
                    value={formData.dia}
                    onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                    options={[
                      { value: '', label: 'Seleccionar día...' },
                      { value: 'Lunes', label: 'Lunes' },
                      { value: 'Martes', label: 'Martes' },
                      { value: 'Miércoles', label: 'Miércoles' },
                      { value: 'Jueves', label: 'Jueves' },
                      { value: 'Viernes', label: 'Viernes' },
                      { value: 'Sábado', label: 'Sábado' },
                      { value: 'Domingo', label: 'Domingo' }
                    ]}
                    required
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
                    className="input w-full"
                    placeholder="Se extraerá automáticamente de la fecha"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si no se ingresa, se tomará el año de la fecha
                  </p>
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {feriadoEditando ? 'Actualizar' : 'Crear'} Feriado
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

