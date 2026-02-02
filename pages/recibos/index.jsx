// pages/recibos/index.jsx - Gestión de recibos de sueldo
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import CustomSelect from '../../components/ui/CustomSelect';
import { FiDollarSign, FiUser, FiEdit2, FiSave, FiX, FiTrendingUp, FiTrendingDown, FiExternalLink, FiDownload, FiLoader } from 'react-icons/fi';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Recibos() {
  const router = useRouter();
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [reciboData, setReciboData] = useState(null);
  
  const [editando, setEditando] = useState({});
  const [valoresTemp, setValoresTemp] = useState({});
  
  // Modal de detalle de extra
  const [modalExtraAbierto, setModalExtraAbierto] = useState(false);
  const [extraSeleccionado, setExtraSeleccionado] = useState(null);
  
  // Estado para loading del PDF
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    cargarEmpleados();
  }, []);

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

  const cargarRecibo = async () => {
    if (!empleadoSeleccionado) {
      toast.error('Selecciona un empleado');
      return;
    }

    setLoading(true);
    try {
      const mesNombre = MESES[mes - 1].toUpperCase();
      const response = await apiClient.get(`/recibos/${empleadoSeleccionado}/${mesNombre}/${anio}/datos`);
      
      if (response.data.success) {
        setReciboData(response.data);
        toast.success(response.data.existe ? 'Recibo cargado' : 'Datos calculados');
      }
    } catch (error) {
      console.error('Error cargando recibo:', error);
      toast.error('Error al cargar recibo');
      setReciboData(null);
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (campo, valorActual) => {
    setEditando({ ...editando, [campo]: true });
    setValoresTemp({ ...valoresTemp, [campo]: valorActual });
  };

  const cancelarEdicion = (campo) => {
    setEditando({ ...editando, [campo]: false });
    setValoresTemp({ ...valoresTemp, [campo]: undefined });
  };

  const guardarCampo = async (campo) => {
    const nuevoValor = valoresTemp[campo];
    
    if (!nuevoValor && nuevoValor !== 0) {
      cancelarEdicion(campo);
      return;
    }

    const nuevoRecibo = {
      ...reciboData.recibo,
      [campo]: parseFloat(nuevoValor)
    };

    try {
      await apiClient.post('/recibos', nuevoRecibo);
      
      setReciboData({
        ...reciboData,
        recibo: nuevoRecibo,
        existe: true
      });
      
      setEditando({ ...editando, [campo]: false });
      toast.success('Campo actualizado');
    } catch (error) {
      console.error('Error guardando campo:', error);
      toast.error('Error al guardar');
    }
  };

  const actualizarConsumos = async (valor) => {
    const nuevoRecibo = {
      ...reciboData.recibo,
      consumos: parseFloat(valor) || 0
    };

    setReciboData({
      ...reciboData,
      recibo: nuevoRecibo
    });
  };

  const guardarRecibo = async () => {
    try {
      await apiClient.post('/recibos', reciboData.recibo);
      setReciboData({ ...reciboData, existe: true });
      toast.success('Recibo guardado exitosamente');
    } catch (error) {
      console.error('Error guardando recibo:', error);
      toast.error('Error al guardar recibo');
    }
  };

  const restablecerRecibo = async () => {
    if (!confirm('¿Estás seguro? Se perderán todos los cambios realizados y se recalcularán los datos desde las tablas originales.')) {
      return;
    }

    setLoading(true);
    try {
      const mesNombre = MESES[mes - 1].toUpperCase();
      const response = await apiClient.post(`/recibos/${empleadoSeleccionado}/${mesNombre}/${anio}/restablecer`);
      
      if (response.data.success) {
        setReciboData(response.data);
        toast.success('Recibo restablecido exitosamente');
      }
    } catch (error) {
      console.error('Error restableciendo recibo:', error);
      toast.error('Error al restablecer recibo');
    } finally {
      setLoading(false);
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

  const calcularDescuento10 = () => {
    const consumos = reciboData?.recibo?.consumos || 0;
    return Math.round(consumos * 0.9 * 100) / 100;
  };

  const calcularTotal = () => {
    const trabajadas = reciboData?.recibo?.hsTrabajadasValor || 0;
    const descuento = calcularDescuento10();
    
    // Sumar bonificaciones y restar deducciones de extras
    const bonificaciones = reciboData?.extras?.suma || 0;
    const deducciones = reciboData?.extras?.resta || 0;
    
    return trabajadas - descuento + bonificaciones - deducciones;
  };

  const abrirDetalleExtra = (extra) => {
    setExtraSeleccionado(extra);
    setModalExtraAbierto(true);
  };

  const irAPagosExtras = () => {
    router.push('/pagos-extras');
  };

  const imprimirPDF = async () => {
    setGenerandoPdf(true);
    try {
      const mesNombre = MESES[mes - 1].toUpperCase();
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/recibos/${empleadoSeleccionado}/${mesNombre}/${anio}/pdf`;
      
      // Obtener el token
      const token = localStorage.getItem('token');
      
      // Crear un fetch para descargar el PDF
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      // Convertir a blob
      const blob = await response.blob();
      
      // Crear URL temporal y descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `RECIBO_${mesNombre}_${empleadoSeleccionado.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar PDF');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const getFotoUrl = (empleado) => {
    if (empleado?.foto_perfil_url) {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '');
      return `${baseUrl}/uploads/empleados/${empleado.foto_perfil_url}`;
    }
    return null;
  };

  if (loadingEmpleados) {
    return <Layout><Loading /></Layout>;
  }

  return (
    <>
      <Head>
        <title>Recibos - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recibos de Sueldo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Generación y gestión de recibos
            </p>
          </div>

          {/* Filtros */}
          <div className="card mb-6">
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
                    { value: '', label: 'Seleccionar empleado...' },
                    ...empleados.map((emp) => ({
                      value: `${emp.nombre} ${emp.apellido}`,
                      label: `${emp.nombre} ${emp.apellido}`
                    }))
                  ]}
                  containerClassName="mb-0"
                />
              </div>
            </div>

            <div className="mt-4">
              <button 
                onClick={cargarRecibo}
                disabled={!empleadoSeleccionado || loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? 'Cargando...' : 'Cargar Recibo'}
              </button>
            </div>
          </div>

          {/* Contenido del Recibo */}
          {loading ? (
            <Loading />
          ) : !reciboData ? (
          <div className="card">
            <div className="text-center py-12">
              <FiDollarSign className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                  Selecciona empleado y período para cargar recibo
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda - Información del Empleado */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiUser className="mr-2" />
                  Información del Empleado
                </h2>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reciboData.empleado.nombre} {reciboData.empleado.apellido}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reciboData.empleado.mail}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Fecha de Ingreso:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reciboData.empleado.fecha_ingreso || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Años de Antigüedad:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reciboData.empleado.antiguedad || 0} años
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Hora Normal:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatearDinero(reciboData.empleado.hora_normal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">Día de Vacaciones:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reciboData.empleado.dia_vacaciones !== null && reciboData.empleado.dia_vacaciones !== undefined 
                        ? reciboData.empleado.dia_vacaciones 
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Foto del Empleado */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex justify-center">
                  {getFotoUrl(reciboData.empleado) ? (
                    <img 
                      src={getFotoUrl(reciboData.empleado)}
                      alt={`${reciboData.empleado.nombre} ${reciboData.empleado.apellido}`}
                      className="w-48 h-48 rounded-lg object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${reciboData.empleado.nombre}+${reciboData.empleado.apellido}&size=400&background=4299E1&color=fff`;
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${reciboData.empleado.nombre}+${reciboData.empleado.apellido}&size=400&background=4299E1&color=fff`}
                      alt={`${reciboData.empleado.nombre} ${reciboData.empleado.apellido}`}
                      className="w-48 h-48 rounded-lg object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
                    />
                  )}
                </div>
              </div>

              {/* Columna Derecha - Datos del Recibo */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FiDollarSign className="mr-2" />
                    Detalle del Recibo
                  </h2>
                  <button
                    onClick={imprimirPDF}
                    disabled={generandoPdf}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center"
                  >
                    {generandoPdf ? (
                      <>
                        <FiLoader className="animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload />
                        <span>Imprimir PDF</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Horas Planificadas */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
                      Horas Planificadas
                    </h3>
                    
                    {['hsPlaniCantidad', 'hsPlaniValor'].map((campo) => {
                      const label = campo === 'hsPlaniCantidad' ? 'Cantidad de Horas' : 'Valor';
                      const valor = reciboData.recibo[campo];
                      
                      return (
                        <div key={campo} className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{label}:</span>
                          {editando[campo] ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={valoresTemp[campo]}
                                onChange={(e) => setValoresTemp({ ...valoresTemp, [campo]: e.target.value })}
                                className="input w-32 text-sm"
                              />
                              <button onClick={() => guardarCampo(campo)} className="text-green-600 hover:text-green-700">
                                <FiSave />
                              </button>
                              <button onClick={() => cancelarEdicion(campo)} className="text-red-600 hover:text-red-700">
                                <FiX />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {campo.includes('Valor') ? formatearDinero(valor) : `${valor} hs`}
                              </span>
                              <button 
                                onClick={() => iniciarEdicion(campo, valor)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <FiEdit2 className="text-sm" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Horas Trabajadas */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-3">
                      Horas Trabajadas
                    </h3>
                    
                    {['hsTrabajadasCantidad', 'hsTrabajadasValor'].map((campo) => {
                      const label = campo === 'hsTrabajadasCantidad' ? 'Cantidad de Horas' : 'Valor';
                      const valor = reciboData.recibo[campo];
                      
                      return (
                        <div key={campo} className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{label}:</span>
                          {editando[campo] ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={valoresTemp[campo]}
                                onChange={(e) => setValoresTemp({ ...valoresTemp, [campo]: e.target.value })}
                                className="input w-32 text-sm"
                              />
                              <button onClick={() => guardarCampo(campo)} className="text-green-600 hover:text-green-700">
                                <FiSave />
                              </button>
                              <button onClick={() => cancelarEdicion(campo)} className="text-red-600 hover:text-red-700">
                                <FiX />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {campo.includes('Valor') ? formatearDinero(valor) : `${valor} hs`}
                              </span>
                              <button 
                                onClick={() => iniciarEdicion(campo, valor)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <FiEdit2 className="text-sm" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Consumos */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3">
                      Descuentos Manuales
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Consumos:
                        </label>
                        <input
                          type="number"
                          value={reciboData.recibo.consumos || 0}
                          onChange={(e) => actualizarConsumos(e.target.value)}
                          className="input w-full"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Descuento 10%:
                        </label>
                        <input
                          type="text"
                          value={formatearDinero(calcularDescuento10())}
                          disabled
                          className="input w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bonificaciones y Deducciones de Extras */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Bonificaciones */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="text-xs font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
                        <FiTrendingUp className="mr-1" />
                        Bonificaciones
                      </h4>
                      {reciboData.extras?.items?.filter(e => e.detalle === 1).length > 0 ? (
                        <div className="space-y-1">
                          {reciboData.extras.items.filter(e => e.detalle === 1).map((extra) => (
                            <button
                              key={extra.id}
                              onClick={() => abrirDetalleExtra(extra)}
                              className="w-full text-left hover:bg-green-100 dark:hover:bg-green-900/30 p-2 rounded transition-colors"
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 dark:text-gray-300 truncate">
                                  {extra.categoria}
                                </span>
                                <span className="font-bold text-green-700 dark:text-green-400 ml-2">
                                  {formatearDinero(extra.monto)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sin bonificaciones</p>
                      )}
                    </div>

                    {/* Deducciones */}
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center">
                        <FiTrendingDown className="mr-1" />
                        Deducciones
                      </h4>
                      {reciboData.extras?.items?.filter(e => e.detalle === 2).length > 0 ? (
                        <div className="space-y-1">
                          {reciboData.extras.items.filter(e => e.detalle === 2).map((extra) => (
                            <button
                              key={extra.id}
                              onClick={() => abrirDetalleExtra(extra)}
                              className="w-full text-left hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded transition-colors"
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 dark:text-gray-300 truncate">
                                  {extra.categoria}
                                </span>
                                <span className="font-bold text-red-700 dark:text-red-400 ml-2">
                                  {formatearDinero(extra.monto)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sin deducciones</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-purple-900 dark:text-purple-200">
                        TOTAL:
                      </span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatearDinero(calcularTotal())}
                      </span>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="space-y-3">
                    <button 
                      onClick={guardarRecibo}
                      className="btn-primary w-full py-3"
                    >
                      {reciboData.existe ? 'Actualizar Recibo' : 'Guardar Recibo'}
                    </button>

                    {reciboData.existe && (
                      <button 
                        onClick={restablecerRecibo}
                        className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Restablecer Recibo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalle de Extra */}
        {modalExtraAbierto && extraSeleccionado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-lg w-full">
              {/* Header del Modal */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  {extraSeleccionado.detalle === 1 ? (
                    <FiTrendingUp className="text-green-500 mr-2" />
                  ) : (
                    <FiTrendingDown className="text-red-500 mr-2" />
                  )}
                  Detalle del Pago Extra
                </h2>
                <button
                  onClick={() => setModalExtraAbierto(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-ternary-dark rounded-lg transition-colors"
                >
                  <FiX className="text-2xl text-gray-500" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Empleado:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {extraSeleccionado.nombre_empleado}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span className={`font-semibold ${extraSeleccionado.detalle === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {extraSeleccionado.detalle === 1 ? 'Bonificación' : 'Deducción'}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categoría:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {extraSeleccionado.categoria}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monto:</span>
                    <span className={`text-lg font-bold ${extraSeleccionado.detalle === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatearDinero(extraSeleccionado.monto)}
                    </span>
                  </div>

                  <div className="py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Descripción:</span>
                    <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-3 rounded">
                      {extraSeleccionado.descripcion}
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={irAPagosExtras}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <FiExternalLink />
                    <span>Ir a Pagos Extras</span>
                  </button>
                  <button
                    onClick={() => setModalExtraAbierto(false)}
                    className="btn-secondary flex-1"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}

