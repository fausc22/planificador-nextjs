// pages/planificador/index.jsx - Vista principal del planificador OPTIMIZADO MÓVIL
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { planificadorAPI, turnosAPI } from '../../utils/api';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiEdit2, FiSave, FiX, FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ShiftSelector from '../../components/ShiftSelector';
import WeeklyView from '../../components/WeeklyView';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const VISTAS = {
  TURNOS: 'turnos',
  HORAS: 'horas',
  DINERO: 'acumulado',
  SEMANAL: 'semanal'
};

export default function Planificador() {
  const fechaActual = new Date();
  const [mesActual, setMesActual] = useState(fechaActual.getMonth() + 1);
  const [anioActual, setAnioActual] = useState(fechaActual.getFullYear());
  const [vistaActual, setVistaActual] = useState(VISTAS.TURNOS);
  const [planificador, setPlanificador] = useState(null);
  const [totales, setTotales] = useState(null);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('');
  const [empleadoSeleccionadoMovil, setEmpleadoSeleccionadoMovil] = useState(null);
  const [vistaMobile, setVistaMobile] = useState(false);

  // Modal PDF
  const [modalPdfAbierto, setModalPdfAbierto] = useState(false);
  const [coloresEmpleados, setColoresEmpleados] = useState({});
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [empleadoParaPdf, setEmpleadoParaPdf] = useState('todos');

  useEffect(() => {
    cargarDatos();
    cargarTurnosDisponibles();
    detectarMobile();
  }, [mesActual, anioActual, vistaActual]);

  useEffect(() => {
    // Seleccionar primer empleado en móvil
    if (vistaMobile && planificador?.empleados?.length > 0 && !empleadoSeleccionadoMovil) {
      setEmpleadoSeleccionadoMovil(planificador.empleados[0]);
    }

    // Inicializar colores por defecto para empleados
    if (planificador?.empleados && Object.keys(coloresEmpleados).length === 0) {
      const coloresDefault = {};
      const coloresPredefinidos = ['#E3F2FD', '#FFF3E0', '#F3E5F5', '#E8F5E9', '#FFF9C4', '#FFE0B2'];
      planificador.empleados.forEach((emp, idx) => {
        coloresDefault[emp] = coloresPredefinidos[idx % coloresPredefinidos.length];
      });
      setColoresEmpleados(coloresDefault);
    }
  }, [planificador, vistaMobile]);

  const detectarMobile = () => {
    const isMobile = window.innerWidth < 768;
    setVistaMobile(isMobile);

    window.addEventListener('resize', () => {
      setVistaMobile(window.innerWidth < 768);
    });
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      let respPlanificador;

      if (vistaActual === VISTAS.HORAS) {
        respPlanificador = await planificadorAPI.cargarPlanificador(mesActual, anioActual);
      } else if (vistaActual === VISTAS.DINERO) {
        respPlanificador = await planificadorAPI.cargarPlanificadorDetallado(mesActual, anioActual, 'acumulado');
      } else {
        respPlanificador = await planificadorAPI.cargarPlanificador(mesActual, anioActual);
      }

      if (respPlanificador.data.success) {
        setPlanificador(respPlanificador.data);
      }

      if (vistaActual === VISTAS.HORAS || vistaActual === VISTAS.DINERO) {
        const campo = vistaActual === VISTAS.HORAS ? 'horas' : 'acumulado';
        const respTotales = await planificadorAPI.cargarTotales(mesActual, anioActual, campo);

        if (respTotales.data.success) {
          setTotales(respTotales.data.totales);
        }
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar planificador');
    } finally {
      setLoading(false);
    }
  };

  const cargarTurnosDisponibles = async () => {
    try {
      const response = await turnosAPI.obtenerTodos();
      if (response.data.success) {
        setTurnosDisponibles(response.data.turnos);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  };

  const cambiarMes = (direccion) => {
    let nuevoMes = mesActual + direccion;
    let nuevoAnio = anioActual;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAnio++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAnio--;
    }

    setMesActual(nuevoMes);
    setAnioActual(nuevoAnio);
    setEditando(null);
  };

  const iniciarEdicion = (fecha, empleado, turnoActual) => {
    if (vistaActual !== VISTAS.TURNOS && vistaActual !== VISTAS.SEMANAL) return;

    setEditando({ fecha, empleado });
    setTurnoSeleccionado(turnoActual || 'Libre');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setTurnoSeleccionado('');
  };

  const seleccionarTurnoVisual = (turno) => {
    setTurnoSeleccionado(turno);
    // Guardar automáticamente al seleccionar en el selector visual
    guardarTurno(turno);
  };

  const guardarTurno = async (turnoOverride = null) => {
    if (!editando) return;

    try {
      const { fecha, empleado } = editando;
      const turnoAGuardar = turnoOverride || turnoSeleccionado;

      const response = await planificadorAPI.actualizarTurno(mesActual, anioActual, {
        fecha,
        nombreEmpleado: empleado,
        turno: turnoAGuardar
      });

      if (response.data.success) {
        toast.success('Turno actualizado');
        cancelarEdicion();
        cargarDatos();
      }
    } catch (error) {
      console.error('Error al guardar turno:', error);
      toast.error('Error al actualizar turno');
    }
  };

  const getValorCelda = (fecha, empleado) => {
    if (!planificador?.fechas) return null;

    const fechaData = planificador.fechas.find(f => f.fecha === fecha);
    if (!fechaData) return null;

    switch (vistaActual) {
      case VISTAS.TURNOS:
        return fechaData.empleados[empleado] || 'Libre';

      case VISTAS.HORAS:
        const turno = fechaData.empleados[empleado];
        const turnoInfo = turnosDisponibles.find(t => t.turnos === turno);
        return turnoInfo ? turnoInfo.horas : 0;

      case VISTAS.DINERO:
        return fechaData.empleados[empleado] || 0;

      default:
        return null;
    }
  };

  const getTotalEmpleado = (empleado) => {
    if (vistaActual === VISTAS.TURNOS) return null;
    if (!totales) return 0;
    return totales[empleado] || 0;
  };

  const getTurnoClass = (turno) => {
    if (!turno || turno === 'Libre') return 'turno-libre';
    if (typeof turno !== 'string') return 'bg-gray-100 dark:bg-gray-800';

    const turnoLower = turno.toLowerCase();
    if (turnoLower.includes('vacacion')) return 'turno-vacaciones';
    if (turnoLower.includes('guardia')) return 'turno-guardia';

    if (turnoLower.match(/^\d+\s*a\s*\d+$/)) {
      const horaInicio = parseInt(turnoLower.split('a')[0]);
      if (horaInicio >= 6 && horaInicio < 12) return 'turno-manana';
      if (horaInicio >= 12 && horaInicio < 18) return 'turno-tarde';
      if (horaInicio >= 18 || horaInicio < 6) return 'turno-noche';
    }

    return 'turno-default';
  };

  const empleadosFiltrados = vistaMobile && empleadoSeleccionadoMovil
    ? [empleadoSeleccionadoMovil]
    : (planificador?.empleados || []);

  const abrirModalPdf = () => {
    setModalPdfAbierto(true);
  };

  const cerrarModalPdf = () => {
    setModalPdfAbierto(false);
  };

  const generarPdf = async () => {
    try {
      setGenerandoPdf(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planeamiento/pdf/${mesActual}/${anioActual}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          colores: coloresEmpleados,
          empleado: empleadoParaPdf
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Planificador_${MESES[mesActual - 1]}_${anioActual}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF descargado exitosamente');
      cerrarModalPdf();
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al generar PDF');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <>
      <Head>
        <title>Planificador - {MESES[mesActual - 1]} {anioActual}</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="card mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Planificador
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gestión de turnos mensuales
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => cambiarMes(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
                    disabled={loading}
                    title="Mes anterior"
                  >
                    <FiChevronLeft className="text-xl" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Selector de Mes */}
                    <select
                      value={mesActual}
                      onChange={(e) => {
                        setMesActual(parseInt(e.target.value));
                        setEditando(null);
                      }}
                      disabled={loading}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                    >
                      {MESES.map((mes, idx) => (
                        <option key={idx} value={idx + 1}>
                          {mes}
                        </option>
                      ))}
                    </select>

                    {/* Selector de Año */}
                    <select
                      value={anioActual}
                      onChange={(e) => {
                        setAnioActual(parseInt(e.target.value));
                        setEditando(null);
                      }}
                      disabled={loading}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                    >
                      {Array.from({ length: 11 }, (_, i) => 2020 + i).map((anio) => (
                        <option key={anio} value={anio}>
                          {anio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => cambiarMes(1)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
                    disabled={loading}
                    title="Mes siguiente"
                  >
                    <FiChevronRight className="text-xl" />
                  </button>

                  <button
                    onClick={cargarDatos}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
                    disabled={loading}
                    title="Recargar"
                  >
                    <FiRefreshCw className={`text-xl ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tabs de vistas */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setVistaActual(VISTAS.TURNOS)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${vistaActual === VISTAS.TURNOS
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  📅 Turnos
                </button>
                <button
                  onClick={() => setVistaActual(VISTAS.HORAS)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${vistaActual === VISTAS.HORAS
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  ⏱️ Horas
                </button>
                <button
                  onClick={() => setVistaActual(VISTAS.DINERO)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${vistaActual === VISTAS.DINERO
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  💰 Dinero
                </button>
                <button
                  onClick={() => setVistaActual(VISTAS.SEMANAL)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${vistaActual === VISTAS.SEMANAL
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  📅 Semanal
                </button>
              </div>
            </div>
          </div>

          {/* Leyenda arriba */}
          {vistaActual === VISTAS.TURNOS && planificador && (
            <div className="card mb-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Leyenda de Turnos:
                </h3>
                <button
                  onClick={abrirModalPdf}
                  className="btn-primary flex items-center gap-2 text-sm py-2"
                >
                  <FiDownload size={16} />
                  Descargar PDF
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Libre</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Mañana (6-12h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900 border border-orange-300 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Tarde (12-18h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900 border border-purple-300 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Noche (18h+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-300 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Vacaciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-900 border border-indigo-300 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Guardia</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 <strong>Tip:</strong> Clic en celda para editar. Feriados (fondo rojo) pagan doble.
                </p>
              </div>
            </div>
          )}

          {/* Vista Semanal */}
          {vistaActual === VISTAS.SEMANAL && (
            <div className="mb-6">
              <WeeklyView
                planificador={planificador}
                mes={mesActual}
                anio={anioActual}
                onEditTurno={iniciarEdicion}
              />
            </div>
          )}

          {/* Selector de empleado para móvil */}
          {vistaMobile && planificador?.empleados && (
            <div className="card mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📱 Seleccionar Empleado:
              </label>
              <select
                value={empleadoSeleccionadoMovil || ''}
                onChange={(e) => setEmpleadoSeleccionadoMovil(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-base dark:bg-secondary-dark dark:border-gray-600 font-medium"
              >
                {planificador.empleados.map((empleado) => (
                  <option key={empleado} value={empleado}>
                    {empleado}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Planificador */}
          {vistaActual !== VISTAS.SEMANAL && (
            <div className="card overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : !planificador ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay datos disponibles
                  </p>
                </div>
              ) : (
                <>
                  {/* Grid del planificador */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-100 dark:bg-secondary-dark z-10">
                        <tr>
                          <th className="sticky left-0 bg-gray-100 dark:bg-secondary-dark px-4 py-3 text-left font-semibold z-20 border-r border-gray-300 dark:border-gray-600">
                            Fecha
                          </th>
                          {empleadosFiltrados.map((empleado) => (
                            <th key={empleado} className="px-3 py-3 text-center font-semibold min-w-[100px]">
                              {vistaMobile ? '' : empleado}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {planificador.fechas && planificador.fechas.map((fecha) => (
                          <tr
                            key={fecha.fecha}
                            className={`border-b border-gray-200 dark:border-gray-700 ${fecha.esFeriado ? 'bg-red-50 dark:bg-red-900/10' : ''
                              }`}
                          >
                            <td className="sticky left-0 bg-white dark:bg-secondary-dark px-4 py-3 font-medium border-r border-gray-300 dark:border-gray-600">
                              <div>
                                <div className="text-gray-900 dark:text-white font-bold">
                                  {fecha.fecha}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {fecha.diaSemana}
                                </div>
                              </div>
                            </td>

                            {empleadosFiltrados.map((empleado) => {
                              const valor = getValorCelda(fecha.fecha, empleado);
                              const estaEditando = editando?.fecha === fecha.fecha && editando?.empleado === empleado;

                              return (
                                <td key={`${fecha.fecha}-${empleado}`} className="px-2 py-2">
                                  {estaEditando ? (
                                    // Modo edición
                                    <div className={vistaMobile ? "flex flex-col gap-2" : "flex items-center gap-1"}>
                                      <select
                                        value={turnoSeleccionado}
                                        onChange={(e) => setTurnoSeleccionado(e.target.value)}
                                        className={`flex-1 border rounded dark:bg-gray-700 dark:border-gray-600 ${vistaMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-xs'
                                          }`}
                                        autoFocus
                                      >
                                        {turnosDisponibles.map((t) => (
                                          <option key={t.id} value={t.turnos}>
                                            {t.turnos} {vistaMobile && `(${t.horas}h)`}
                                          </option>
                                        ))}
                                      </select>
                                      {vistaMobile ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={guardarTurno}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                          >
                                            <FiSave className="inline mr-1" />
                                            Guardar
                                          </button>
                                          <button
                                            onClick={cancelarEdicion}
                                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                                          >
                                            <FiX className="inline mr-1" />
                                            Cancelar
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={guardarTurno}
                                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                                          >
                                            <FiSave size={14} />
                                          </button>
                                          <button
                                            onClick={cancelarEdicion}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          >
                                            <FiX size={14} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    // Modo visualización
                                    <div
                                      onClick={() => vistaActual === VISTAS.TURNOS && iniciarEdicion(fecha.fecha, empleado, valor)}
                                      className={`turno-cell ${vistaActual === VISTAS.TURNOS
                                        ? getTurnoClass(valor)
                                        : (valor > 0
                                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400')
                                        } ${vistaActual === VISTAS.TURNOS ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                                        } ${vistaMobile ? 'min-h-[60px] text-base' : 'min-h-[40px] text-sm'
                                        } group relative`}
                                    >
                                      <span className="font-medium">
                                        {vistaActual === VISTAS.TURNOS && valor}
                                        {vistaActual === VISTAS.HORAS && (valor > 0 ? `${valor}h` : '-')}
                                        {vistaActual === VISTAS.DINERO && (valor > 0 ? `$${valor.toLocaleString('es-AR')}` : '-')}
                                      </span>
                                      {vistaActual === VISTAS.TURNOS && !vistaMobile && (
                                        <FiEdit2
                                          size={12}
                                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500"
                                        />
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                        {/* Fila de totales */}
                        {vistaActual !== VISTAS.TURNOS && !vistaMobile && (
                          <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold border-t-2 border-blue-500">
                            <td className="sticky left-0 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                              <div className="text-gray-900 dark:text-white font-bold">
                                TOTAL MES
                              </div>
                            </td>
                            {empleadosFiltrados.map((empleado) => {
                              const total = getTotalEmpleado(empleado);
                              return (
                                <td key={`total-${empleado}`} className="px-3 py-3 text-center">
                                  <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                                    {vistaActual === VISTAS.HORAS && `${total}h`}
                                    {vistaActual === VISTAS.DINERO && `$${Number(total).toLocaleString('es-AR')}`}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        )}

                        {/* Total móvil - al final como card */}
                      </tbody>
                    </table>
                  </div>

                  {/* Total mensual en móvil */}
                  {vistaMobile && vistaActual !== VISTAS.TURNOS && empleadoSeleccionadoMovil && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Total {MESES[mesActual - 1]}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {vistaActual === VISTAS.HORAS && `${getTotalEmpleado(empleadoSeleccionadoMovil)}h`}
                          {vistaActual === VISTAS.DINERO && `$${Number(getTotalEmpleado(empleadoSeleccionadoMovil)).toLocaleString('es-AR')}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {empleadoSeleccionadoMovil}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* MODAL PDF - Configuración de Colores */}
        {modalPdfAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Descargar PDF del Planificador
                  </h2>
                  <button
                    onClick={cerrarModalPdf}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    disabled={generandoPdf}
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📅 <strong>{MESES[mesActual - 1]} {anioActual}</strong> - Selecciona opciones para el PDF
                  </p>
                </div>

                {/* Selector de tipo de PDF */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    ¿Qué desea descargar?
                  </label>
                  <select
                    value={empleadoParaPdf}
                    onChange={(e) => setEmpleadoParaPdf(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="todos">Todos los empleados (Grilla completa)</option>
                    <optgroup label="Empleado individual">
                      {planificador?.empleados?.map(emp => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Selectores de color por empleado */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {planificador?.empleados?.map((empleado) => (
                    <div key={empleado} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <label className="font-medium text-gray-900 dark:text-white">
                          {empleado}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={coloresEmpleados[empleado] || '#E3F2FD'}
                          onChange={(e) => setColoresEmpleados(prev => ({
                            ...prev,
                            [empleado]: e.target.value
                          }))}
                          className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
                        />
                        <div
                          className="w-24 h-10 rounded border border-gray-300"
                          style={{ backgroundColor: coloresEmpleados[empleado] || '#E3F2FD' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Colores predefinidos */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Paletas predefinidas:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const colores = {};
                        const paletaPastel = ['#E3F2FD', '#FFF3E0', '#F3E5F5', '#E8F5E9', '#FFF9C4', '#FFE0B2'];
                        planificador.empleados.forEach((emp, idx) => {
                          colores[emp] = paletaPastel[idx % paletaPastel.length];
                        });
                        setColoresEmpleados(colores);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                    >
                      Pastel
                    </button>
                    <button
                      onClick={() => {
                        const colores = {};
                        const paletaVibrant = ['#BBDEFB', '#FFE082', '#CE93D8', '#A5D6A7', '#FFAB91', '#90CAF9'];
                        planificador.empleados.forEach((emp, idx) => {
                          colores[emp] = paletaVibrant[idx % paletaVibrant.length];
                        });
                        setColoresEmpleados(colores);
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-sm"
                    >
                      Vibrante
                    </button>
                    <button
                      onClick={() => {
                        const colores = {};
                        planificador.empleados.forEach((emp) => {
                          colores[emp] = '#FFFFFF';
                        });
                        setColoresEmpleados(colores);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                    >
                      Sin Color
                    </button>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cerrarModalPdf}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                    disabled={generandoPdf}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={generarPdf}
                    disabled={generandoPdf}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  >
                    {generandoPdf ? (
                      <>
                        <div className="spinner w-5 h-5 border-2 border-white border-t-transparent"></div>
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <FiDownload />
                        Generar PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Selector de Turnos */}
        {editando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl">
              <ShiftSelector
                turnos={turnosDisponibles}
                turnoSeleccionado={turnoSeleccionado}
                onSelect={seleccionarTurnoVisual}
                onCancel={cancelarEdicion}
              />
            </div>
          </div>
        )}

        <style jsx>{`
          .turno-cell {
            @apply px-3 py-2 rounded text-center font-medium transition-all flex items-center justify-center;
          }
          
          .turno-libre {
            @apply bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400;
          }
          
          .turno-manana {
            @apply bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700;
          }
          
          .turno-tarde {
            @apply bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700;
          }
          
          .turno-noche {
            @apply bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700;
          }
          
          .turno-vacaciones {
            @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700;
          }
          
          .turno-guardia {
            @apply bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700;
          }
          
          .turno-default {
            @apply bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800;
          }
        `}</style>
      </Layout >
    </>
  );
}

