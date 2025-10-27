// npm i axios jwt-decode
import axios from "axios";
import { jwtDecode } from "jwt-decode";

let accessToken = null;                   // en memoria
let onTokenUpdate = () => {};             // el AuthContext nos setea esto

export function setAccessToken(token) {
  accessToken = token;
  onTokenUpdate(token);
}

export function setOnTokenUpdate(fn) {
  onTokenUpdate = fn || (() => {});
}

export function getAccessToken() {
  return accessToken;
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    return !exp || Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL,
  withCredentials: true, // necesario para enviar/recibir cookies (refresh)
  timeout: 10000, // 10 segundos de timeout
});

// Agrega Authorization si hay token
api.interceptors.request.use((config) => {
  if (accessToken && !isTokenExpired(accessToken)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

// Intenta refresh en 401 automáticamente
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshing) {
        // Llama a /auth/refresh (envía cookie HttpOnly)
        refreshing = api
          .post("/api/v1/auth/refresh") // el backend devuelve { accessToken }
          .then(({ data }) => {
            setAccessToken(data?.accessToken || null);
            return data?.accessToken;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      try {
        const newAccess = await refreshing;
        if (newAccess) {
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original); // reintenta la petición original
        }
      } catch (refreshErr) {
        // El refresh falló (cookie inválida/expirada). Limpiar estado y forzar login.
        try {
          const msg = refreshErr?.response?.data?.detail?.message || refreshErr?.response?.data?.detail || refreshErr?.message || 'Sesión expirada';
          sessionStorage.setItem('auth:error', String(msg));
        } catch (e) {
          /* noop */
        }
        setAccessToken(null);
        // Redirigir al login para que el usuario ingrese credenciales nuevamente
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// ================================
// AUTH ENDPOINTS
// ================================

/**
 * Login con email y password
 * Puede requerir 2FA si el usuario lo tiene activado
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{accessToken?: string, user?: object, requires2FA?: boolean, tempToken?: string}>}
 */
export async function login(email, password) {
  const response = await api.post("/api/v1/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  
  // Verificar si el login requiere 2FA
  const requires2fa = response.data.requires_2fa || response.data.requires2FA || false;
  if (requires2fa) {
    // Backend may return different names for the temporary session token
    const tempToken = response.data.temp_token || response.data.temp_session_id || response.data.tempToken || response.data.tempSessionId || null;
    return {
      requires2FA: true,
      tempToken,
      message: response.data.message || response.data.detail || "Se requiere código 2FA"
    };
  }
  
  // Login normal (sin 2FA)
  const { access_token: accessToken, user } = response.data;
  
  if (accessToken) {
    setAccessToken(accessToken);
  } else {
    console.error("[api] No access_token in login response!");
  }
  
  return { accessToken, user };
}

/**
 * Completar login con código 2FA
 * @param {string} tempToken - Token temporal del primer paso
 * @param {string} code - Código TOTP de 6 dígitos
 * @returns {Promise<{accessToken: string, user: object}>}
 */
export async function loginWith2FA(tempToken, code) {
  // Send both common field names to be compatible with backend variations
  const payload = {
    temp_token: tempToken,
    temp_session_id: tempToken,
    code: code.trim(),
    token: code.trim(),
  };

  const response = await api.post("/api/v1/auth/login/2fa", payload);

  const { access_token: accessToken, accessToken: altAccessToken, user } = response.data;
  const finalAccess = accessToken || altAccessToken || null;
  
  if (finalAccess) setAccessToken(finalAccess);
  return { accessToken: finalAccess, user };
}

/**
 * Registro de nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<{accessToken: string, user: object}>}
 */
export async function register(userData) {
  try {
    const response = await api.post("/api/v1/auth/register", userData);

    // Preserve the full backend response so dev-only fields (like verification_token)
    // are not lost. If an access token is present, keep it in memory.
    const data = response.data || {};

    const accessToken = data.accessToken || data.access_token || null;
    if (accessToken) {
      setAccessToken(accessToken);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout del usuario actual
 */
export async function logout() {
  try {
    await api.post("/api/v1/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

/**
 * Reenviar email de verificación
 * @param {string} email - Email del usuario
 * @returns {Promise<object>} - Respuesta del servidor
 */
export async function resendVerificationEmail(email) {
  const response = await api.post("/api/v1/auth/resend-verification", { email });
  return response.data;
}

/**
 * Verificar email con token
 * @param {string} token - Token de verificación
 * @returns {Promise<object>} - Respuesta del servidor
 */
export async function verifyEmail(token) {
  const response = await api.post("/api/v1/auth/verify-email", { token });
  return response.data;
}

/**
 * Refresh del token de acceso
 * @returns {Promise<{accessToken: string}>}
 */
export async function refreshToken() {
  const response = await api.post("/auth/refresh");
  const { accessToken } = response.data;
  
  if (accessToken) {
    setAccessToken(accessToken);
  }
  
  return { accessToken };
}

// ================================
// PROFILE ENDPOINTS
// ================================

/**
 * Crear o actualizar perfil de usuario
 * @param {object} profileData - Datos del perfil
 * @returns {Promise<object>} - Perfil creado/actualizado
 */
export async function createOrUpdateProfile(profileData) {
  const response = await api.post("/api/v1/profiles", profileData);
  return response.data;
}

/**
 * Obtener perfil del usuario actual
 * @returns {Promise<object>} - Perfil del usuario
 */
export async function getCurrentProfile() {
  const response = await api.get("/api/v1/profiles/me");
  return response.data;
}

/**
 * Subir foto de perfil
 * @param {File} file - Archivo de imagen
 * @param {string} profileId - ID del perfil (opcional, si no se provee se obtiene el perfil actual)
 * @returns {Promise<{photo_url: string}>}
 */
export async function uploadProfilePhoto(file, profileId = null) {
  // Si no tenemos el ID del perfil, obtener el perfil actual
  if (!profileId) {
    const currentProfile = await getCurrentProfile();
    profileId = currentProfile.id;
  }
  
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post(`/api/v1/profiles/${profileId}/photo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

/**
 * Obtener lista de perfiles (paginada)
 * @param {number} page - Número de página
 * @param {number} size - Tamaño de página
 * @returns {Promise<object>} - Lista paginada de perfiles
 */
export async function getProfiles(page = 1, size = 20) {
  const response = await api.get("/api/v1/profiles", {
    params: { page, size },
  });
  return response.data;
}

// ================================
// 2FA ENDPOINTS
// ================================

/**
 * Obtener estado de 2FA del usuario actual
 * @returns {Promise<{is_enabled: boolean, backup_codes_count: number}>}
 */
export async function get2FAStatus() {
  const response = await api.get("/api/v1/2fa/status");
  return response.data;
}

/**
 * Activar 2FA - Paso 1: Generar QR code
 * @returns {Promise<{secret: string, qr_code: string, backup_codes: string[]}>}
 */
export async function enable2FA() {
  const response = await api.post("/api/v1/2fa/enable");
  return response.data;
}

/**
 * Verificar setup de 2FA - Paso 2: Confirmar con código TOTP
 * @param {string} secret - Secret temporal que se generó en el paso de enable
 * @param {string} code - Código de 6 dígitos del authenticator
 * @returns {Promise<{message: string, backup_codes: string[]}>}
 */
export async function verify2FASetup(secret, code) {
  const response = await api.post("/api/v1/2fa/verify-setup", {
    secret: secret,
    token: (code || "").trim(),
  });
  return response.data;
}

/**
 * Desactivar 2FA
 * @param {string} code - Código TOTP actual para confirmar
 * @returns {Promise<{message: string}>}
 */
export async function disable2FA(code) {
  const response = await api.post("/api/v1/2fa/disable", {
    code: code.trim(),
  });
  return response.data;
}

/**
 * Regenerar códigos de backup
 * @param {string} code - Código TOTP actual para confirmar
 * @returns {Promise<{backup_codes: string[], message: string}>}
 */
export async function regenerateBackupCodes(code) {
  const response = await api.post("/api/v1/2fa/regenerate-backup-codes", {
    code: code.trim(),
  });
  return response.data;
}
