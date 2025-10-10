import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook para manejar la lógica común de formularios de autenticación
 * Centraliza el estado de loading, errores, y navegación
 */
export const useAuthForm = ({
  onSubmit,
  redirectTo = "/home",
  successMessage = null
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(successMessage || "");

  const handleSubmit = async (data) => {
    if (!onSubmit) {
      console.error("useAuthForm: onSubmit function is required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await onSubmit(data);
      
      if (result?.successMessage) {
        setSuccess(result.successMessage);
      }

      if (result?.redirectTo || redirectTo) {
        setTimeout(() => {
          navigate(result?.redirectTo || redirectTo, { 
            replace: true,
            state: result?.state || {}
          });
        }, result?.delay || 0);
      }

      return result;
    } catch (e) {
      console.error("[useAuthForm] Error:", e);
      
      // Manejo específico de errores de autenticación
      const errorMessage = getErrorMessage(e);
      setError(errorMessage);
      
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return {
    loading,
    error,
    success,
    handleSubmit,
    clearError,
    clearSuccess,
    clearMessages,
    setError,
    setSuccess,
    setLoading
  };
};

/**
 * Función para mapear errores de API a mensajes user-friendly
 */
const getErrorMessage = (error) => {
  if (!error.response) {
    return "🌐 Error de conexión. Verificá tu conexión a internet";
  }

  const status = error.response.status;
  const data = error.response.data;

  switch (status) {
    case 400:
      return data?.detail || "❌ Datos inválidos. Por favor, verificá la información ingresada";
    
    case 401:
      return "❌ Email o contraseña incorrectos";
    
    case 403:
      return "❌ Acceso denegado. Tu cuenta puede estar deshabilitada";
    
    case 404:
      return "❌ Servicio no encontrado. Intentá más tarde";
    
    case 409:
      return data?.detail || "❌ Ya existe una cuenta con este email";
    
    case 422:
      // Errores de validación específicos
      if (data?.detail && Array.isArray(data.detail)) {
        return `❌ ${data.detail.map(err => err.msg).join(", ")}`;
      }
      return data?.detail || "❌ Datos inválidos";
    
    case 429:
      return "⏰ Demasiados intentos. Por favor, esperá unos minutos";
    
    case 500:
    case 502:
    case 503:
      return "🔧 Error del servidor. Por favor, intentá más tarde";
    
    default:
      return data?.detail || error?.message || "❌ Ocurrió un error inesperado";
  }
};

/**
 * Hook específico para el formulario de login
 */
export const useLoginForm = (authLogin) => {
  return useAuthForm({
    onSubmit: async ({ email, password }) => {
      const result = await authLogin({ 
        email: email.trim(), 
        password 
      });
      
      return {
        ...result,
        redirectTo: "/home"
      };
    },
    redirectTo: "/home"
  });
};

/**
 * Hook específico para el formulario de registro
 */
export const useRegisterForm = (authRegister) => {
  return useAuthForm({
    onSubmit: async (userData) => {
      const result = await authRegister(userData);
      
      return {
        ...result,
        redirectTo: "/email-verification-pending",
        state: { 
          email: userData.email,
          message: "✅ Cuenta creada exitosamente. Verificá tu email para continuar."
        }
      };
    },
    redirectTo: "/email-verification-pending"
  });
};

/**
 * Hook específico para verificación de email
 */
export const useEmailVerificationForm = (resendFunction) => {
  return useAuthForm({
    onSubmit: async ({ email }) => {
      await resendFunction(email);
      
      return {
        successMessage: "📧 Email de verificación enviado. Verificá tu bandeja de entrada.",
        redirectTo: null // No redirigir automáticamente
      };
    }
  });
};

/**
 * Hook específico para reset de contraseña
 */
export const usePasswordResetForm = (resetFunction) => {
  return useAuthForm({
    onSubmit: async ({ email }) => {
      await resetFunction(email);
      
      return {
        successMessage: "📧 Instrucciones enviadas. Verificá tu email para continuar.",
        redirectTo: "/login",
        delay: 2000
      };
    }
  });
};