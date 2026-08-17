/**
 * safeStorage — capa defensiva sobre localStorage.
 *
 * Permite leer y escribir JSON de forma segura sin romper la UI
 * e incluye validación opcional de estructura de datos.
 */

export function safeGetJSON(key, fallback, validator) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) return fallback;
    return parsed;
  } catch (err) {
    console.warn(`[safeStorage] No se pudo leer "${key}", usando valor por defecto.`, err);
    return fallback;
  }
}

export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[safeStorage] No se pudo escribir "${key}".`, err);
    return false;
  }
}

// Validadores de forma para las claves compartidas del bridge
export const isValidStats = (v) =>
  v && typeof v === 'object' &&
  typeof v.date === 'string' &&
  v.pos && typeof v.pos.ventas === 'number' && typeof v.pos.total === 'number' &&
  v.web && typeof v.web.pedidos === 'number' && typeof v.web.total === 'number';

export const isValidFeed = (v) => Array.isArray(v) && v.every((e) => e && typeof e === 'object');