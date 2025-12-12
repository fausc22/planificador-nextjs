// pages/planificador/index.jsx - Planificador modularizado con React Query y sincronización de URL
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import PlanificadorHeader from '../../components/planificador/PlanificadorHeader';
import VistaTabs, { VISTAS } from '../../components/planificador/VistaTabs';
import PlanificadorTabla from '../../components/planificador/PlanificadorTabla';
import ModalPDF from '../../components/planificador/ModalPDF';
import WeeklyView from '../../components/WeeklyView';
import ShiftSelector from '../../components/ShiftSelector';
import Spinner from '../../components/ui/Spinner';
import CustomSelect from '../../components/ui/CustomSelect';
import { usePlanificador } from '../../hooks/usePlanificador';
import { usePlanificadorFilters } from '../../hooks/usePlanificadorFilters';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Planificador() {
  // Filtros sincronizados con URL
  const { mes, anio, vista, cambiarMes, cambiarMesDirecto, cambiarAnio, cambiarVista } = usePlanificadorFilters();
  
  // Datos del planificador
  const {
    planificador,
    totales,
    turnosDisponibles,
    loading,
    actualizarTurno,
    recargar,
    isUpdating
  } = usePlanificador(mes, anio, vista);

  // Estado local
  const [editando, setEditando] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('');
  const [empleadoSeleccionadoMovil, setEmpleadoSeleccionadoMovil] = useState(null);
  const [vistaMobile, setVistaMobile] = useState(false);
  const [coloresEmpleados, setColoresEmpleados] = useState({});
  const [empleadoParaPdf, setEmpleadoParaPdf] = useState('todos');
  const [generandoPdf, setGenerandoPdf] = useState(false);

  // Modales
  const modalPdf = useModal();

  const { showError, showSuccess } = useToast();

  // Detectar móvil
  useEffect(() => {
    const detectarMobile = () => {
      setVistaMobile(window.innerWidth < 768);
    };
    
    detectarMobile();
    window.addEventListener('resize', detectarMobile);
    return () => window.removeEventListener('resize', detectarMobile);
  }, []);

  // Seleccionar primer empleado en móvil
  useEffect(() => {
    if (vistaMobile && planificador?.empleados?.length > 0 && !empleadoSeleccionadoMovil) {
      setEmpleadoSeleccionadoMovil(planificador.empleados[0]);
    }
  }, [planificador, vistaMobile, empleadoSeleccionadoMovil]);

  // Inicializar colores por defecto
  useEffect(() => {
    if (planificador?.empleados && Object.keys(coloresEmpleados).length === 0) {
      const coloresDefault = {};
      const coloresPredefinidos = ['#E3F2FD', '#FFF3E0', '#F3E5F5', '#E8F5E9', '#FFF9C4', '#FFE0B2'];
      planificador.empleados.forEach((emp, idx) => {
        coloresDefault[emp] = coloresPredefinidos[idx % coloresPredefinidos.length];
      });
      setColoresEmpleados(coloresDefault);
    }
  }, [planificador, coloresEmpleados]);

  // Handlers
  const iniciarEdicion = (fecha, empleado, turnoActual) => {
    if (vista !== VISTAS.TURNOS && vista !== VISTAS.SEMANAL) return;
    setEditando({ fecha, empleado });
    setTurnoSeleccionado(turnoActual || 'Libre');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setTurnoSeleccionado('');
  };

  const guardarTurno = async (turnoOverride = null) => {
    if (!editando) return;

    try {
      const { fecha, empleado } = editando;
      const turnoAGuardar = turnoOverride || turnoSeleccionado;
      await actualizarTurno(fecha, empleado, turnoAGuardar);
      cancelarEdicion();
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const seleccionarTurnoVisual = (turno) => {
    setTurnoSeleccionado(turno);
    guardarTurno(turno);
  };

  const getValorCelda = (fecha, empleado) => {
    if (!planificador?.fechas) return null;
    const fechaData = planificador.fechas.find(f => f.fecha === fecha);
    if (!fechaData) return null;

    switch (vista) {
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
    if (vista === VISTAS.TURNOS) return null;
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

  // Generar PDF
  const generarPdf = async () => {
    try {
      setGenerandoPdf(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planeamiento/pdf/${mes}/${anio}`, {
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
      a.download = `Planificador_${MESES[mes - 1]}_${anio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('PDF descargado exitosamente');
      modalPdf.close();
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showError('Error al generar PDF');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const aplicarPaleta = (tipo) => {
    const colores = {};
    const paletas = {
      pastel: ['#E3F2FD', '#FFF3E0', '#F3E5F5', '#E8F5E9', '#FFF9C4', '#FFE0B2'],
      vibrant: ['#BBDEFB', '#FFE082', '#CE93D8', '#A5D6A7', '#FFAB91', '#90CAF9'],
      'sin-color': ['#FFFFFF']
    };

    const paleta = paletas[tipo] || paletas.pastel;
    planificador.empleados.forEach((emp, idx) => {
      colores[emp] = paleta[idx % paleta.length];
    });
    setColoresEmpleados(colores);
  };

  return (
    <>
      <Head>
        <title>Planificador - {MESES[mes - 1]} {anio}</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          <PlanificadorHeader
            mesActual={mes}
            anioActual={anio}
            loading={loading}
            generandoPdf={generandoPdf}
            onCambiarMes={cambiarMes}
            onCambiarMesDirecto={cambiarMesDirecto}
            onCambiarAnio={cambiarAnio}
            onRecargar={recargar}
            onDescargarPDF={modalPdf.open}
          />

          <div className="card mb-6">
            <VistaTabs vistaActual={vista} onCambiarVista={cambiarVista} />
          </div>

          {/* Leyenda */}
          {vista === VISTAS.TURNOS && planificador && (
            <div className="card mb-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Leyenda de Turnos:
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                {[
                  { color: 'bg-gray-100', label: 'Libre' },
                  { color: 'bg-blue-100', label: 'Mañana (6-12h)' },
                  { color: 'bg-orange-100', label: 'Tarde (12-18h)' },
                  { color: 'bg-purple-100', label: 'Noche (18h+)' },
                  { color: 'bg-green-100', label: 'Vacaciones' },
                  { color: 'bg-indigo-100', label: 'Guardia' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${item.color} dark:bg-gray-700 border border-gray-300 rounded`} />
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista Semanal */}
          {vista === VISTAS.SEMANAL && (
            <div className="mb-6">
              <WeeklyView
                planificador={planificador}
                mes={mes}
                anio={anio}
                onEditTurno={iniciarEdicion}
              />
            </div>
          )}

          {/* Selector de empleado para móvil */}
          {vistaMobile && planificador?.empleados && (
            <div className="card mb-4">
              <CustomSelect
                label="📱 Seleccionar Empleado"
                value={empleadoSeleccionadoMovil || ''}
                onChange={(e) => setEmpleadoSeleccionadoMovil(e.target.value)}
                options={planificador.empleados.map((empleado) => ({
                  value: empleado,
                  label: empleado
                }))}
                containerClassName="mb-0"
                className="text-base font-medium"
              />
            </div>
          )}

          {/* Planificador Tabla */}
          {vista !== VISTAS.SEMANAL && (
            <div className="card overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : !planificador ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay datos disponibles
                  </p>
                </div>
              ) : (
                <>
                  <PlanificadorTabla
                    planificador={planificador}
                    totales={totales}
                    vistaActual={vista}
                    turnosDisponibles={turnosDisponibles}
                    editando={editando}
                    turnoSeleccionado={turnoSeleccionado}
                    vistaMobile={vistaMobile}
                    empleadosFiltrados={empleadosFiltrados}
                    onIniciarEdicion={iniciarEdicion}
                    onGuardarTurno={guardarTurno}
                    onCancelarEdicion={cancelarEdicion}
                    onCambiarTurnoSeleccionado={setTurnoSeleccionado}
                    getValorCelda={getValorCelda}
                    getTotalEmpleado={getTotalEmpleado}
                    getTurnoClass={getTurnoClass}
                  />

                  {/* Total mensual en móvil */}
                  {vistaMobile && vista !== VISTAS.TURNOS && empleadoSeleccionadoMovil && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Total {MESES[mes - 1]}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {vista === VISTAS.HORAS && `${getTotalEmpleado(empleadoSeleccionadoMovil)}h`}
                          {vista === VISTAS.DINERO && `$${Number(getTotalEmpleado(empleadoSeleccionadoMovil)).toLocaleString('es-AR')}`}
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

        {/* Modal PDF */}
        <ModalPDF
          isOpen={modalPdf.isOpen}
          onClose={modalPdf.close}
          mesActual={mes}
          anioActual={anio}
          planificador={planificador}
          coloresEmpleados={coloresEmpleados}
          empleadoParaPdf={empleadoParaPdf}
          generandoPdf={generandoPdf}
          onCambiarEmpleadoPdf={setEmpleadoParaPdf}
          onCambiarColor={(empleado, color) => setColoresEmpleados(prev => ({ ...prev, [empleado]: color }))}
          onAplicarPaleta={aplicarPaleta}
          onGenerarPdf={generarPdf}
        />

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
      </Layout>
    </>
  );
}
