import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FiCheck, FiX, FiMail } from "react-icons/fi";

import { AnimatedButton } from "../components/ui/AnimatedButton";
import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";
import { useResponsiveText } from "../hooks/useResponsiveText";
import { useResponsive } from "../hooks/useResponsive";
import { verifyEmail } from "../lib/api";


// Componente de animación de verificación exitosa
const SuccessAnimation = ({ size = "80px" }) => {
  return (
    <div
      className="success-animation"
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="success-circle">
        <FiCheck size={40} color="#10B981" strokeWidth={3} />
      </div>
    </div>
  );
};

// Componente de animación de error
const ErrorAnimation = ({ size = "80px" }) => {
  return (
    <div
      className="error-animation"
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="error-circle">
        <FiX size={40} color="#EF4444" strokeWidth={3} />
      </div>
    </div>
  );
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { title, body, small } = useResponsiveText();
  const { height } = useResponsive();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [closedAttempted, setClosedAttempted] = useState(false);
  const [animationPhase, setAnimationPhase] = useState("enter"); // enter, verify, result

  const location = useLocation();

  // Try to determine the email to display: url param, navigation state or sessionStorage (from registration)
  const emailFromQuery = searchParams.get("email");
  const emailFromState = location?.state?.email;
  const emailFromSession = typeof window !== "undefined" ? sessionStorage.getItem("mimascota:register_email") : null;
  const userEmail = (emailFromQuery || emailFromState || emailFromSession || "").toLowerCase();

  const token = searchParams.get("token");
  const verifiedParam = searchParams.get("verified");
  const messageParam = searchParams.get("message");

  // Verificar email al cargar componente
  useEffect(() => {
    if (!token) {
      // Si el frontend fue redirigido por el backend después de verificar,
      // aceptamos el flag `verified` y mostramos resultado sin llamar al API.
      if (verifiedParam !== null) {
        if (verifiedParam === "1" || verifiedParam === "true") {
          setStatus("success");
          setMessage(messageParam || "¡Email verificado exitosamente!");
        } else {
          setStatus("error");
          setMessage(decodeURIComponent(messageParam || "Error al verificar el email."));
        }
        setAnimationPhase("result");
        return;
      }

      setStatus("error");
      setMessage("Token de verificación faltante");
      setAnimationPhase("result");
      return;
    }

    const verifyEmailToken = async () => {
      try {
        // Mostrar animación de verificación por un momento
        setAnimationPhase("verify");

        // Esperar un poco para la animación
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Llamar a la API
        await verifyEmail(token);

        setStatus("success");
        setMessage("¡Email verificado exitosamente!");
        setAnimationPhase("result");

      } catch (error) {
        console.error("Error al verificar email:", error);

        setStatus("error");
        setAnimationPhase("result");

        // Manejo específico de errores
        if (error.response?.status === 400) {
          const detail = error.response.data?.detail || "";
          if (detail.toLowerCase().includes("expirado")) {
            setMessage("El enlace de verificación ha expirado. Solicita uno nuevo.");
          } else if (detail.toLowerCase().includes("inválido")) {
            setMessage("El enlace de verificación no es válido.");
          } else {
            setMessage("Error en la verificación: " + detail);
          }
        } else if (error.response?.status === 404) {
          setMessage("El enlace de verificación no es válido o ya fue utilizado.");
        } else if (error.response?.status >= 500) {
          setMessage("Error del servidor. Inténtalo más tarde.");
        } else if (error.code === "NETWORK_ERROR" || !error.response) {
          setMessage("Error de conexión. Verifica tu internet.");
        } else {
          setMessage("Error inesperado al verificar el email.");
        }
      }
    };

    verifyEmailToken();
  }, [token]);

  // Countdown para redirect automático en caso de éxito
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      // Notify other tabs and try to close this tab (if it was opened by script)
      const payload = { ts: Date.now(), message: "✅ Email verificado exitosamente. Ya puedes iniciar sesión." };

      // BroadcastChannel (modern browsers)
      try {
        const bc = new BroadcastChannel("mimascota:email_events");
        bc.postMessage({ type: "email_verified", payload });
        bc.close();
      } catch (e) {
        // ignore if not supported
      }

      // localStorage fallback (triggers storage event in other tabs)
      try {
        localStorage.setItem("mimascota:email_verified", JSON.stringify(payload));
      } catch (e) {
        /* noop */
      }

      // Try to close current window. This will only work if the tab
      // was opened via window.open from script; otherwise browsers block it.
      try {
        window.close();
      } catch (e) {
        // ignore
      }

      // After a short delay, if the window is still open, try sensible fallbacks:
      // 1) If there's navigation history, go back to previous page (no new page created)
      // 2) Otherwise redirect to /login
      setTimeout(() => {
        setClosedAttempted(true);

        // Final fallback: go to login (prefer login instead of returning to registration page)
        try {
          navigate("/login", {
            state: {
              message: payload.message,
            },
          });
        } catch (e) {
          // noop
        }
      }, 600);
    }
  }, [status, countdown, navigate]);

  const handleGoToLogin = () => {
    navigate("/login", {
      state: {
        message: status === "success" ? "✅ Email verificado exitosamente. Ya puedes iniciar sesión." : undefined,
      },
    });
  };

  const handleRequestNewToken = () => {
    navigate("/email-verification-pending", {
      state: {
        email: userEmail || undefined,
      },
    });
  };

  const renderContent = () => {
    if (animationPhase === "enter" || animationPhase === "verify") {
      return (
        <div style={styles.content}>
          <div style={styles.iconSection}>
            <div style={styles.emailIconWrap}>
              <FiMail size={32} color="#3B82F6" />
            </div>
            <div className="verification-spinner" style={styles.spinnerWrap}>
              <div className="spinner"></div>
            </div>
          </div>

          <h1 style={{ ...styles.title, fontSize: title }}>Verificando tu email...</h1>
          <p style={{ ...styles.subtitle, fontSize: body }}>Por favor espera mientras procesamos tu verificación.</p>
        </div>
      );
    }

    // Fase de resultado
    return (
      <div style={styles.content}>
        <div style={styles.iconSection}>{status === "success" ? <SuccessAnimation size="80px" /> : <ErrorAnimation size="80px" />}</div>

        <h1
          style={{
            ...styles.title,
            fontSize: title,
            color: status === "success" ? "#10B981" : "#EF4444",
          }}
        >
          {status === "success" ? "¡Email Verificado!" : "Error de Verificación"}
        </h1>

        <p style={{ ...styles.subtitle, fontSize: body }}>{message}</p>

        {status === "success" && (
          <>
            <p style={{ ...styles.redirectInfo, fontSize: small, fontWeight: 600 }}>Esta página se cerrará en {countdown}...</p>

            {userEmail ? (
              <p style={{ marginTop: 6, fontSize: small, color: "#475569" }}>
                Email: <strong>{userEmail}</strong>
              </p>
            ) : null}
          </>
        )}

        {/* Botones de acción */}
        <div style={styles.actionSection}>
          {status === "success" ? (
            <>
              {!closedAttempted ? (
                <AnimatedButton onClick={handleGoToLogin} style={styles.primaryBtn}>
                  Ir a Iniciar Sesión
                </AnimatedButton>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ margin: 0, textAlign: "center", color: "#334155" }}>
                    Si la pestaña no se cerró automáticamente, podés volver a la otra pestaña o
                    presionar el botón para ir al login.
                  </p>
                  <AnimatedButton onClick={handleGoToLogin} style={styles.primaryBtn}>
                    Ir a Iniciar Sesión
                  </AnimatedButton>
                </div>
              )}
            </>
          ) : (
            <>
              <AnimatedButton onClick={handleRequestNewToken} style={styles.primaryBtn}>
                Solicitar Nuevo Enlace
              </AnimatedButton>

              <button onClick={handleGoToLogin} style={styles.secondaryBtn}>
                Ir al Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthLayout>
      <AuthCenterWrap>
        {/* Logo pegado */}
        <LogoWrap>
          <Logo />
        </LogoWrap>

        {/* Card con animación de transición */}
        <AuthCard
          cardType="verify-email"
          autoHeight={true}
          style={{
            opacity: animationPhase === "enter" ? 0 : 1,
            transform: animationPhase === "enter" ? "translateY(20px)" : "translateY(0)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <AuthCardContent>{renderContent()}</AuthCardContent>
        </AuthCard>
      </AuthCenterWrap>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        .verification-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 16px 0;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top: 3px solid #3B82F6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .success-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: successPulse 0.6s ease-out;
        }

        .error-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid #EF4444;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: errorShake 0.6s ease-out;
        }

        @keyframes successPulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes errorShake {
          0%, 100% {
            transform: translateX(0);
            opacity: 0;
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(1deg);
          }
        }
      `}</style>
    </AuthLayout>
  );
}

/* ---- estilos ---- */
const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

const styles = {
  content: {
    padding: "0 20px",
  },
  iconSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  emailIconWrap: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  spinnerWrap: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: "0 0 8px 0",
    fontFamily: rounded,
    fontSize: "clamp(18px, 4.1vw, 22px)",
    lineHeight: 1.35,
    fontWeight: 700,
    textAlign: "center",
    color: "#0A0F1E",
  },
  subtitle: {
    margin: "0 0 16px 0",
    fontFamily: rounded,
    fontSize: 14,
    lineHeight: 1.4,
    color: "#555",
    textAlign: "center",
  },
  redirectInfo: {
    margin: "0 0 24px 0",
    fontFamily: rounded,
    fontSize: 13,
    lineHeight: 1.4,
    color: "#10B981",
    textAlign: "center",
    fontWeight: 500,
  },
  actionSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    border: "1px solid #3B82F6",
    background: "#3B82F6",
    color: "white",
    fontFamily: rounded,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  secondaryBtn: {
    width: "100%",
    height: 40,
    borderRadius: 6,
    border: "1px solid rgba(59, 130, 246, 0.3)",
    background: "transparent",
    color: "#3B82F6",
    fontFamily: rounded,
    fontSize: 13,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};