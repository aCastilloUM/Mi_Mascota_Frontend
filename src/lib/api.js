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

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
console.info("[api] baseURL =", baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true, // necesario para enviar/recibir cookies (refresh)
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
          .post("/auth/refresh") // el backend devuelve { accessToken }
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
