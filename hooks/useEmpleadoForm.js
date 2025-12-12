// hooks/useEmpleadoForm.js - Hook personalizado para manejar el formulario de empleados
import { useState, useCallback } from 'react';
import { crearEmpleadoSchema, actualizarEmpleadoSchema } from '../validations/empleadoSchemas';

const INITIAL_FORM_DATA = {
  nombre: '',
  apellido: '',
  mail: '',
  fecha_ingreso: '',
  antiguedad: 0,
  hora_normal: '',
  dia_vacaciones: 14,
  horas_vacaciones: 0
};

/**
 * Hook personalizado para manejar el formulario de empleados
 * @param {Object} empleadoInicial - Datos iniciales del empleado (para edición)
 * @returns {Object} - Estado y funciones del formulario
 */
export function useEmpleadoForm(empleadoInicial = null) {
  const [formData, setFormData] = useState(() => {
    if (empleadoInicial) {
      return {
        nombre: empleadoInicial.nombre || '',
        apellido: empleadoInicial.apellido || '',
        mail: empleadoInicial.email || empleadoInicial.mail || '',
        fecha_ingreso: empleadoInicial.fecha_ingreso || '',
        antiguedad: empleadoInicial.antiguedad ?? 0,
        hora_normal: empleadoInicial.hora_normal || '',
        dia_vacaciones: empleadoInicial.dia_vacaciones ?? 14,
        horas_vacaciones: empleadoInicial.horas_vacaciones ?? 0
      };
    }
    return { ...INITIAL_FORM_DATA };
  });

  const [errors, setErrors] = useState({});

  /**
   * Actualiza un campo del formulario
   */
  const actualizarCampo = useCallback((campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Limpiar error del campo cuando se actualiza
    if (errors[campo]) {
      setErrors(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  }, [errors]);

  /**
   * Resetea el formulario a los valores iniciales
   */
  const resetearFormulario = useCallback((empleado = null) => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        mail: empleado.email || empleado.mail || '',
        fecha_ingreso: empleado.fecha_ingreso || '',
        antiguedad: empleado.antiguedad ?? 0,
        hora_normal: empleado.hora_normal || '',
        dia_vacaciones: empleado.dia_vacaciones ?? 14,
        horas_vacaciones: empleado.horas_vacaciones ?? 0
      });
    } else {
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setErrors({});
  }, []);

  /**
   * Valida el formulario con Zod
   */
  const validarFormulario = useCallback((esEdicion = false) => {
    try {
      if (esEdicion) {
        actualizarEmpleadoSchema.parse(formData);
      } else {
        crearEmpleadoSchema.parse(formData);
      }
      setErrors({});
      return { valido: true, errores: [] };
    } catch (error) {
      if (error.name === 'ZodError') {
        const erroresFormateados = {};
        error.errors.forEach(err => {
          const path = err.path[0];
          erroresFormateados[path] = err.message;
        });
        setErrors(erroresFormateados);
        return {
          valido: false,
          errores: error.errors.map(e => e.message)
        };
      }
      return {
        valido: false,
        errores: ['Error de validación']
      };
    }
  }, [formData]);

  /**
   * Obtiene los datos del formulario listos para enviar
   */
  const obtenerDatos = useCallback(() => {
    return {
      nombre: formData.nombre || '',
      apellido: formData.apellido || '',
      mail: formData.mail || '',
      fecha_ingreso: formData.fecha_ingreso || '',
      hora_normal: formData.hora_normal || '0',
      antiguedad: formData.antiguedad || 0,
      dia_vacaciones: formData.dia_vacaciones || 14,
      horas_vacaciones: formData.horas_vacaciones || 0
    };
  }, [formData]);

  return {
    formData,
    errors,
    actualizarCampo,
    resetearFormulario,
    validarFormulario,
    obtenerDatos
  };
}
