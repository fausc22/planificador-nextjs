// pages/usuarios/index.jsx - Gestión de usuarios del sistema
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { FiUser, FiPlus, FiEdit, FiTrash2, FiX, FiLock, FiCheck, FiXCircle, FiShield, FiUserCheck, FiUserX } from 'react-icons/fi';
import { usuariosAPI, empleadosAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  // Modal principal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'user',
    empleado_id: ''
  });

  // Modal para cambiar contraseña
  const [modalPassword, setModalPassword] = useState(false);
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  useEffect(() => {
    cargarUsuarios();
    cargarEmpleados();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await usuariosAPI.obtenerTodos();
      
      if (response.data.success) {
        setUsuarios(response.data.usuarios || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar usuarios');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const response = await empleadosAPI.obtenerTodos();
      if (response.data.success) {
        setEmpleados(response.data.empleados || []);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        usuario: usuario.usuario,
        password: '',
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        rol: usuario.rol,
        empleado_id: usuario.empleado_id || ''
      });
    } else {
      setUsuarioEditando(null);
      setFormData({
        usuario: '',
        password: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'user',
        empleado_id: ''
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setFormData({
      usuario: '',
      password: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      rol: 'user',
      empleado_id: ''
    });
  };

  const abrirModalPassword = (usuario) => {
    setUsuarioPassword(usuario);
    setNuevaPassword('');
    setConfirmarPassword('');
    setModalPassword(true);
  };

  const cerrarModalPassword = () => {
    setModalPassword(false);
    setUsuarioPassword(null);
    setNuevaPassword('');
    setConfirmarPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.usuario || !formData.nombre || !formData.apellido || !formData.rol) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    if (!usuarioEditando && !formData.password) {
      toast.error('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const datosEnviar = { ...formData };
      
      // Si es edición y no hay password, no enviarlo
      if (usuarioEditando && !datosEnviar.password) {
        delete datosEnviar.password;
        delete datosEnviar.usuario; // No se puede cambiar el usuario
      }

      // Convertir empleado_id a número o null
      if (datosEnviar.empleado_id === '' || datosEnviar.empleado_id === null) {
        datosEnviar.empleado_id = null;
      } else {
        datosEnviar.empleado_id = parseInt(datosEnviar.empleado_id);
      }

      if (usuarioEditando) {
        await usuariosAPI.actualizar(usuarioEditando.id, datosEnviar);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await usuariosAPI.crear(datosEnviar);
        toast.success('Usuario creado exitosamente');
      }
      
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    
    if (!nuevaPassword || nuevaPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await usuariosAPI.cambiarPassword(usuarioPassword.id, nuevaPassword);
      toast.success('Contraseña actualizada exitosamente');
      cerrarModalPassword();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handleToggleActivo = async (usuario) => {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'habilitar' : 'deshabilitar';
    
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} al usuario "${usuario.usuario}"?`)) {
      return;
    }

    try {
      await usuariosAPI.toggleActivo(usuario.id, nuevoEstado);
      toast.success(`Usuario ${accion}do exitosamente`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error(error.response?.data?.message || `Error al ${accion} usuario`);
    }
  };

  const handleEliminar = async (usuario) => {
    if (!confirm(`¿Eliminar al usuario "${usuario.usuario}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await usuariosAPI.eliminar(usuario.id);
      toast.success('Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const busquedaLower = busqueda.toLowerCase();
    return (
      u.usuario.toLowerCase().includes(busquedaLower) ||
      u.nombre.toLowerCase().includes(busquedaLower) ||
      u.apellido.toLowerCase().includes(busquedaLower) ||
      (u.email && u.email.toLowerCase().includes(busquedaLower)) ||
      u.rol.toLowerCase().includes(busquedaLower)
    );
  });

  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const usuariosInactivos = usuarios.filter(u => !u.activo).length;
  const gerentes = usuarios.filter(u => u.rol === 'gerente').length;
  const users = usuarios.filter(u => u.rol === 'user').length;

  return (
    <>
      <Head>
        <title>Usuarios - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Usuarios
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Gestión de usuarios del sistema
              </p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2"
            >
              <FiPlus />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Estadísticas */}
          {!loading && usuarios.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Usuarios
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {usuarios.length}
                    </p>
                  </div>
                  <FiUser className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Activos
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {usuariosActivos}
                    </p>
                  </div>
                  <FiUserCheck className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Inactivos
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {usuariosInactivos}
                    </p>
                  </div>
                  <FiUserX className="text-3xl text-red-500" />
                </div>
              </div>

              <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Gerentes / Users
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {gerentes} / {users}
                    </p>
                  </div>
                  <FiShield className="text-3xl text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Búsqueda */}
          <div className="card mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Buscar por usuario, nombre, email o rol..."
                />
              </div>
            </div>
          </div>

          {/* Tabla de Usuarios - Desktop */}
          <div className="card overflow-x-auto hidden md:block">
            {loading ? (
              <Loading />
            ) : usuariosFiltrados.length === 0 ? (
              <EmptyState
                icon={FiUser}
                title="No hay usuarios"
                description={busqueda ? 'No se encontraron usuarios con ese criterio de búsqueda' : 'No hay usuarios registrados en el sistema'}
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Empleado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiUser className="text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{usuario.usuario}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {usuario.nombre} {usuario.apellido}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usuario.email || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usuario.telefono || '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${usuario.rol === 'gerente' ? 'badge-warning' : 'badge-info'}`}>
                          {usuario.rol === 'gerente' ? 'Gerente' : 'User'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usuario.empleado_nombre ? `${usuario.empleado_nombre} ${usuario.empleado_apellido || ''}` : '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                          {usuario.activo ? (
                            <>
                              <FiCheck className="inline mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <FiXCircle className="inline mr-1" />
                              Inactivo
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => abrirModal(usuario)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => abrirModalPassword(usuario)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                            title="Cambiar contraseña"
                          >
                            <FiLock />
                          </button>
                          <button
                            onClick={() => handleToggleActivo(usuario)}
                            className={`p-2 rounded transition-colors ${
                              usuario.activo
                                ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title={usuario.activo ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {usuario.activo ? <FiUserX /> : <FiUserCheck />}
                          </button>
                          <button
                            onClick={() => handleEliminar(usuario)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Cards de Usuarios - Mobile */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <Loading />
            ) : usuariosFiltrados.length === 0 ? (
              <EmptyState
                icon={FiUser}
                title="No hay usuarios"
                description={busqueda ? 'No se encontraron usuarios con ese criterio de búsqueda' : 'No hay usuarios registrados en el sistema'}
              />
            ) : (
              usuariosFiltrados.map((usuario) => (
                <div key={usuario.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiUser className="text-blue-500 text-xl" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {usuario.usuario}
                        </h3>
                      </div>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {usuario.nombre} {usuario.apellido}
                      </p>
                    </div>
                    <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.activo ? (
                        <>
                          <FiCheck className="inline mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <FiXCircle className="inline mr-1" />
                          Inactivo
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-20">Email:</span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">
                        {usuario.email || '-'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-20">Teléfono:</span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">
                        {usuario.telefono || '-'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-20">Rol:</span>
                      <span className={`badge ${usuario.rol === 'gerente' ? 'badge-warning' : 'badge-info'}`}>
                        {usuario.rol === 'gerente' ? 'Gerente' : 'User'}
                      </span>
                    </div>
                    {usuario.empleado_nombre && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400 w-20">Empleado:</span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">
                          {usuario.empleado_nombre} {usuario.empleado_apellido || ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => abrirModal(usuario)}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      <FiEdit className="inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => abrirModalPassword(usuario)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <FiLock className="inline mr-1" />
                      Password
                    </button>
                    <button
                      onClick={() => handleToggleActivo(usuario)}
                      className={`flex-1 text-sm py-2 rounded-lg font-medium ${
                        usuario.activo
                          ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
                      }`}
                    >
                      {usuario.activo ? (
                        <>
                          <FiUserX className="inline mr-1" />
                          Deshabilitar
                        </>
                      ) : (
                        <>
                          <FiUserCheck className="inline mr-1" />
                          Habilitar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEliminar(usuario)}
                      className="flex-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-lg font-medium text-sm py-2"
                    >
                      <FiTrash2 className="inline mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de Crear/Editar Usuario */}
        <Modal
          isOpen={modalAbierto}
          onClose={cerrarModal}
          title={usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Usuario */}
            <Input
              label="Usuario"
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              disabled={!!usuarioEditando}
              required
              helperText={usuarioEditando ? 'El usuario no se puede modificar' : 'Solo letras, números y guiones bajos'}
            />

            {/* Contraseña */}
            <Input
              label={usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!usuarioEditando}
              helperText="Mínimo 6 caracteres"
            />

            {/* Nombre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                containerClassName="mb-0"
              />
              <Input
                label="Apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
                containerClassName="mb-0"
              />
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                containerClassName="mb-0"
              />
              <Input
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                containerClassName="mb-0"
              />
            </div>

            {/* Rol */}
            <Select
              label="Rol"
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              required
            >
              <option value="user">User (Acceso limitado)</option>
              <option value="gerente">Gerente (Acceso completo)</option>
            </Select>

            {/* Empleado asociado */}
            <Select
              label="Empleado Asociado (opcional)"
              value={formData.empleado_id}
              onChange={(e) => setFormData({ ...formData, empleado_id: e.target.value })}
            >
              <option value="">Sin empleado asociado</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </Select>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1 w-full sm:w-auto">
                {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
              </Button>
              <Button type="button" onClick={cerrarModal} variant="secondary" className="flex-1 w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Cambiar Contraseña */}
        <Modal
          isOpen={modalPassword}
          onClose={cerrarModalPassword}
          title={`Cambiar Contraseña - ${usuarioPassword?.usuario}`}
          size="md"
        >
          <form onSubmit={handleCambiarPassword} className="space-y-4 sm:space-y-6">
            <Input
              label="Nueva Contraseña"
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
              helperText="Mínimo 6 caracteres"
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1 w-full sm:w-auto">
                Cambiar Contraseña
              </Button>
              <Button type="button" onClick={cerrarModalPassword} variant="secondary" className="flex-1 w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      </Layout>
    </>
  );
}

