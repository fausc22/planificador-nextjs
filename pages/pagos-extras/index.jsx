// pages/pagos-extras/index.jsx - Gestión de pagos extras (bonificaciones y deducciones)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FiDollarSign, FiPlus, FiEdit, FiTrash2, FiX, FiTrendingUp, FiTrendingDown, FiUser } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function PagosExtras() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  
  const [empleados, setEmpleados] = useState([]);
  const [extras, setExtras] = useState([]);
  const [totales, setTotales] = useState({ bonificaciones: 0, deducciones: 0, neto: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  
  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [extraEditando, setExtraEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre_empleado: '',
    mes: '',
    detalle: 1, // 1 = Bonificación, 2 = Deducción
    categoria: '',
    monto: '',
    descripcion: ''
  });

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    cargarExtras();
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

  const cargarExtras = async () => {
    setLoading(true);
    try {
      const mesNombre = MESES[mes - 1].toUpperCase();
      const url = `/extras/${anio}/${mesNombre}`;
      
      const params = empleadoSeleccionado ? { nombre_empleado: empleadoSeleccionado } : {};
      
      const response = await apiClient.get(url, { params });
      
      if (response.data.success) {
        setExtras(response.data.extras);
        setTotales(response.data.totales);
      }
    } catch (error) {
      console.error('Error cargando extras:', error);
      toast.error('Error al cargar pagos extras');
      setExtras([]);
      setTotales({ bonificaciones: 0, deducciones: 0, neto: 0 });
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (extra = null) => {
    const mesNombre = MESES[mes - 1].toUpperCase();
    
    if (extra) {
      setExtraEditando(extra);
      setFormData({
        nombre_empleado: extra.nombre_empleado,
        mes: extra.mes,
        detalle: extra.detalle,
        categoria: extra.categoria,
        monto: extra.monto,
        descripcion: extra.descripcion
      });
    } else {
      setExtraEditando(null);
      setFormData({
        nombre_empleado: empleadoSeleccionado || '',
        mes: mesNombre,
        detalle: 1,
        categoria: '',
        monto: '',
        descripcion: ''
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setExtraEditando(null);
    setFormData({
      nombre_empleado: '',
      mes: '',
      detalle: 1,
      categoria: '',
      monto: '',
      descripcion: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre_empleado || !formData.categoria || !formData.monto || !formData.descripcion) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      if (extraEditando) {
        // Actualizar
        await apiClient.put(`/extras/${anio}/${extraEditando.id}`, formData);
        toast.success('Pago extra actualizado exitosamente');
      } else {
        // Crear
        await apiClient.post(`/extras/${anio}`, formData);
        toast.success('Pago extra creado exitosamente');
      }
      
      cerrarModal();
      cargarExtras();
    } catch (error) {
      console.error('Error al guardar pago extra:', error);
      toast.error(error.response?.data?.message || 'Error al guardar pago extra');
    }
  };

  const handleEliminar = async (id, categoria) => {
    if (!confirm(`¿Eliminar el pago extra "${categoria}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/extras/${anio}/${id}`);
      toast.success('Pago extra eliminado exitosamente');
      cargarExtras();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar pago extra');
    }
  };

  const formatearDinero = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(valor || 0);
  };

  if (loadingEmpleados) {
    return <Layout><Loading /></Layout>;
  }

  return (
    <>
      <Head>
        <title>Pagos Extras - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Pagos Extras
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestión de bonificaciones y deducciones
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Nuevo Pago Extra</span>
            </button>
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
          {!loading && extras.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Extras
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {extras.length}
                    </p>
                  </div>
                  <FiDollarSign className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Bonificaciones
                    </p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">
                      {formatearDinero(totales.bonificaciones)}
                    </p>
                  </div>
                  <FiTrendingUp className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Deducciones
                    </p>
                    <p className="text-xl font-bold text-red-900 dark:text-red-100">
                      {formatearDinero(totales.deducciones)}
                    </p>
                  </div>
                  <FiTrendingDown className="text-3xl text-red-500" />
                </div>
              </div>

              <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Neto
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {formatearDinero(totales.neto)}
                    </p>
                  </div>
                  <FiDollarSign className="text-3xl text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Pagos Extras */}
          <div className="card overflow-x-auto">
            {loading ? (
              <Loading />
            ) : extras.length === 0 ? (
              <EmptyState
                icon={FiDollarSign}
                title="No hay pagos extras"
                description="No se encontraron pagos extras para el período seleccionado"
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {extras.map((extra) => (
                    <tr key={extra.id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiUser className="text-gray-400" />
                          <span>{extra.nombre_empleado}</span>
                        </div>
                      </td>
                      <td>
                        {extra.detalle === 1 ? (
                          <span className="badge badge-success inline-flex items-center space-x-1">
                            <FiTrendingUp />
                            <span>Bonificación</span>
                          </span>
                        ) : (
                          <span className="badge badge-danger inline-flex items-center space-x-1">
                            <FiTrendingDown />
                            <span>Deducción</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {extra.categoria}
                        </span>
                      </td>
                      <td>
                        <span className={`font-bold ${extra.detalle === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatearDinero(extra.monto)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {extra.descripcion}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => abrirModal(extra)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleEliminar(extra.id, extra.categoria)}
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
                  {extraEditando ? 'Editar Pago Extra' : 'Nuevo Pago Extra'}
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
                    onChange={(e) => setFormData({ ...formData, nombre_empleado: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Seleccionar empleado...</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={`${emp.nombre} ${emp.apellido}`}>
                        {emp.nombre} {emp.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo (Detalle) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.detalle}
                    onChange={(e) => setFormData({ ...formData, detalle: parseInt(e.target.value) })}
                    className="input w-full"
                    required
                  >
                    <option value={1}>Bonificación (+)</option>
                    <option value={2}>Deducción (-)</option>
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="input w-full"
                    placeholder="Ej: Horas Extras, Premio, Adelanto, etc."
                    required
                  />
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="input w-full"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="input w-full"
                    placeholder="Detalle del pago extra..."
                    rows={3}
                    required
                  />
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {extraEditando ? 'Actualizar' : 'Crear'} Pago Extra
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

