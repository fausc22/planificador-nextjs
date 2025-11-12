// pages/marcacion.jsx - Página pública para generar QR de marcación ACTUALIZADA
import { useState } from 'react';
import Head from 'next/head';
import { FiMail, FiCheckCircle, FiUser, FiClock, FiMapPin, FiLogIn, FiLogOut } from 'react-icons/fi';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

export default function Marcacion() {
  const [email, setEmail] = useState('');
  const [accion, setAccion] = useState('INGRESO'); // INGRESO o EGRESO
  const [loading, setLoading] = useState(false);
  const [empleado, setEmpleado] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState('');

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
        toast.success('¡Empleado encontrado!');
      }
    } catch (error) {
      console.error('Error verificando empleado:', error);
      toast.error(error.response?.data?.message || 'Empleado no encontrado');
      setEmpleado(null);
      setQrData(null);
      setQrImage('');
    } finally {
      setLoading(false);
    }
  };

  // Generar código QR
  const generarQR = async () => {
    if (!empleado) return;

    setLoading(true);

    try {
      const response = await apiClient.post('/marcaciones/generar-qr', {
        empleadoId: empleado.id,
        accion
      });

      if (response.data.success) {
        const qrUrl = response.data.data.qrUrl;
        setQrData(response.data.data);

        // Generar imagen QR
        const qrImageUrl = await QRCode.toDataURL(qrUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrImage(qrImageUrl);
        toast.success('¡Código QR generado!');
      }
    } catch (error) {
      console.error('Error generando QR:', error);
      toast.error(error.response?.data?.message || 'Error al generar código QR');
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar formulario
  const reiniciar = () => {
    setEmail('');
    setAccion('INGRESO');
    setEmpleado(null);
    setQrData(null);
    setQrImage('');
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

            {/* Sin empleado verificado */}
            {!empleado && (
              <form onSubmit={verificarEmpleado} className="space-y-6">
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
            )}

            {/* Empleado verificado - Selección de acción */}
            {empleado && !qrData && (
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
                      onClick={() => setAccion('INGRESO')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        accion === 'INGRESO'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FiLogIn className={`mx-auto text-3xl mb-2 ${
                        accion === 'INGRESO' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold text-sm ${
                        accion === 'INGRESO' ? 'text-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        INGRESO
                      </p>
                    </button>

                    <button
                      onClick={() => setAccion('EGRESO')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        accion === 'EGRESO'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FiLogOut className={`mx-auto text-3xl mb-2 ${
                        accion === 'EGRESO' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold text-sm ${
                        accion === 'EGRESO' ? 'text-red-900 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        EGRESO
                      </p>
                    </button>
                  </div>
                </div>

                {/* Botones */}
                <div className="space-y-3">
                  <button
                    onClick={generarQR}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="spinner w-5 h-5 border-2"></div>
                        <span>Generando QR...</span>
                      </>
                    ) : (
                      <>
                        <FiMapPin />
                        <span>Generar Código QR</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={reiniciar}
                    disabled={loading}
                    className="w-full btn-secondary"
                  >
                    Cambiar empleado
                  </button>
                </div>
              </div>
            )}

            {/* QR Generado */}
            {qrData && qrImage && (
              <div className="space-y-6">
                {/* Información del empleado y acción */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FiUser className="text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {qrData.empleado.nombreCompleto}
                    </h3>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    qrData.accion === 'INGRESO'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {qrData.accion === 'INGRESO' ? <FiLogIn className="mr-2" /> : <FiLogOut className="mr-2" />}
                    {qrData.accion}
                  </div>
                </div>

                {/* Código QR */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Escanea este código
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Desde tu dispositivo móvil
                    </p>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <img 
                      src={qrImage} 
                      alt="Código QR" 
                      className="w-64 h-64 border-4 border-gray-100 dark:border-gray-700 rounded-lg"
                    />
                  </div>

                  {/* Link para pruebas desde PC */}
                  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      O haz clic aquí para probar desde tu PC:
                    </p>
                    <a
                      href={qrData.qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all block px-4"
                    >
                      {qrData.qrUrl}
                    </a>
                  </div>
                </div>

                {/* Instrucción simple */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-center text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium">Escanea el código para registrar tu {qrData.accion.toLowerCase()}</p>
                  </div>
                </div>

                {/* Botón para generar nuevo QR */}
                <button
                  onClick={reiniciar}
                  className="w-full btn-secondary"
                >
                  Generar nuevo código
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
