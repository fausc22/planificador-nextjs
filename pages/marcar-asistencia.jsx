// pages/marcar-asistencia.jsx - Página pública para marcar INGRESO/EGRESO ACTUALIZADA
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiMapPin, FiCheckCircle, FiAlertTriangle, FiClock, FiUser, FiXCircle, FiLogIn, FiLogOut } from 'react-icons/fi';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

export default function MarcarAsistencia() {
  const router = useRouter();
  const { token } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [marcacionCompletada, setMarcacionCompletada] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Efecto para verificar si hay token
  useEffect(() => {
    if (!token && router.isReady) {
      toast.error('No se proporcionó un código válido');
      setTimeout(() => {
        router.push('/asistencia');
      }, 2000);
    }
  }, [token, router]);

  // Obtener ubicación y marcar asistencia
  const validarLogueo = async () => {
    if (!token) {
      toast.error('Código QR inválido');
      return;
    }

    // Validar contraseña
    if (!password || password.trim() === '') {
      toast.error('Debes ingresar la contraseña');
      return;
    }

    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      setGeoError('Geolocalización no disponible');
      return;
    }

    setLoading(true);
    setGeoError(null);
    setPasswordError(false);

    // Obtener posición actual
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await apiClient.post('/marcaciones/registrar', {
            token: token,
            latitude,
            longitude,
            password: password.trim()
          });

          if (response.data.success) {
            setResultado(response.data.data);
            setMarcacionCompletada(true);
            toast.success(response.data.message);
          }
        } catch (error) {
          console.error('Error marcando asistencia:', error);
          
          const errorData = error.response?.data;
          const mensaje = errorData?.message || 'Error al registrar marcación';
          const rechazado = errorData?.rechazado;
          const tipoError = errorData?.tipo_error;
          const ultimoLogueo = errorData?.ultimo_logueo;
          
          // Si el error es de contraseña incorrecta
          if (error.response?.status === 403 && mensaje.toLowerCase().includes('contraseña')) {
            setPasswordError(true);
            setPassword('');
            toast.error('Contraseña incorrecta', { duration: 3000 });
          } else if (rechazado) {
            // Fue rechazado por estar fuera de rango o validación fallida
            setResultado({
              rechazado: true,
              ...errorData.data
            });
            setMarcacionCompletada(true);
            toast.error(mensaje, { duration: 5000 });
          } else if (tipoError && ultimoLogueo) {
            // Error de secuencia con información del último logueo
            const accionSugerida = tipoError === 'DOS_INGRESOS' ? 'EGRESO' : 'INGRESO';
            let mensajeCompleto = mensaje;
            mensajeCompleto += `\n\nÚltimo logueo: ${ultimoLogueo.accion} el ${ultimoLogueo.fecha} a las ${ultimoLogueo.hora}.`;
            mensajeCompleto += `\nDebe registrar: ${accionSugerida}`;
            
            toast.error(mensajeCompleto, { duration: 6000 });
          } else {
            toast.error(mensaje, { duration: 5000 });
            
            // Si el token expiró, redirigir después de unos segundos
            if (error.response?.status === 401) {
              setTimeout(() => {
                router.push('/asistencia');
              }, 3000);
            }
          }
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        
        let errorMsg = 'No se pudo obtener tu ubicación';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Debes permitir el acceso a tu ubicación';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tiempo de espera agotado';
            break;
        }
        
        setGeoError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Volver al inicio
  const volverAlInicio = () => {
    router.push('/asistencia');
  };

  return (
    <>
      <Head>
        <title>Marcar Asistencia - Planificador</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary-dark dark:to-secondary-dark px-4 py-8">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="card animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                marcacionCompletada
                  ? resultado?.rechazado
                    ? 'bg-red-600'
                    : 'bg-green-600'
                  : 'bg-blue-600'
              }`}>
                {marcacionCompletada ? (
                  resultado?.rechazado ? (
                    <FiXCircle className="text-white text-2xl" />
                  ) : (
                    <FiCheckCircle className="text-white text-2xl" />
                  )
                ) : (
                  <FiMapPin className="text-white text-2xl" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {marcacionCompletada 
                  ? resultado?.rechazado
                    ? 'Marcación Rechazada'
                    : '¡Marcación Exitosa!'
                  : 'Marcar Asistencia'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {marcacionCompletada 
                  ? resultado?.rechazado
                    ? 'No cumple con los requisitos'
                    : 'Tu asistencia ha sido registrada' 
                  : 'Ingresa tu dirección actual'}
              </p>
            </div>

            {/* Marcación RECHAZADA */}
            {marcacionCompletada && resultado?.rechazado && (
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
                  <div className="text-center">
                    <FiXCircle className="mx-auto text-red-600 dark:text-red-400 text-5xl mb-3" />
                    
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-3">
                      Marcación No Registrada
                    </h3>
                    
                    <p className="text-sm text-red-700 dark:text-red-300">
                      No se pudo completar el registro. <br />
                      Por favor, contacta con tu supervisor.
                    </p>
                  </div>
                </div>

                <button
                  onClick={volverAlInicio}
                  className="w-full btn-secondary"
                >
                  Volver al inicio
                </button>
              </div>
            )}

            {/* Marcación EXITOSA */}
            {marcacionCompletada && !resultado?.rechazado && resultado && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <FiCheckCircle className="mx-auto text-green-600 dark:text-green-400 text-5xl mb-3" />
                    
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold mb-3 ${
                      resultado.accion === 'INGRESO'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {resultado.accion === 'INGRESO' ? <FiLogIn className="mr-2" /> : <FiLogOut className="mr-2" />}
                      {resultado.accion} REGISTRADO
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mt-4">
                      <div className="flex items-center justify-center space-x-2">
                        <FiUser className="text-gray-500" />
                        <span className="font-medium">{resultado.empleado}</span>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <FiClock className="text-gray-500" />
                        <span>{resultado.hora}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Formulario de marcación */}
            {!marcacionCompletada && (
              <div className="space-y-6">
                {/* Instrucción simple */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Ingresa tu contraseña para registrar tu asistencia
                  </p>
                </div>

                {/* Input de contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input w-full ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Ingresa tu contraseña"
                    disabled={loading}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Contraseña incorrecta
                    </p>
                  )}
                </div>

                {/* Error de geolocalización */}
                {geoError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="text-center text-sm text-red-700 dark:text-red-300">
                      <p className="font-medium mb-1">Error:</p>
                      <p className="text-xs">Debes permitir el acceso a tu ubicación en el navegador</p>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="space-y-3">
                  {/* Botón validar logueo */}
                  <button
                    onClick={validarLogueo}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="spinner w-6 h-6 border-2"></div>
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-xl" />
                        <span>VALIDAR LOGUEO</span>
                      </>
                    )}
                  </button>

                  {/* Botón cancelar */}
                  <button
                    type="button"
                    onClick={volverAlInicio}
                    disabled={loading}
                    className="w-full btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Sistema de Control Horario © 2024</p>
          </div>
        </div>
      </div>
    </>
  );
}
