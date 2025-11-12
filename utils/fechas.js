// utils/fechas.js - Utilidades para manejo de fechas

/**
 * Convierte fecha de DD/MM/YYYY a objeto Date
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
}

/**
 * Formatea Date a DD/MM/YYYY
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Obtiene la fecha actual en formato DD/MM/YYYY
 */
export function getCurrentDate() {
  return formatDate(new Date());
}

/**
 * Nombres de meses en español
 */
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Nombres de días en español
 */
export const DIAS_SEMANA = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

/**
 * Obtiene el nombre del mes
 */
export function getNombreMes(numeroMes) {
  return MESES[numeroMes - 1] || '';
}

/**
 * Obtiene el número del mes desde el nombre
 */
export function getNumeroMes(nombreMes) {
  const index = MESES.findIndex(m => m.toUpperCase() === nombreMes.toUpperCase());
  return index >= 0 ? index + 1 : 1;
}

/**
 * Valida formato de fecha DD/MM/YYYY
 */
export function validarFecha(fecha) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(fecha);
}

