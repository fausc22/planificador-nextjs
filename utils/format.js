// utils/format.js - Utilidades de formateo

/**
 * Formatea número como moneda
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatea número con separador de miles
 */
export function formatNumber(number) {
  if (!number && number !== 0) return '0';
  return new Intl.NumberFormat('es-AR').format(number);
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Capitaliza primera letra
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formatea nombre completo
 */
export function formatFullName(nombre, apellido) {
  return `${nombre} ${apellido}`.trim();
}

