// pages/planificador/index.jsx - Vista principal del planificador OPTIMIZADO MÓVIL
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { planificadorAPI, turnosAPI } from '../../utils/api';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const VISTAS = {
  TURNOS: 'turnos',
  HORAS: 'horas',
  DINERO: 'acumulado'
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
    if (vistaActual !== VISTAS.TURNOS) return;
    
    setEditando({ fecha, empleado });
    setTurnoSeleccionado(turnoActual || 'Libre');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setTurnoSeleccionado('');
  };

  const guardarTurno = async () => {
    if (!editando) return;

    try {
      const { fecha, empleado } = editando;
      
      const response = await planificadorAPI.actualizarTurno(mesActual, anioActual, {
        fecha,
        nombreEmpleado: empleado,
        turno: turnoSeleccionado
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
                  >
                    <FiChevronLeft className="text-xl" />
                  </button>

                  <div className="text-center min-w-[200px]">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {MESES[mesActual - 1]} {anioActual}
                    </h2>
                  </div>

                  <button
                    onClick={() => cambiarMes(1)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
                    disabled={loading}
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
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    vistaActual === VISTAS.TURNOS
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  📅 Turnos
                </button>
                <button
                  onClick={() => setVistaActual(VISTAS.HORAS)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    vistaActual === VISTAS.HORAS
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  ⏱️ Horas
                </button>
                <button
                  onClick={() => setVistaActual(VISTAS.DINERO)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    vistaActual === VISTAS.DINERO
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  💰 Dinero
                </button>
              </div>
            </div>
          </div>

          {/* Leyenda arriba */}
          {vistaActual === VISTAS.TURNOS && planificador && (
            <div className="card mb-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Leyenda de Turnos:
              </h3>
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
                          className={`border-b border-gray-200 dark:border-gray-700 ${
                            fecha.esFeriado ? 'bg-red-50 dark:bg-red-900/10' : ''
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
                                      className={`flex-1 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                                        vistaMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-xs'
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
                                    className={`turno-cell ${
                                      vistaActual === VISTAS.TURNOS 
                                        ? getTurnoClass(valor) 
                                        : (valor > 0 
                                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400')
                                    } ${
                                      vistaActual === VISTAS.TURNOS ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                                    } ${
                                      vistaMobile ? 'min-h-[60px] text-base' : 'min-h-[40px] text-sm'
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
        </div>

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
      </Layout>
    </>
  );
}


