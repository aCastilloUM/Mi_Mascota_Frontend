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

      const newAccess = await refreshing;
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original); // reintenta la petición original
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
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{accessToken: string, user: object}>}
 */
export async function login(email, password) {
  const response = await api.post("/api/v1/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  
  // El backend devuelve access_token (snake_case), no accessToken (camelCase)
  const { access_token: accessToken, user } = response.data;
  
  if (accessToken) {
    setAccessToken(accessToken);
  } else {
    console.error("[api] No access_token in login response!");
  }
  
  return { accessToken, user };
}

/**
 * Registro de nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<{accessToken: string, user: object}>}
 */
export async function register(userData) {
  try {
    const response = await api.post("/api/v1/auth/register", userData);
    
    const { accessToken, user } = response.data;
    
    if (accessToken) {
      setAccessToken(accessToken);
    } else {
      console.error("[api] No accessToken in response!");
    }
    
    return { accessToken, user };
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
