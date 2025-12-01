// utils/tokenUtils.js - Utilidades para manejo de tokens JWT

/**
 * Decodifica un token JWT sin verificar la firma
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload decodificado o null si es inválido
 */
export function decodeToken(token) {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

/**
 * Verifica si un token JWT está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si está expirado, false si no
 */
export function isTokenExpired(token) {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp está en segundos, Date.now() está en milisegundos
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  // Considerar expirado si falta menos de 1 minuto (60 segundos)
  // Esto permite refrescar antes de que expire completamente
  return currentTime >= (expirationTime - 60000);
}

/**
 * Obtiene el tiempo restante hasta la expiración del token
 * @param {string} token - Token JWT
 * @returns {number} - Tiempo restante en milisegundos, 0 si está expirado
 */
export function getTokenTimeRemaining(token) {
  if (!token) return 0;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const remaining = expirationTime - currentTime;
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Verifica si hay un token válido (no expirado) en localStorage
 * @returns {boolean} - true si hay token válido, false si no
 */
export function hasValidToken() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  return !isTokenExpired(token);
}

/**
 * Limpia todos los tokens y datos de autenticación
 */
export function clearAuthData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

