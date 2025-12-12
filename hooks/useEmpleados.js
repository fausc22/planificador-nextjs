// hooks/useEmpleados.js - Hook personalizado para manejar empleados
import { useState, useEffect, useCallback } from 'react';
import { empleadosAPI, apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import { crearEmpleadoSchema, actualizarEmpleadoSchema } from '../validations/empleadoSchemas';

export function useEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar empleados
  const cargarEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await empleadosAPI.obtenerTodos();
      
      if (response.data.success) {
        setEmpleados(response.data.empleados || []);
      }
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError(err.response?.data?.message || 'Error al cargar empleados');
      toast.error(err.response?.data?.message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear empleado
  const crearEmpleado = useCallback(async (datos) => {
    try {
      // Validar con Zod
      const datosValidados = crearEmpleadoSchema.parse(datos);
      
      const response = await empleadosAPI.crear(datosValidados);
      
      if (response.data.success) {
        toast.success(response.data.turnosGenerados 
          ? 'Empleado creado con turnos 2024-2027 generados'
          : 'Empleado creado exitosamente'
        );
        await cargarEmpleados();
        return response.data;
      }
    } catch (err) {
      if (err.name === 'ZodError') {
        const primerError = err.errors[0];
        toast.error(primerError?.message || 'Datos inválidos');
        throw err;
      }
      console.error('Error al crear empleado:', err);
      toast.error(err.response?.data?.message || 'Error al crear empleado');
      throw err;
    }
  }, [cargarEmpleados]);

  // Actualizar empleado
  const actualizarEmpleado = useCallback(async (id, datos) => {
    try {
      // Validar con Zod
      const datosValidados = actualizarEmpleadoSchema.parse(datos);
      
      const response = await empleadosAPI.actualizar(id, datosValidados);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Empleado actualizado exitosamente');
        await cargarEmpleados();
        return response.data;
      }
    } catch (err) {
      if (err.name === 'ZodError') {
        const primerError = err.errors[0];
        toast.error(primerError?.message || 'Datos inválidos');
        throw err;
      }
      console.error('Error al actualizar empleado:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar empleado');
      throw err;
    }
  }, [cargarEmpleados]);

  // Actualizar foto de empleado
  const actualizarFotoEmpleado = useCallback(async (id, archivoFoto) => {
    try {
      const formData = new FormData();
      formData.append('foto', archivoFoto);
      
      // NO establecer Content-Type manualmente - axios lo hace automáticamente para FormData
      const response = await apiClient.patch(`/empleados/${id}/foto`, formData);
      
      if (response.data.success) {
        toast.success('Foto actualizada exitosamente');
        await cargarEmpleados();
        return response.data;
      }
    } catch (err) {
      console.error('Error al actualizar foto:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar foto');
      throw err;
    }
  }, [cargarEmpleados]);

  // Eliminar empleado
  const eliminarEmpleado = useCallback(async (id) => {
    try {
      const response = await empleadosAPI.eliminar(id);
      
      if (response.data.success) {
        toast.success('Empleado eliminado exitosamente');
        await cargarEmpleados();
        return response.data;
      }
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
      toast.error(err.response?.data?.message || 'Error al eliminar empleado');
      throw err;
    }
  }, [cargarEmpleados]);

  // Cargar empleados al montar
  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  return {
    empleados,
    loading,
    error,
    cargarEmpleados,
    crearEmpleado,
    actualizarEmpleado,
    actualizarFotoEmpleado,
    eliminarEmpleado
  };
}
