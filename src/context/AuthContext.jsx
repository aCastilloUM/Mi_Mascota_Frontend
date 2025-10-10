import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken, setOnTokenUpdate, isTokenExpired, register as apiRegister, login as apiLogin, loginWith2FA as apiLoginWith2FA } from "../lib/api";
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

  // Arranque: intentar refresh silencioso solo en páginas protegidas
  useEffect(() => {
    (async () => {
      const currentPath = window.location.pathname;
      const isPublicPage = currentPath === '/login' || 
                          currentPath === '/register' ||
                          currentPath === '/' ||
                          currentPath === '/onboarding';
      
      if (isPublicPage) {
        // En páginas públicas, no intentar refresh automático
        setBooting(false);
        return;
      }
      
      try {
        const { data } = await api.post("/api/v1/auth/refresh");
        setAccessToken(data?.access_token || null);
      } catch {
        setAccessToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    // Usar la función de login de api.js que maneja 2FA
    const result = await apiLogin(email, password);
    
    // Si requiere 2FA, devolver la información para el siguiente paso
    if (result.requires2FA) {
      return {
        requires2FA: true,
        tempToken: result.tempToken,
        message: result.message
      };
    }
    
    // Login exitoso sin 2FA
    return { 
      success: true,
      accessToken: result.accessToken,
      user: result.user 
    };
  };

  const loginWith2FA = async (tempToken, code) => {
    const { accessToken, user } = await apiLoginWith2FA(tempToken, code);
    return { 
      success: true,
      accessToken, 
      user 
    };
  };

  const register = async (userData) => {
    // Usar la función de registro de api.js que ya maneja el token
    const { accessToken, user } = await apiRegister(userData);
    // El token ya se setea automáticamente en apiRegister
    return { accessToken, user };
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout"); // backend borra cookie refresh
    } catch {}
    setAccessToken(null);
  };

  const isAuth = !!access && !isTokenExpired(access);

  const value = useMemo(
    () => ({ user, isAuth, login, loginWith2FA, register, logout, booting }),
    [user, isAuth, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
