import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiRefreshCw, FiEdit3 } from "react-icons/fi";

import { AnimatedButton } from "../components/ui/AnimatedButton";
import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";
import { useResponsiveText } from "../hooks/useResponsiveText";
import { useResponsive } from "../hooks/useResponsive";
import { resendVerificationEmail, verifyEmail } from "../lib/api";

// Componente de animación tipo morph loading adaptado de tsx a jsx
const UniqueLoading = ({ size = "1g", className = "" }) => {
  return (
    <div 
      className={`unique-loading ${className}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div className="morph-container">
        <div className="morph-dot morph-dot-1"></div>
        <div className="morph-dot morph-dot-2"></div>
        <div className="morph-dot morph-dot-3"></div>
        <div className="morph-dot morph-dot-4"></div>
      </div>
    </div>
  );
};

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const { width, height, widthPercent, heightPercent } = useResponsive();
  // Tamaños de fuente proporcionales
  const title = `${Math.max(18, Math.min(widthPercent(4.1), 22))}px`;
  const body = `${Math.max(13, Math.min(widthPercent(3.2), 16))}px`;
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 segundos para reenviar
  const [canResend, setCanResend] = useState(false);

  // Obtener email y token del state del registro (pasado desde Register.jsx) o sessionStorage
  const userEmail = location.state?.email || sessionStorage.getItem('mimascota:register_email') || "";
  const devToken = location.state?.token || null;

  // Countdown timer para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!canResend || loading) return;
    
    setLoading(true);
    try {
      // Llamar a la API de reenvío
      await resendVerificationEmail(userEmail);
      
      // Resetear countdown
      setCountdown(60);
      setCanResend(false);
      
      // Mostrar feedback al usuario
      alert("✅ Email reenviado exitosamente. Revisa tu bandeja de entrada.");
      
    } catch (error) {
      console.error("Error al reenviar email:", error);
      
      // Manejo específico de errores
      let errorMessage = "❌ Error al reenviar el email. Inténtalo nuevamente.";
      
      if (error.response?.status === 400) {
        errorMessage = "❌ " + (error.response.data?.detail || "Email inválido o ya verificado.");
      } else if (error.response?.status === 404) {
        errorMessage = "❌ Usuario no encontrado. Verifica el email.";
      } else if (error.response?.status >= 500) {
        errorMessage = "🔧 Error del servidor. Inténtalo más tarde.";
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = "🌐 Error de conexión. Verifica tu internet.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Dev helper: auto-verify only when DEV and an explicit dev flag is enabled
  useEffect(() => {
    let mounted = true;
    const autoVerify = async () => {
      if (!devToken) return;
      // Only auto-verify in development builds and when explicit flag is enabled
      if (!import.meta.env.DEV) return;
      const showDev = import.meta.env.VITE_SHOW_DEV_VERIFICATION_TOKEN === 'true';
      if (!showDev) return;

      try {
        setLoading(true);
        await verifyEmail(devToken);
        if (!mounted) return;
        alert("✅ Email verificado automáticamente (modo DEV). Ahora podés iniciar sesión.");
        // Redirigir a login
        window.location.href = '/login';
      } catch (err) {
        console.error('Auto verify failed', err);
        // If auto verify fails, just keep the page and let the user click the button
      } finally {
        if (mounted) setLoading(false);
      }
    };

    autoVerify();

    return () => { mounted = false; };
  }, [devToken]);

  const handleChangeEmail = () => {
    // Volver al registro para cambiar email
    navigate("/register", { replace: true });
  };

  return (
    <AuthLayout>
      <AuthCenterWrap>
        {/* Logo pegado */}
        <LogoWrap>
          <Logo />
        </LogoWrap>

        {/* Card responsiva */}
        <AuthCard cardType="email-verification" autoHeight={true}>
          <AuthCardContent>
            {/* Icono de email y animación */}
            <div style={styles.iconSection}>
            <div style={styles.emailIconWrap}>
              <FiMail size={32} color="#3B82F6" />
            </div>
            <UniqueLoading size="60px" className="verification-loading" />
          </div>

          {/* Contenido con padding como Register */}
          <div style={styles.content}>
            <h1 style={{ ...styles.title, fontSize: title }}>Revisa tu bandeja de entrada</h1>
            <p style={{ ...styles.subtitle, fontSize: body }}>
              Te hemos enviado un email de verificación a:
            </p>
            
            <div style={styles.emailDisplay}>
              <strong>{userEmail}</strong>
            </div>

            {devToken && import.meta.env.DEV && import.meta.env.VITE_SHOW_DEV_VERIFICATION_TOKEN === 'true' ? (
              <div style={{ margin: '12px 0', padding: 12, background: '#fff7ed', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13 }}>Token de verificación (DEV):</p>
                <pre style={{ margin: '6px 0 8px 0', background: '#fff', padding: 8, borderRadius: 6, overflowX: 'auto' }}>{devToken}</pre>
                <AnimatedButton onClick={async () => {
                  setLoading(true);
                  try { await verifyEmail(devToken); alert('✅ Verificado (modo DEV)'); window.location.href='/login'; }
                  catch (e) { alert('Error al verificar: ' + (e?.response?.data?.detail || e?.message || '')); }
                  finally { setLoading(false); }
                }}>
                  Verificar ahora (DEV)
                </AnimatedButton>
              </div>
            ) : null}

            <p style={{ ...styles.instruction, fontSize: body }}>
              Haz click en el enlace del email para verificar tu cuenta y continuar.
            </p>

            {/* Botones de acción */}
            <div style={styles.actionSection}>
              <AnimatedButton
                onClick={handleResendEmail}
                disabled={!canResend || loading}
                style={{
                  ...styles.resendBtn,
                  opacity: canResend ? 1 : 0.6,
                  cursor: canResend ? "pointer" : "not-allowed"
                }}
              >
                <FiRefreshCw size={16} style={{ marginRight: 8 }} />
                {loading ? "Enviando..." : canResend ? "Reenviar email" : `Reenviar en ${countdown}s`}
              </AnimatedButton>

              <button onClick={handleChangeEmail} style={styles.changeEmailBtn}>
                <FiEdit3 size={14} style={{ marginRight: 6 }} />
                Cambiar email
              </button>
            </div>

            {/* Información adicional */}
            <div style={styles.helpSection}>
              <p style={styles.helpText}>
                <strong>¿No encuentras el email?</strong>
              </p>
              <ul style={styles.helpList}>
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>El email puede tardar algunos minutos en llegar</li>
                <li>Verifica que el email sea correcto</li>
              </ul>
            </div>
          </div>
          </AuthCardContent>
        </AuthCard>
      </AuthCenterWrap>

      {/* Estilos CSS para animaciones morph loading */}
      <style jsx>{`
        .morph-container {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .morph-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #3B82F6;
          border-radius: 50%;
          animation: morphAnimation 2s infinite ease-in-out;
        }

        .morph-dot-1 {
          top: 0;
          left: 24px;
          animation-delay: 0s;
        }

        .morph-dot-2 {
          top: 24px;
          right: 0;
          animation-delay: 0.5s;
        }

        .morph-dot-3 {
          bottom: 0;
          left: 24px;
          animation-delay: 1s;
        }

        .morph-dot-4 {
          top: 24px;
          left: 0;
          animation-delay: 1.5s;
        }

        @keyframes morphAnimation {
          0%, 20% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.7;
          }
          80%, 100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }

        .verification-loading {
          margin: 16px 0;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
      `}</style>
    </AuthLayout>
  );
}

/* ---- estilos ---- */
const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

const styles = {
  iconSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  content: {
    padding: "0 20px",
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
    margin: "0 0 8px 0",
    fontFamily: rounded,
    fontSize: 14,
    lineHeight: 1.4,
    color: "#555",
    textAlign: "center",
  },
  emailDisplay: {
    margin: "0 0 16px 0",
    padding: "12px 16px",
    background: "rgba(59, 130, 246, 0.05)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: 8,
    textAlign: "center",
    fontFamily: rounded,
    fontSize: 14,
    color: "#3B82F6",
    wordBreak: "break-word",
  },
  instruction: {
    margin: "0 0 24px 0",
    fontFamily: rounded,
    fontSize: 13,
    lineHeight: 1.4,
    color: "#666",
    textAlign: "center",
  },
  actionSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
  },
  resendBtn: {
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
  changeEmailBtn: {
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
  helpSection: {
    padding: "16px 0 0 0",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  helpText: {
    margin: "0 0 8px 0",
    fontFamily: rounded,
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  helpList: {
    margin: "0",
    padding: "0 0 0 16px",
    fontFamily: rounded,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#666",
  },
};