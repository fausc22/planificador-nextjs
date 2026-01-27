// components/NotificacionesLogueos.jsx - Componente de notificaciones de logueos faltantes
import { useState, useEffect } from 'react';
import { FiAlertCircle, FiClock, FiRefreshCw, FiCheckCircle, FiChevronDown, FiChevronUp, FiMessageCircle, FiX } from 'react-icons/fi';
import { notificacionesAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Loading from './Loading';

export default function NotificacionesLogueos() {
  const [notificaciones, setNotificaciones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
    cargarEstadoNotificaciones();
    // Recargar cada 5 minutos
    const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarEstadoNotificaciones = async () => {
    try {
      const response = await notificacionesAPI.obtenerEstadoNotificaciones();
      if (response.data.success) {
        setNotificacionesActivas(response.data.data.activo);
      }
    } catch (error) {
      console.error('Error cargando estado de notificaciones:', error);
    }
  };

  const cambiarEstadoNotificaciones = async () => {
    try {
      setCambiandoEstado(true);
      const nuevoEstado = notificacionesActivas ? 'OFF' : 'ON';
      const response = await notificacionesAPI.cambiarEstadoNotificaciones(nuevoEstado);
      
      if (response.data.success) {
        setNotificacionesActivas(response.data.data.activo);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error cambiando estado de notificaciones:', error);
      toast.error('Error al cambiar el estado de las notificaciones');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await notificacionesAPI.obtenerLogueosFaltantes();
      if (response.data.success) {
        setNotificaciones(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const verificarYEnviar = async () => {
    console.log('🔍 VerificarYEnviar llamado');
    try {
      setVerificando(true);
      console.log('📡 Llamando a verificarYEnviar API...');
      const response = await notificacionesAPI.verificarYEnviar();
      console.log('✅ Respuesta recibida:', response.data);
      if (response.data.success) {
        toast.success('Verificación completada. ' + 
          (response.data.data.whatsappEnviadas > 0 
            ? `${response.data.data.whatsappEnviadas} notificación(es) enviada(s) por WhatsApp.`
            : 'No hay notificaciones nuevas.'));
        // Recargar notificaciones después de verificar
        await cargarNotificaciones();
      }
    } catch (error) {
      console.error('❌ Error verificando notificaciones:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al verificar notificaciones';
      toast.error(errorMsg);
    } finally {
      setVerificando(false);
    }
  };

  // Función para obtener el texto del tipo de notificación
  const obtenerTipoNotificacion = (tipo) => {
    const tipos = {
      'FALTA_LOGUEO': 'Falta logueo',
      'INCONSISTENCIA': 'Inconsistencia detectada',
      'TURNO_ABIERTO': 'Turno abierto > 24h',
      'FUERA_DE_MARGEN': 'Fuera de margen'
    };
    return tipos[tipo] || tipo || 'Notificación';
  };

  // Función para eliminar notificación
  const eliminarNotificacion = async (notif) => {
    // Si tiene ID, eliminar de la base de datos
    if (notif.id) {
      if (!confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
        return;
      }
      
      try {
        await notificacionesAPI.eliminarNotificacion(notif.id);
        toast.success('Notificación eliminada');
        cargarNotificaciones(); // Recargar lista
      } catch (error) {
        console.error('Error eliminando notificación:', error);
        toast.error('Error al eliminar notificación');
      }
    } else {
      // Si no tiene ID, solo mostrar mensaje (notificación temporal)
      toast.info('Esta notificación se eliminará automáticamente cuando se registre el logueo correspondiente');
    }
  };


  if (loading && !notificaciones) {
    return (
      <div className="card">
        <Loading text="Cargando notificaciones..." />
      </div>
    );
  }

  if (!notificaciones || notificaciones.total === 0) {
    return (
      <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3 flex-shrink-0 min-w-0">
            <FiCheckCircle className="text-xl sm:text-2xl text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-green-900 dark:text-green-100">
                Todo en orden
              </h3>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                Todos los empleados han registrado sus logueos correctamente
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:space-x-3">
            {/* Switch ON/OFF para notificaciones */}
            <div className="flex items-center space-x-2 px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                WhatsApp
              </span>
              <button
                onClick={cambiarEstadoNotificaciones}
                disabled={cambiandoEstado}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
                  notificacionesActivas
                    ? 'bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${cambiandoEstado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={notificacionesActivas ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificacionesActivas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-xs font-medium whitespace-nowrap ${
                notificacionesActivas
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {notificacionesActivas ? 'ON' : 'OFF'}
              </span>
            </div>
            <button
              onClick={cargarNotificaciones}
              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors flex-shrink-0"
              title="Actualizar"
            >
              <FiRefreshCw className="text-base sm:text-lg" />
            </button>
            <a
              href="/probar-whatsapp"
              className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
              title="Probar WhatsApp"
            >
              <FiMessageCircle className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Probar WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3 flex-shrink-0 min-w-0">
          <div className={`p-2 rounded-lg flex-shrink-0 ${
            notificaciones.alta > 0 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
          }`}>
            <FiAlertCircle className="text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              Notificaciones de Asistencia
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {notificaciones.total} {notificaciones.total === 1 ? 'notificación' : 'notificaciones'}
              {notificaciones.alta > 0 && (
                <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                  ({notificaciones.alta} alta{notificaciones.alta !== 1 ? 's' : ''} prioridad)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:space-x-2" style={{ zIndex: 10, position: 'relative' }}>
          {/* Switch ON/OFF para notificaciones */}
          <div className="flex items-center space-x-2 px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              WhatsApp
            </span>
            <button
              onClick={cambiarEstadoNotificaciones}
              disabled={cambiandoEstado}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
                notificacionesActivas
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${cambiandoEstado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={notificacionesActivas ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificacionesActivas ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium whitespace-nowrap ${
              notificacionesActivas
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {notificacionesActivas ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('🖱️ Botón Actualizar clickeado');
              verificarYEnviar();
            }}
            disabled={verificando}
            className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
            title="Verificar y enviar notificaciones"
          >
            <FiRefreshCw className={`text-sm sm:text-base ${verificando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{verificando ? 'Actualizando...' : 'Actualizar'}</span>
            <span className="sm:hidden">{verificando ? '...' : 'Actualizar'}</span>
          </button>
          <a
            href="/probar-whatsapp"
            className="px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
            title="Probar WhatsApp"
          >
            <FiMessageCircle className="text-sm sm:text-base" />
            <span className="hidden sm:inline">Probar WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <button
            onClick={cargarNotificaciones}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            title="Recargar notificaciones"
          >
            <FiRefreshCw className={`text-base sm:text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            title={expanded ? 'Contraer' : 'Expandir'}
          >
            {expanded ? (
              <FiChevronUp className="text-base sm:text-lg" />
            ) : (
              <FiChevronDown className="text-base sm:text-lg" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {notificaciones.notificaciones.map((notif, index) => (
            <div
              key={notif.id || index}
              className={`p-4 rounded-lg border-2 relative ${
                notif.severidad === 'ALTA'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}
            >
              {/* Botón X para eliminar */}
              <button
                onClick={() => eliminarNotificacion(notif)}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar notificación"
              >
                <FiX className="text-lg" />
              </button>

              <div className="flex items-start justify-between pr-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      notif.severidad === 'ALTA'
                        ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                        : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {notif.severidad}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {obtenerTipoNotificacion(notif.tipo)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 break-words">
                    {notif.empleado}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">
                    {notif.mensaje}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {notif.turno && notif.horaTurno && (
                      <div className="flex items-center space-x-1 min-w-0">
                        <FiClock className="flex-shrink-0" />
                        <span className="break-words">Turno: {notif.turno} a las {notif.horaTurno}</span>
                      </div>
                    )}
                    {notif.horaRegistrada && (
                      <div className="flex items-center space-x-1 min-w-0">
                        <span className="break-words">Registrado: {notif.horaRegistrada}</span>
                      </div>
                    )}
                    {notif.horaEsperada && (
                      <div className="flex items-center space-x-1 min-w-0">
                        <span className="break-words">Margen: {notif.horaEsperada}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

