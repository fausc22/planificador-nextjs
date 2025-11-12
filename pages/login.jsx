// pages/login.jsx - Página de inicio de sesión
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await login(formData.username, formData.password, formData.remember);
      toast.success('¡Bienvenido!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión - Planificador</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary-dark dark:to-secondary-dark px-4">
        <div className="max-w-md w-full">
          {/* Card de Login */}
          <div className="card animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiUser className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Planificador
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sistema de Gestión de Empleados
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Ingresa tu usuario"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Ingresa tu contraseña"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Recordarme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Recordarme (7 días)
                  </label>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5 border-2"></div>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Sistema de Planificación v2.0</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>© 2024 Planificador de Empleados. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </>
  );
}

