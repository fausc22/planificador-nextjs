// hooks/useEmpleadoForm.js - Hook personalizado para manejar el formulario de empleados
import { useState } from 'react';

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

  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);

  /**
   * Actualiza un campo del formulario
   * @param {string} campo - Nombre del campo
   * @param {any} valor - Nuevo valor
   */
  const actualizarCampo = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  /**
   * Actualiza múltiples campos del formulario
   * @param {Object} campos - Objeto con los campos a actualizar
   */
  const actualizarCampos = (campos) => {
    setFormData(prev => ({
      ...prev,
      ...campos
    }));
  };

  /**
   * Resetea el formulario a los valores iniciales
   * @param {Object} empleado - Empleado para cargar datos (opcional)
   */
  const resetearFormulario = (empleado = null) => {
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
      if (empleado.foto_perfil_url) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/planificador';
        const baseUrl = apiUrl.replace(/\/planificador$/, '');
        setFotoPreview(`${baseUrl}${empleado.foto_perfil_url}`);
      } else {
        setFotoPreview(null);
      }
    } else {
      setFormData({ ...INITIAL_FORM_DATA });
      setFotoPreview(null);
    }
    setArchivoFoto(null);
  };

  /**
   * Maneja el cambio de foto
   * @param {File} archivo - Archivo de imagen
   * @param {Function} onError - Callback de error
   */
  const manejarCambioFoto = (archivo, onError = null) => {
    if (!archivo) return;

    // Validar tamaño (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      if (onError) {
        onError('La imagen no puede superar 5MB');
      }
      return;
    }

    setArchivoFoto(archivo);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result);
    };
    reader.onerror = () => {
      if (onError) {
        onError('Error al leer el archivo');
      }
    };
    reader.readAsDataURL(archivo);
  };

  /**
   * Limpia la foto
   */
  const limpiarFoto = () => {
    setArchivoFoto(null);
    setFotoPreview(null);
  };

  /**
   * Valida los campos obligatorios del formulario
   * @returns {Object} - { valido: boolean, errores: string[] }
   */
  const validarFormulario = () => {
    const errores = [];

    if (!formData.nombre || formData.nombre.trim() === '') {
      errores.push('El nombre es obligatorio');
    }
    if (!formData.apellido || formData.apellido.trim() === '') {
      errores.push('El apellido es obligatorio');
    }
    if (!formData.mail || formData.mail.trim() === '') {
      errores.push('El email es obligatorio');
    }
    if (!formData.fecha_ingreso || formData.fecha_ingreso.trim() === '') {
      errores.push('La fecha de ingreso es obligatoria');
    }
    if (!formData.hora_normal || formData.hora_normal === '') {
      errores.push('La tarifa por hora es obligatoria');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  };

  /**
   * Construye un FormData con todos los campos del formulario
   * @returns {FormData} - FormData listo para enviar
   */
  const construirFormData = () => {
    const formDataToSend = new FormData();

    // Campos obligatorios - asegurar que siempre tengan un valor
    formDataToSend.append('nombre', String(formData.nombre || '').trim());
    formDataToSend.append('apellido', String(formData.apellido || '').trim());
    formDataToSend.append('mail', String(formData.mail || '').trim());
    formDataToSend.append('fecha_ingreso', String(formData.fecha_ingreso || '').trim());
    formDataToSend.append('hora_normal', String(formData.hora_normal || '0'));

    // Campos opcionales
    formDataToSend.append('antiguedad', String(formData.antiguedad ?? 0));
    formDataToSend.append('dia_vacaciones', String(formData.dia_vacaciones ?? 14));
    formDataToSend.append('horas_vacaciones', String(formData.horas_vacaciones ?? 0));

    // Foto si existe
    if (archivoFoto) {
      formDataToSend.append('foto_perfil', archivoFoto);
    }

    return formDataToSend;
  };

  /**
   * Obtiene los valores del formulario como objeto plano (sin FormData)
   * Útil para logging o validación
   * @returns {Object} - Objeto con los valores del formulario
   */
  const obtenerValores = () => {
    return {
      nombre: String(formData.nombre || '').trim(),
      apellido: String(formData.apellido || '').trim(),
      mail: String(formData.mail || '').trim(),
      fecha_ingreso: String(formData.fecha_ingreso || '').trim(),
      hora_normal: String(formData.hora_normal || '0'),
      antiguedad: formData.antiguedad ?? 0,
      dia_vacaciones: formData.dia_vacaciones ?? 14,
      horas_vacaciones: formData.horas_vacaciones ?? 0
    };
  };

  return {
    formData,
    fotoPreview,
    archivoFoto,
    actualizarCampo,
    actualizarCampos,
    resetearFormulario,
    manejarCambioFoto,
    limpiarFoto,
    validarFormulario,
    construirFormData,
    obtenerValores
  };
}

