// components/NotificacionesLogueos.jsx - Componente de notificaciones de logueos faltantes
import { useState, useEffect } from 'react';
import { FiAlertCircle, FiClock, FiRefreshCw, FiCheckCircle, FiChevronDown, FiChevronUp, FiMessageCircle } from 'react-icons/fi';
import { notificacionesAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Loading from './Loading';

export default function NotificacionesLogueos() {
  const [notificaciones, setNotificaciones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
    // Recargar cada 5 minutos
    const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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


  if (loading && !notificaciones) {
    return (
      <div className="card">
        <Loading text="Cargando notificaciones..." />
      </div>
    );
  }

  if (!notificaciones || notificaciones.total === 0) {
    return (
      <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Todo en orden
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Todos los empleados han registrado sus logueos correctamente
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={cargarNotificaciones}
              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              title="Actualizar"
            >
              <FiRefreshCw className="text-lg" />
            </button>
            <a
              href="/probar-whatsapp"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
              title="Probar WhatsApp"
            >
              <FiMessageCircle className="text-base" />
              <span>Probar WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            notificaciones.alta > 0 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
          }`}>
            <FiAlertCircle className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notificaciones de Asistencia
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {notificaciones.total} {notificaciones.total === 1 ? 'notificación' : 'notificaciones'}
              {notificaciones.alta > 0 && (
                <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                  ({notificaciones.alta} alta{notificaciones.alta !== 1 ? 's' : ''} prioridad)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2" style={{ zIndex: 10, position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              console.log('🖱️ Botón Actualizar clickeado');
              verificarYEnviar();
            }}
            disabled={verificando}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
            title="Verificar y enviar notificaciones"
          >
            <FiRefreshCw className={`text-base ${verificando ? 'animate-spin' : ''}`} />
            <span>{verificando ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
          <a
            href="/probar-whatsapp"
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
            title="Probar WhatsApp"
          >
            <FiMessageCircle className="text-base" />
            <span>Probar WhatsApp</span>
          </a>
          <button
            onClick={cargarNotificaciones}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Recargar notificaciones"
          >
            <FiRefreshCw className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={expanded ? 'Contraer' : 'Expandir'}
          >
            {expanded ? (
              <FiChevronUp className="text-lg" />
            ) : (
              <FiChevronDown className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {notificaciones.notificaciones.map((notif, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                notif.severidad === 'ALTA'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      notif.severidad === 'ALTA'
                        ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                        : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {notif.severidad}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notif.tipo === 'FALTA_LOGUEO' ? 'Falta logueo' : 'Fuera de margen'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {notif.empleado}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {notif.mensaje}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiClock />
                      <span>Turno: {notif.turno} a las {notif.horaTurno}</span>
                    </div>
                    {notif.horaRegistrada && (
                      <div className="flex items-center space-x-1">
                        <span>Registrado: {notif.horaRegistrada}</span>
                      </div>
                    )}
                    {notif.horaEsperada && (
                      <div className="flex items-center space-x-1">
                        <span>Margen: {notif.horaEsperada}</span>
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

