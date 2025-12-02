// pages/asistencia.jsx - Página pública para registro de asistencia con foto facial
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { FiMail, FiCheckCircle, FiUser, FiClock, FiLogIn, FiLogOut, FiCamera, FiX, FiLock, FiAlertCircle } from 'react-icons/fi';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

export default function Asistencia() {
  const [paso, setPaso] = useState(1); // 1: Email, 2: Acción y Contraseña, 3: Cámara, 4: Éxito
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accion, setAccion] = useState('INGRESO');
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validandoAccion, setValidandoAccion] = useState(false);
  const [validandoPassword, setValidandoPassword] = useState(false);
  const [accionValidada, setAccionValidada] = useState(false);
  const [passwordValidada, setPasswordValidada] = useState(false);
  const [ultimaAccion, setUltimaAccion] = useState(null);
  
  // Estados para la cámara
  const [stream, setStream] = useState(null);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [errorCamara, setErrorCamara] = useState(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fotoInputRef = useRef(null);

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Iniciar cámara cuando se llega al paso 3
  useEffect(() => {
    if (paso === 3) {
      iniciarCamara();
    } else {
      detenerCamara();
    }
  }, [paso]);

  // Verificar acción automáticamente cuando se llega al paso 2 y hay un empleado
  useEffect(() => {
    if (paso === 2 && empleado && !accionValidada && !validandoAccion && accion) {
      // Verificar la acción inicial automáticamente
      verificarAccion();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [paso, empleado?.nombreCompleto]);

  const iniciarCamara = async () => {
    try {
      setErrorCamara(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Cámara frontal
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      setErrorCamara('No se pudo acceder a la cámara. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
      toast.error('Error al acceder a la cámara');
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Verificar empleado por email
  const verificarEmpleado = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post('/marcaciones/verificar-empleado', { email });
      
      if (response.data.success) {
        setEmpleado(response.data.empleado);
        setPaso(2); // Ir a paso de acción y contraseña
        setAccion('INGRESO'); // Resetear acción
        setAccionValidada(false);
        setPasswordValidada(false);
        setUltimaAccion(null);
        toast.success('¡Empleado encontrado!');
      }
    } catch (error) {
      console.error('Error verificando empleado:', error);
      toast.error(error.response?.data?.message || 'Empleado no encontrado');
      setEmpleado(null);
    } finally {
      setLoading(false);
    }
  };

  // Verificar acción cuando el usuario la selecciona (automático y silencioso)
  const verificarAccion = async () => {
    if (!empleado) {
      return;
    }

    setValidandoAccion(true);
    setAccionValidada(false);

    try {
      // Verificar última acción del empleado
      const response = await apiClient.post('/marcaciones/verificar-accion', {
        nombreEmpleado: empleado.nombreCompleto
      });

      if (response.data.success) {
        const debeRegistrar = response.data.debeRegistrar;
        const ultimaAccionRegistrada = response.data.ultimaAccion;
        setUltimaAccion(ultimaAccionRegistrada);
        
        // Verificar si la acción seleccionada es correcta
        if (accion !== debeRegistrar) {
          // La acción no es correcta, cambiar automáticamente y mostrar error
          if (!ultimaAccionRegistrada) {
            // Es el primer registro del día, solo permite INGRESO
            if (accion === 'EGRESO') {
              toast.error('No puedes registrar un EGRESO sin un INGRESO previo. Se cambió a INGRESO.', {
                duration: 5000
              });
              setAccion('INGRESO');
              setAccionValidada(true); // Ahora es correcta
            }
          } else if (ultimaAccionRegistrada === 'INGRESO' && accion === 'INGRESO') {
            // Ya hay un INGRESO, debe registrar EGRESO
            toast.error('Ya tienes un INGRESO registrado. Se cambió a EGRESO.', {
              duration: 5000
            });
            setAccion('EGRESO');
            setAccionValidada(true); // Ahora es correcta
          } else if (ultimaAccionRegistrada === 'EGRESO' && accion === 'EGRESO') {
            // Ya hay un EGRESO, debe registrar INGRESO
            toast.error('Tu último registro fue un EGRESO. Se cambió a INGRESO.', {
              duration: 5000
            });
            setAccion('INGRESO');
            setAccionValidada(true); // Ahora es correcta
          } else {
            setAccionValidada(false);
          }
        } else {
          // La acción es correcta
          setAccionValidada(true);
        }
      }
    } catch (error) {
      console.error('Error verificando acción:', error);
      toast.error('Error al verificar acción. Por favor, intenta nuevamente.');
      setAccionValidada(false);
    } finally {
      setValidandoAccion(false);
    }
  };

  // Validar contraseña antes de ir a cámara
  const validarPassword = async (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Por favor ingresa la contraseña');
      return;
    }

    if (!accionValidada) {
      toast.error('La acción seleccionada no es correcta. Por favor, selecciona la acción correcta.');
      return;
    }

    setValidandoPassword(true);

    try {
      // Validar contraseña en el backend
      const response = await apiClient.post('/marcaciones/validar-password', {
        password
      });

      if (response.data.success) {
        // Contraseña correcta, permitir continuar
        setPasswordValidada(true);
        setPaso(3); // Ir a cámara
      } else {
        toast.error('Contraseña incorrecta. Por favor, verifica tu contraseña.');
        setPasswordValidada(false);
      }
    } catch (error) {
      console.error('Error validando contraseña:', error);
      
      if (error.response?.status === 403) {
        toast.error('Contraseña incorrecta. Por favor, verifica tu contraseña.');
      } else {
        toast.error('Error al validar contraseña. Por favor, intenta nuevamente.');
      }
      setPasswordValidada(false);
    } finally {
      setValidandoPassword(false);
    }
  };

  // Capturar foto
  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Reducir dimensiones para optimizar tamaño (máximo 800px de ancho)
    const maxWidth = 800;
    const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1;
    
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    console.log('📸 Capturando foto:', {
      originalWidth: video.videoWidth,
      originalHeight: video.videoHeight,
      finalWidth: canvas.width,
      finalHeight: canvas.height,
      scale: scale.toFixed(2)
    });

    // Dibujar el frame actual del video en el canvas (escalado)
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a blob con compresión (calidad 0.7 para reducir tamaño)
    canvas.toBlob((blob) => {
      console.log(`📷 Foto capturada: ${(blob.size / 1024).toFixed(2)}KB`);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoCapturada(reader.result);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.7); // Calidad 0.7 para reducir tamaño sin perder mucha calidad

    // Detener la cámara después de capturar
    detenerCamara();
  };

  // Tomar otra foto
  const tomarOtraFoto = () => {
    setFotoCapturada(null);
    iniciarCamara();
  };

  // Registrar marcación con foto
  const registrarMarcacion = async () => {
    if (!fotoCapturada || !empleado) return;

    const tiempoInicio = Date.now();
    console.log('🚀 [INICIO] Proceso de registro de marcación');
    console.log('📊 Estado inicial:', {
      email,
      accion,
      empleado: empleado.nombreCompleto,
      fotoCapturada: fotoCapturada ? 'Sí' : 'No',
      timestamp: new Date().toISOString()
    });

    setLoading(true);

    try {
      // Paso 1: Convertir base64 a blob
      console.log('🔄 [PASO 1] Convirtiendo foto base64 a blob...');
      const t1 = Date.now();
      const response = await fetch(fotoCapturada);
      if (!response.ok) {
        throw new Error('Error al procesar la foto');
      }
      const blob = await response.blob();
      console.log(`✅ [PASO 1] Blob creado en ${Date.now() - t1}ms - Tamaño: ${(blob.size / 1024).toFixed(2)}KB`);
      
      // Verificar tamaño de la imagen
      const tamañoMB = blob.size / (1024 * 1024);
      if (tamañoMB > 5) {
        console.warn(`⚠️ Imagen grande: ${tamañoMB.toFixed(2)}MB (máximo recomendado: 5MB)`);
        toast('La imagen es grande, puede tardar un poco...', {
          duration: 3000,
          icon: '⏳'
        });
      }
      
      // Paso 2: Crear FormData
      console.log('🔄 [PASO 2] Creando FormData...');
      const t2 = Date.now();
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('accion', accion);
      formData.append('foto', blob, 'foto.jpg');
      console.log(`✅ [PASO 2] FormData creado en ${Date.now() - t2}ms`);

      // Paso 3: Enviar al backend con Base64 (más compatible con proxy PHP)
      console.log('🔄 [PASO 3] Enviando petición al backend (Base64)...');
      console.log('📡 URL:', `${process.env.NEXT_PUBLIC_API_URL}/marcaciones/registrar-con-foto-base64`);
      console.log('📦 Datos:', {
        email,
        accion,
        fotoBase64Size: `${(fotoCapturada.length / 1024).toFixed(2)}KB`
      });
      
      const t3 = Date.now();
      
      // Enviar como JSON con Base64 (funciona perfecto con proxy PHP)
      const apiResponse = await apiClient.post(
        '/marcaciones/registrar-con-foto-base64', 
        {
          email,
          password,
          accion,
          fotoBase64: fotoCapturada // Ya está en base64 desde la captura
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 segundos
        }
      );
      
      const tiempoSubida = Date.now() - t3;
      console.log(`✅ [PASO 3] Respuesta recibida en ${tiempoSubida}ms`);
      console.log('📥 Respuesta del servidor:', apiResponse.data);

      // Paso 4: Procesar respuesta
      console.log('🔄 [PASO 4] Procesando respuesta...');
      if (apiResponse.data.success) {
        const tiempoTotal = Date.now() - tiempoInicio;
        console.log(`✅ [FIN] Proceso completado exitosamente en ${tiempoTotal}ms`);
        console.log('📊 Desglose de tiempos:', {
          total: `${tiempoTotal}ms`,
          subida: `${tiempoSubida}ms`,
          porcentajeSubida: `${((tiempoSubida / tiempoTotal) * 100).toFixed(1)}%`
        });
        
        setPaso(4); // Éxito
        toast.success(`${accion} registrado exitosamente`);
      } else {
        throw new Error(apiResponse.data.message || 'Error desconocido');
      }
    } catch (error) {
      const tiempoTotal = Date.now() - tiempoInicio;
      console.error(`❌ [ERROR] Proceso falló después de ${tiempoTotal}ms`);
      console.error('❌ Error completo:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al registrar marcación';
      let isValidationError = false;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'La petición tardó demasiado. Por favor, intenta nuevamente.';
      } else if (error.response?.status === 502) {
        errorMessage = 'Error de conexión con el servidor. Por favor, intenta nuevamente.';
      } else if (error.response?.status === 400) {
        // Errores de validación (400) son informativos, no errores del sistema
        const backendMessage = error.response?.data?.message || 'Datos inválidos. Verifica la información.';
        
        // Detectar si es un error de validación de negocio (no un error técnico)
        if (backendMessage.includes('Ya existe un INGRESO sin EGRESO') || 
            backendMessage.includes('No existe un INGRESO previo') ||
            backendMessage.includes('Debe registrar primero')) {
          isValidationError = true;
          errorMessage = backendMessage;
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.response?.status === 403) {
        // Error de contraseña incorrecta
        errorMessage = 'Contraseña incorrecta. Por favor, verifica tu contraseña.';
        // Volver al paso 2 para que pueda corregir la contraseña
        setPaso(2);
        setPassword('');
        setPasswordValidada(false);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar como info si es una validación de negocio, como error si es técnico
      if (isValidationError) {
        toast(errorMessage, {
          duration: 5000,
          icon: 'ℹ️'
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      // Asegurar que loading siempre se resetee
      setLoading(false);
      console.log('🔄 Loading reseteado');
    }
  };

  // Reiniciar formulario
  const reiniciar = () => {
    setEmail('');
    setPassword('');
    setAccion('INGRESO');
    setEmpleado(null);
    setFotoCapturada(null);
    setPaso(1);
    setAccionValidada(false);
    setPasswordValidada(false);
    setUltimaAccion(null);
    detenerCamara();
  };

  return (
    <>
      <Head>
        <title>Marcación de Asistencia - Planificador</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary-dark dark:to-secondary-dark px-4 py-8">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="card animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiClock className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Marcación de Asistencia
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sistema de control horario
              </p>
            </div>

            {/* Paso 1: Email */}
            {paso === 1 && (
              <div className="space-y-6">
                <form onSubmit={verificarEmpleado} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email del empleado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="tu.email@ejemplo.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="spinner w-5 h-5 border-2"></div>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      <span>Verificar</span>
                    </>
                  )}
                </button>
              </form>
              </div>
            )}

            {/* Paso 2: Acción y Contraseña */}
            {paso === 2 && empleado && (
              <div className="space-y-6">
                {/* Información del empleado */}
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiCheckCircle className="text-green-600 dark:text-green-400 text-2xl" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        ¡Empleado verificado!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {empleado.nombreCompleto}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="text-gray-500" />
                    <span>{empleado.email}</span>
                  </div>
                </div>

                {/* Selección de acción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selecciona la acción
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAccion('INGRESO');
                        setAccionValidada(false);
                        // Verificar automáticamente cuando se selecciona
                        setTimeout(() => verificarAccion(), 100);
                      }}
                      disabled={validandoAccion}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        accion === 'INGRESO'
                          ? accionValidada
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                            : 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FiLogIn className={`mx-auto text-3xl mb-2 ${
                        accion === 'INGRESO' 
                          ? accionValidada
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold text-sm ${
                        accion === 'INGRESO' 
                          ? accionValidada
                            ? 'text-green-900 dark:text-green-300'
                            : 'text-blue-900 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        INGRESO
                      </p>
                      {accion === 'INGRESO' && accionValidada && (
                        <FiCheckCircle className="mx-auto text-green-600 dark:text-green-400 mt-1" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccion('EGRESO');
                        setAccionValidada(false);
                        // Verificar automáticamente cuando se selecciona
                        setTimeout(() => verificarAccion(), 100);
                      }}
                      disabled={validandoAccion}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        accion === 'EGRESO'
                          ? accionValidada
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FiLogOut className={`mx-auto text-3xl mb-2 ${
                        accion === 'EGRESO'
                          ? accionValidada
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                          : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold text-sm ${
                        accion === 'EGRESO'
                          ? accionValidada
                            ? 'text-green-900 dark:text-green-300'
                            : 'text-red-900 dark:text-red-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        EGRESO
                      </p>
                      {accion === 'EGRESO' && accionValidada && (
                        <FiCheckCircle className="mx-auto text-green-600 dark:text-green-400 mt-1" />
                      )}
                    </button>
                  </div>
                  
                </div>

                {/* Contraseña - Solo mostrar si la acción está validada */}
                {accionValidada && (
                  <form onSubmit={validarPassword} className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña de asistencia
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={mostrarContrasena ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input pl-10 pr-10"
                          placeholder="Ingresa la contraseña"
                          disabled={validandoPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarContrasena(!mostrarContrasena)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {mostrarContrasena ? (
                            <FiX className="text-gray-400 hover:text-gray-600" />
                          ) : (
                            <FiLock className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={validandoPassword}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      {validandoPassword ? (
                        <>
                          <div className="spinner w-5 h-5 border-2"></div>
                          <span>Validando...</span>
                        </>
                      ) : (
                        <>
                          <FiCamera />
                          <span>Continuar a Cámara</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPaso(1);
                    setPassword('');
                    setAccion('INGRESO');
                    setAccionValidada(false);
                    setPasswordValidada(false);
                  }}
                  disabled={loading || validandoAccion || validandoPassword}
                  className="w-full btn-secondary"
                >
                  Cambiar empleado
                </button>
              </div>
            )}

            {/* Paso 3: Cámara */}
            {paso === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Verificación Facial
                    </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Coloca tu rostro dentro del marco
                  </p>
                </div>

                {errorCamara ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <FiAlertCircle />
                      <p className="text-sm">{errorCamara}</p>
                    </div>
                    <button
                      onClick={iniciarCamara}
                      className="mt-4 w-full btn-primary"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                ) : !fotoCapturada ? (
                  <div className="relative">
                    {/* Video con marco facial */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Espejo
                      />
                      
                      {/* Marco facial tipo biométrico */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                          {/* Marco ovalado */}
                          <div className="w-64 h-80 border-4 border-white rounded-full opacity-80"></div>
                          {/* Guías */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-white opacity-50"></div>
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 w-full bg-white opacity-50"></div>
                  </div>
                </div>

                      {/* Instrucciones */}
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg inline-block">
                          Coloca tu rostro dentro del marco
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={capturarFoto}
                      className="mt-4 w-full btn-primary flex items-center justify-center space-x-2"
                      disabled={!stream}
                    >
                      <FiCamera />
                      <span>Capturar Foto</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview de foto capturada */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img 
                        src={fotoCapturada}
                        alt="Foto capturada"
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Espejo para mostrar como se ve
                    />
                  </div>

                    <div className="flex gap-3">
                      <button
                        onClick={tomarOtraFoto}
                        className="flex-1 btn-secondary"
                      >
                        Tomar otra foto
                      </button>
                      <button
                        onClick={registrarMarcacion}
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="spinner w-5 h-5 border-2"></div>
                            <span>Registrando...</span>
                          </>
                        ) : (
                          <>
                            <FiCheckCircle />
                            <span>Confirmar y Registrar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Paso 4: Éxito */}
            {paso === 4 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-white text-4xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ¡{accion} Registrado!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tu marcación ha sido registrada exitosamente
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                    <FiUser />
                    <span className="font-medium">{empleado?.nombreCompleto}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <FiClock />
                    <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <button
                  onClick={reiniciar}
                  className="w-full btn-primary"
                >
                  Registrar otra asistencia
                </button>
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

