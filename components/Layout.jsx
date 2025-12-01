// components/Layout.jsx - Layout principal con navegación
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiHome, FiUsers, FiCalendar, FiClock, FiSun, FiMoon, 
  FiMenu, FiX, FiLogOut, FiSettings, FiDollarSign, FiStar 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      router.push('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Planificador', href: '/planificador', icon: FiCalendar },
    { name: 'Asistencia', href: '/logueos', icon: FiClock },
    { name: 'Control de Horas', href: '/control-horas', icon: FiClock },
    { name: 'Recibos', href: '/recibos', icon: FiDollarSign },
    { name: 'Pagos Extras', href: '/pagos-extras', icon: FiDollarSign },
    { name: 'Vacaciones', href: '/vacaciones', icon: FiCalendar },
    { name: 'Empleados', href: '/empleados', icon: FiUsers },
    { name: 'Turnos', href: '/turnos', icon: FiClock },
    { name: 'Feriados', href: '/feriados', icon: FiStar },
  ];

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-dark">
      {/* Navbar Superior */}
      <nav className="bg-white dark:bg-secondary-dark shadow-sm border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Menú Mobile */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-ternary-dark mr-2"
              >
                {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
              
              <Link href="/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  Planificador
                </span>
              </Link>
            </div>

            {/* Usuario y Acciones */}
            <div className="flex items-center space-x-4">
              {/* Toggle Tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
                aria-label="Cambiar tema"
              >
                {theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl" />}
              </button>

              {/* Usuario */}
              {user && (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.rol}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Cerrar sesión"
                  >
                    <FiLogOut className="text-xl" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-secondary-dark border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-40 overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-ternary-dark'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="text-xl" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido Principal */}
      <main className="lg:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

