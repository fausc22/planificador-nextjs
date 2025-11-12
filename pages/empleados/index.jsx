// pages/empleados/index.jsx - Gestión completa de empleados
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { empleadosAPI } from '../../utils/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser, FiMail, FiCalendar, FiDollarSign, FiX, FiSave, FiUpload, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');
  const [vistaCards, setVistaCards] = useState(true);
  
  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    fecha_ingreso: '',
    antiguedad: 0,
    hora_normal: '',
    dia_vacaciones: 14,
    horas_vacaciones: 0
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const response = await empleadosAPI.obtenerTodos();
      
      if (response.data.success) {
        setEmpleados(response.data.empleados || []);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (empleado = null) => {
    if (empleado) {
      setEmpleadoEditando(empleado);
      setFormData({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        mail: empleado.email || empleado.mail,
        fecha_ingreso: empleado.fecha_ingreso,
        antiguedad: empleado.antiguedad,
        hora_normal: empleado.hora_normal,
        dia_vacaciones: empleado.dia_vacaciones,
        horas_vacaciones: empleado.horas_vacaciones || 0
      });
      if (empleado.foto_perfil_url) {
        setFotoPreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${empleado.foto_perfil_url}`);
      }
    } else {
      setEmpleadoEditando(null);
      setFormData({
        nombre: '',
        apellido: '',
        mail: '',
        fecha_ingreso: new Date().toLocaleDateString('es-AR').replace(/\//g, '/'),
        antiguedad: 0,
        hora_normal: '',
        dia_vacaciones: 14,
        horas_vacaciones: 0
      });
      setFotoPreview(null);
      setArchivoFoto(null);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEmpleadoEditando(null);
    setFotoPreview(null);
    setArchivoFoto(null);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar 5MB');
        return;
      }
      
      setArchivoFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.mail || !formData.hora_normal) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (archivoFoto) {
        formDataToSend.append('foto_perfil', archivoFoto);
      }

      if (empleadoEditando) {
        await empleadosAPI.actualizar(empleadoEditando.id, formDataToSend);
        toast.success('Empleado actualizado exitosamente');
      } else {
        const response = await empleadosAPI.crear(formDataToSend);
        if (response.data.turnosGenerados) {
          toast.success('Empleado creado con turnos 2024-2027 generados');
        } else {
          toast.success('Empleado creado exitosamente');
        }
      }
      
      cerrarModal();
      cargarEmpleados();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      toast.error(error.response?.data?.message || 'Error al guardar empleado');
    }
  };

  const handleEliminar = async (id, nombre, apellido) => {
    if (!confirm(`¿Eliminar a ${nombre} ${apellido}?\n\nSe eliminarán todos sus turnos asignados.`)) {
      return;
    }

    try {
      await empleadosAPI.eliminar(id);
      toast.success('Empleado eliminado exitosamente');
      cargarEmpleados();
    } catch (error) {
      toast.error('Error al eliminar empleado');
    }
  };

  const ordenarEmpleados = (campo) => {
    if (ordenarPor === campo) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdenDireccion('asc');
    }
  };

  const empleadosFiltrados = empleados
    .filter(emp =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(busqueda.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[ordenarPor];
      const bVal = b[ordenarPor];
      
      if (ordenDireccion === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getFotoUrl = (empleado) => {
    if (empleado.foto_perfil_url) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${empleado.foto_perfil_url}`;
    }
    return null;
  };

  return (
    <>
      <Head>
        <title>Empleados - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Empleados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {empleados.length} empleados activos
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setVistaCards(true)}
                  className={`p-2 rounded ${vistaCards ? 'bg-white dark:bg-secondary-dark shadow' : ''}`}
                  title="Vista Cards"
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setVistaCards(false)}
                  className={`p-2 rounded ${!vistaCards ? 'bg-white dark:bg-secondary-dark shadow' : ''}`}
                  title="Vista Tabla"
                >
                  <FiList />
                </button>
            </div>

            <button
                onClick={() => abrirModal()}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Nuevo Empleado</span>
            </button>
            </div>
          </div>

          {/* Barra de búsqueda y ordenamiento */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              
              <select
                value={ordenarPor}
                onChange={(e) => ordenarEmpleados(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-secondary-dark dark:border-gray-600"
              >
                <option value="nombre">Ordenar por Nombre</option>
                <option value="apellido">Ordenar por Apellido</option>
                <option value="fecha_ingreso">Ordenar por Antigüedad</option>
                <option value="hora_normal">Ordenar por Tarifa</option>
              </select>
            </div>
          </div>

          {/* Contenido */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="spinner"></div>
              </div>
            ) : empleadosFiltrados.length === 0 ? (
              <div className="card text-center py-12">
                <FiUser className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {busqueda ? 'No se encontraron empleados' : 'No hay empleados registrados'}
                </p>
                {!busqueda && (
                  <button
                    onClick={() => abrirModal()}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Crear Primer Empleado</span>
                  </button>
                )}
              </div>
            ) : vistaCards ? (
              /* VISTA CARDS */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {empleadosFiltrados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    {/* Foto de perfil */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        {getFotoUrl(empleado) ? (
                          <img
                            src={getFotoUrl(empleado)}
                            alt={`${empleado.nombre} ${empleado.apellido}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${empleado.nombre}+${empleado.apellido}&size=200&background=4299E1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-100 dark:border-blue-900">
                            {empleado.nombre[0]}{empleado.apellido[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {empleado.nombre} {empleado.apellido}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-1">
                        <FiMail size={14} />
                        {empleado.email || empleado.mail}
                      </p>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FiCalendar size={14} />
                          Ingreso:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {empleado.fecha_ingreso}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          Antigüedad:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {empleado.antiguedad} {empleado.antiguedad === 1 ? 'año' : 'años'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FiDollarSign size={14} />
                          Tarifa/hora:
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          ${empleado.hora_normal}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          Vacaciones:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {empleado.dia_vacaciones} días
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => abrirModal(empleado)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <FiEdit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(empleado.id, empleado.nombre, empleado.apellido)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* VISTA TABLA */
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('nombre')}>
                          Nombre {ordenarPor === 'nombre' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('apellido')}>
                          Apellido {ordenarPor === 'apellido' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="hidden md:table-cell">Email</th>
                        <th className="hidden lg:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('fecha_ingreso')}>
                          Fecha Ingreso {ordenarPor === 'fecha_ingreso' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="hidden lg:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => ordenarEmpleados('hora_normal')}>
                          Tarifa/hora {ordenarPor === 'hora_normal' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="hidden xl:table-cell">Vacaciones</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosFiltrados.map((empleado) => (
                        <tr key={empleado.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              {getFotoUrl(empleado) ? (
                                <img
                                  src={getFotoUrl(empleado)}
                                  alt={empleado.nombre}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${empleado.nombre}+${empleado.apellido}&size=100&background=4299E1&color=fff`;
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                  {empleado.nombre[0]}
                                </div>
                              )}
                              <span className="font-medium">{empleado.nombre}</span>
                            </div>
                          </td>
                          <td className="font-medium">{empleado.apellido}</td>
                          <td className="hidden md:table-cell text-gray-600 dark:text-gray-400 text-sm">
                            {empleado.email || empleado.mail}
                          </td>
                          <td className="hidden lg:table-cell">
                            {empleado.fecha_ingreso}
                          </td>
                          <td className="hidden lg:table-cell">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                            ${empleado.hora_normal}
                            </span>
                          </td>
                          <td className="hidden xl:table-cell text-center">
                            {empleado.dia_vacaciones} días
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => abrirModal(empleado)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleEliminar(empleado.id, empleado.nombre, empleado.apellido)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL CREAR/EDITAR */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado'}
                  </h2>
                  <button
                    onClick={cerrarModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Foto de perfil */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Foto de Perfil
                      </label>
                      <div className="flex items-center gap-4">
                        {fotoPreview ? (
                          <img
                            src={fotoPreview}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FiUser className="text-3xl text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFotoChange}
                            className="hidden"
                            id="foto-input"
                          />
                          <label
                            htmlFor="foto-input"
                            className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
                          >
                            <FiUpload />
                            Subir Foto
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Máximo 5MB. Formatos: JPG, PNG, GIF, WEBP
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="input w-full"
                        required
                      />
                    </div>

                    {/* Apellido */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                        className="input w-full"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.mail}
                        onChange={(e) => setFormData(prev => ({ ...prev, mail: e.target.value }))}
                        className="input w-full"
                        required
                      />
                    </div>

                    {/* Fecha de ingreso */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Fecha de Ingreso *
                      </label>
                      <input
                        type="text"
                        value={formData.fecha_ingreso}
                        onChange={(e) => setFormData(prev => ({ ...prev, fecha_ingreso: e.target.value }))}
                        placeholder="DD/MM/YYYY"
                        className="input w-full"
                        required
                      />
                    </div>

                    {/* Hora normal (tarifa) */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Tarifa por Hora * ($)
                      </label>
                      <input
                        type="number"
                        value={formData.hora_normal}
                        onChange={(e) => setFormData(prev => ({ ...prev, hora_normal: e.target.value }))}
                        className="input w-full"
                        min="0"
                        required
                      />
                    </div>

                    {/* Días de vacaciones */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Días de Vacaciones
                      </label>
                      <input
                        type="number"
                        value={formData.dia_vacaciones}
                        onChange={(e) => setFormData(prev => ({ ...prev, dia_vacaciones: e.target.value }))}
                        className="input w-full"
                        min="0"
                      />
                    </div>

                    {/* Antigüedad */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Antigüedad (años)
                      </label>
                      <input
                        type="number"
                        value={formData.antiguedad}
                        onChange={(e) => setFormData(prev => ({ ...prev, antiguedad: e.target.value }))}
                        className="input w-full"
                        min="0"
                      />
                    </div>

                    {/* Tarifa hora vacaciones */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Tarifa Hora Vacaciones ($)
                      </label>
                      <input
                        type="number"
                        value={formData.horas_vacaciones}
                        onChange={(e) => setFormData(prev => ({ ...prev, horas_vacaciones: e.target.value }))}
                        className="input w-full"
                        min="0"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  {/* Info sobre generación de turnos */}
                  {!empleadoEditando && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        ℹ️ Al crear el empleado se generarán automáticamente los turnos para los años <strong>2024-2027</strong> (aproximadamente 1,460 días).
                      </p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <FiSave />
                      {empleadoEditando ? 'Actualizar Empleado' : 'Crear Empleado'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
