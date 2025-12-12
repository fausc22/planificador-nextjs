// pages/pagos-extras/index.jsx - Gestión de pagos extras (bonificaciones y deducciones)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CustomSelect from '../../components/ui/CustomSelect';
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
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [extraEliminar, setExtraEliminar] = useState(null);
  const [extraEditando, setExtraEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre_empleado: '',
    mes: '',
    detalle: 1, // 1 = Bonificación, 2 = Deducción
    categoria: '',
    monto: '',
    descripcion: ''
  });
  const [errores, setErrores] = useState({});

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
    setErrores({});
    setFormData({
      nombre_empleado: '',
      mes: '',
      detalle: 1,
      categoria: '',
      monto: '',
      descripcion: ''
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre_empleado || formData.nombre_empleado.trim() === '') {
      nuevosErrores.nombre_empleado = 'El empleado es obligatorio';
    }

    if (!formData.categoria || formData.categoria.trim() === '') {
      nuevosErrores.categoria = 'La categoría es obligatoria';
    } else if (formData.categoria.trim().length < 2) {
      nuevosErrores.categoria = 'La categoría debe tener al menos 2 caracteres';
    }

    if (!formData.monto || formData.monto === '') {
      nuevosErrores.monto = 'El monto es obligatorio';
    } else {
      const montoNum = parseFloat(formData.monto);
      if (isNaN(montoNum) || montoNum <= 0) {
        nuevosErrores.monto = 'El monto debe ser un número positivo';
      }
    }

    if (!formData.descripcion || formData.descripcion.trim() === '') {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 3) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 3 caracteres';
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
      // Preparar datos para enviar
      const datosEnviar = {
        ...formData,
        monto: parseFloat(formData.monto)
      };

      if (extraEditando) {
        // Actualizar
        await apiClient.put(`/extras/${anio}/${extraEditando.id}`, datosEnviar);
        toast.success('Pago extra actualizado exitosamente');
      } else {
        // Crear
        await apiClient.post(`/extras/${anio}`, datosEnviar);
        toast.success('Pago extra creado exitosamente');
      }
      
      cerrarModal();
      cargarExtras();
    } catch (error) {
      console.error('Error al guardar pago extra:', error);
      
      // Manejar errores de validación del backend
      if (error.response?.data?.errors) {
        const erroresBackend = {};
        error.response.data.errors.forEach(err => {
          erroresBackend[err.field] = err.message;
        });
        setErrores(erroresBackend);
      }
      
      toast.error(error.response?.data?.message || 'Error al guardar pago extra');
    }
  };

  const abrirModalEliminar = (extra) => {
    setExtraEliminar(extra);
    setModalEliminarAbierto(true);
  };

  const cerrarModalEliminar = () => {
    setModalEliminarAbierto(false);
    setExtraEliminar(null);
  };

  const handleEliminar = async () => {
    if (!extraEliminar) return;

    try {
      await apiClient.delete(`/extras/${anio}/${extraEliminar.id}`);
      toast.success('Pago extra eliminado exitosamente');
      cerrarModalEliminar();
      cargarExtras();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar pago extra');
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
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Pagos Extras
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Gestión de bonificaciones y deducciones
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <FiPlus />
              <span className="sm:inline">Nuevo Pago Extra</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="card mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <CustomSelect
                  label="Año"
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value))}
                  options={[2024, 2025, 2026].map(a => ({
                    value: a,
                    label: a.toString()
                  }))}
                  containerClassName="mb-0"
                />
              </div>

              <div>
                <CustomSelect
                  label="Mes"
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  options={MESES.map((m, idx) => ({
                    value: idx + 1,
                    label: m
                  }))}
                  containerClassName="mb-0"
                />
              </div>

              <div>
                <CustomSelect
                  label="Empleado"
                  value={empleadoSeleccionado}
                  onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                  options={[
                    { value: '', label: 'Todos los empleados' },
                    ...empleados.map((emp) => ({
                      value: `${emp.nombre} ${emp.apellido}`,
                      label: `${emp.nombre} ${emp.apellido}`
                    }))
                  ]}
                  containerClassName="mb-0"
                />
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
          <div className="card">
            {loading ? (
              <Loading />
            ) : extras.length === 0 ? (
              <EmptyState
                icon={FiDollarSign}
                title="No hay pagos extras"
                description="No se encontraron pagos extras para el período seleccionado"
              />
            ) : (
              <>
                {/* Vista desktop - Tabla */}
                <div className="hidden md:block overflow-x-auto">
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
                                onClick={() => abrirModalEliminar(extra)}
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
                  {extras.map((extra) => (
                    <div 
                      key={extra.id} 
                      className={`border-2 rounded-lg p-4 ${
                        extra.detalle === 1 
                          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                          : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiUser className="text-gray-400 flex-shrink-0" />
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                              {extra.nombre_empleado}
                            </h3>
                          </div>
                          <div className="mb-2">
                            {extra.detalle === 1 ? (
                              <span className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <FiTrendingUp className="text-xs" />
                                <span>Bonificación</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                <FiTrendingDown className="text-xs" />
                                <span>Deducción</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => abrirModal(extra)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => abrirModalEliminar(extra)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {extra.categoria}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                          <span className={`font-bold text-lg ${extra.detalle === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatearDinero(extra.monto)}
                          </span>
                        </div>
                        {extra.descripcion && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              {extra.descripcion}
                            </p>
                          </div>
                        )}
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
                  <CustomSelect
                    label="Empleado"
                    required
                    value={formData.nombre_empleado}
                    onChange={(e) => {
                      setFormData({ ...formData, nombre_empleado: e.target.value });
                      if (errores.nombre_empleado) {
                        setErrores({ ...errores, nombre_empleado: null });
                      }
                    }}
                    options={[
                      { value: '', label: 'Seleccionar empleado...' },
                      ...empleados.map((emp) => ({
                        value: `${emp.nombre} ${emp.apellido}`,
                        label: `${emp.nombre} ${emp.apellido}`
                      }))
                    ]}
                    error={errores.nombre_empleado}
                    containerClassName="mb-0"
                  />
                </div>

                {/* Tipo (Detalle) */}
                <div>
                  <CustomSelect
                    label="Tipo"
                    required
                    value={formData.detalle}
                    onChange={(e) => setFormData({ ...formData, detalle: parseInt(e.target.value) })}
                    options={[
                      { value: 1, label: 'Bonificación (+)' },
                      { value: 2, label: 'Deducción (-)' }
                    ]}
                    containerClassName="mb-0"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => {
                      setFormData({ ...formData, categoria: e.target.value });
                      if (errores.categoria) {
                        setErrores({ ...errores, categoria: null });
                      }
                    }}
                    className={`input w-full ${errores.categoria ? 'border-red-500' : ''}`}
                    placeholder="Ej: Horas Extras, Premio, Adelanto, etc."
                    required
                  />
                  {errores.categoria && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.categoria}</p>
                  )}
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.monto}
                    onChange={(e) => {
                      setFormData({ ...formData, monto: e.target.value });
                      if (errores.monto) {
                        setErrores({ ...errores, monto: null });
                      }
                    }}
                    className={`input w-full ${errores.monto ? 'border-red-500' : ''}`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                  {errores.monto && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.monto}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => {
                      setFormData({ ...formData, descripcion: e.target.value });
                      if (errores.descripcion) {
                        setErrores({ ...errores, descripcion: null });
                      }
                    }}
                    className={`input w-full ${errores.descripcion ? 'border-red-500' : ''}`}
                    placeholder="Detalle del pago extra..."
                    rows={3}
                    required
                  />
                  {errores.descripcion && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.descripcion}</p>
                  )}
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

        {/* Modal de Confirmación de Eliminación */}
        {modalEliminarAbierto && extraEliminar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-md w-full">
              {/* Header del Modal */}
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

              {/* Contenido */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  ¿Estás seguro de que deseas eliminar este pago extra?
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Empleado:</span> {extraEliminar.nombre_empleado}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Categoría:</span> {extraEliminar.categoria}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Monto:</span> {formatearDinero(extraEliminar.monto)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Tipo:</span>{' '}
                    {extraEliminar.detalle === 1 ? (
                      <span className="text-green-600 dark:text-green-400">Bonificación</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Deducción</span>
                    )}
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Esta acción no se puede deshacer.
                </p>
              </div>

              {/* Botones */}
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

