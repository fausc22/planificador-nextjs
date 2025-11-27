// pages/probar-whatsapp.jsx - Página simple para probar WhatsApp
import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { FiSend, FiRefreshCw, FiMessageCircle } from 'react-icons/fi';
import { notificacionesAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function ProbarWhatsApp() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleEnviar = async () => {
    try {
      setEnviando(true);
      const mensajeEnviar = mensaje.trim() || null;
      const response = await notificacionesAPI.enviarMensajePrueba(mensajeEnviar);
      
      if (response.data.success) {
        toast.success('Mensaje enviado exitosamente por WhatsApp');
        setMensaje('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al enviar mensaje';
      toast.error(errorMsg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Probar WhatsApp - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <FiMessageCircle className="text-3xl text-green-600" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Probar WhatsApp
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Envía un mensaje de prueba a tu número configurado en ADMIN_PHONE
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje personalizado
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escribe tu mensaje de prueba aquí... (opcional)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Si dejas el campo vacío, se enviará un mensaje de prueba predeterminado.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={enviando}
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleEnviar}
                    disabled={enviando}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {enviando ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <FiSend />
                        <span>Enviar Mensaje</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Nota:</strong> La primera vez que uses esta función, WhatsApp se conectará y mostrará un código QR en la terminal del servidor. 
                    Escanéalo con tu teléfono. Después de enviar el mensaje, WhatsApp se desconectará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

