/**
 * hash.js — hash de contraseñas en el navegador con Web Crypto API.
 *
 * Reemplaza el `password: '12345678'` en texto plano del original por
 * un hash SHA-256 con salt aleatorio por usuario (patrón salted hash).
 * Nunca se guarda ni se compara la contraseña en texto plano: al hacer
 * login se recalcula el hash con el mismo salt y se comparan los hashes.
 *
 * Límite honesto: esto sigue corriendo 100% en el navegador del cliente,
 * sin backend. No es equivalente a bcrypt/argon2 en un servidor real,
 * y alguien con acceso al propio navegador igual puede leer el hash
 * guardado en localStorage. Lo que sí evita es la exposición trivial de
 * contraseñas en texto plano (por error, captura de pantalla, backup,
 * export de datos, etc.) y hace inútil una copia simple del storage
 * para "iniciar sesión como" otro usuario sin más esfuerzo.
 */

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSaltHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bufferToHex(arr.buffer);
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}

/** Genera { salt, hash } a partir de una contraseña en texto plano. */
export async function hashPassword(plainPassword) {
  const salt = randomSaltHex();
  const hash = await sha256Hex(salt + plainPassword);
  return { salt, hash };
}

/** Verifica una contraseña en texto plano contra un { salt, hash } guardado. */
export async function verifyPassword(plainPassword, salt, hash) {
  if (!salt || !hash) return false;
  const attemptHash = await sha256Hex(salt + plainPassword);
  return attemptHash === hash;
}
