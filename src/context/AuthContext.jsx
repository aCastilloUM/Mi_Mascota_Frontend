import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken, setOnTokenUpdate, isTokenExpired } from "../lib/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

function userFrom(token) {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    // adapta estos campos a tu JWT
    return { id: payload.sub, email: payload.email, roles: payload.roles || [] };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true); // intentando refresh al cargar

  // Mantener sincronizado api.js -> contexto
  useEffect(() => {
    setOnTokenUpdate((t) => {
      setAccess(t);
      setUser(userFrom(t));
    });
    return () => setOnTokenUpdate(null);
  }, []);

  // Arranque: intentar refresh silencioso (usa cookie HttpOnly de refresh)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh"); // si hay cookie válida
        setAccessToken(data?.accessToken || null);
      } catch {
        setAccessToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    // El backend debería:
    // 1) setear refresh token en cookie HttpOnly Secure (Set-Cookie)
    // 2) devolver { accessToken }
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data?.accessToken || null);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // backend borra cookie refresh
    } catch {}
    setAccessToken(null);
  };

  const isAuth = !!access && !isTokenExpired(access);

  const value = useMemo(
    () => ({ user, isAuth, login, logout, booting }),
    [user, isAuth, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
