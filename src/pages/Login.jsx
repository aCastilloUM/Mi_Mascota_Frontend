import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { AnimatedInput } from "../components/ui/AnimatedInput";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";
import { useResponsiveText } from "../hooks/useResponsiveText";
import { useResponsive } from "../hooks/useResponsive";
import { AuthCardTransition, useAuthNavigation } from "../animations";
import { TwoFactorInput } from "../components/ui/TwoFactorInput";

// Esquema de validación
const schema = z.object({
  email: z.string().min(1, "El mail es obligatorio").email("Ingresá un correo válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const router = useAuthNavigation();
  const { search, state } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const { title: titleSize, body: bodySize, label: labelSize, small: smallSize, button: buttonSize } = useResponsiveText();
  const { height } = useResponsive();
  
  // Crear estilos con tamaños responsive
  const styles = useMemo(() => createStyles(titleSize, bodySize, labelSize, smallSize, buttonSize), [titleSize, bodySize, labelSize, smallSize, buttonSize]);
  const next = params.get("next") || "/home";

  const { login, loginWith2FA } = useAuth(); // Agregar loginWith2FA
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMessage, setSuccessMessage] = useState(state?.message || "");
  
  // Estados para 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // ELIMINÉ EL useEffect PROBLEMÁTICO QUE CAUSABA EL PARPADEO

  const onSubmit = async (data) => {
    if (loading || router.isTransitioning) return;
    
    setErr("");
    setLoading(true);
    try {
      const result = await login({ email: data.email.trim(), password: data.password });
      
      // Verificar si requiere 2FA
      if (result.requires2FA) {
        setRequires2FA(true);
        setTempToken(result.tempToken);
        setErr(""); // Limpiar errores
      } else if (result.success) {
        // Login exitoso sin 2FA
        router.toHome();
      }
      
    } catch (e) {
      console.error("[Login] Error:", e);
      console.log("[Login] Status:", e.response?.status); // Debug log
      
      // Manejo específico de errores del backend
      if (e.response?.status === 401) {
        console.log("[Login] Setting 401 error message"); // Debug log
        setErr("❌ Email o contraseña incorrectos");
      } else if (e.response?.status === 400) {
        setErr("❌ Datos inválidos. Por favor, verificá tu email y contraseña");
      } else if (e.response?.status >= 500) {
        setErr("🔧 Error del servidor. Por favor, intentá más tarde");
      } else if (e.code === 'NETWORK_ERROR' || !e.response) {
        setErr("🌐 Error de conexión. Verificá tu conexión a internet");
      } else {
        setErr(e?.response?.data?.detail || e?.message || "❌ No pudimos iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el código 2FA
  const onSubmit2FA = async (code) => {
    if (twoFactorLoading || !code || code.length !== 6) return;
    
    setErr("");
    setTwoFactorLoading(true);
    try {
      const result = await loginWith2FA(tempToken, code);
      if (result.success) {
        router.toHome();
      }
    } catch (e) {
      console.error("[Login 2FA] Error:", e);
      
      if (e.response?.status === 401) {
        setErr("❌ Código 2FA incorrecto o expirado");
      } else if (e.response?.status === 400) {
        setErr("❌ Código 2FA inválido");
      } else {
        setErr("❌ Error al verificar el código 2FA");
      }
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Función para volver al formulario de login
  const backToLogin = () => {
    setRequires2FA(false);
    setTempToken("");
    setTwoFactorCode("");
    setErr("");
  };

  return (
    <AuthLayout>
      <AuthCenterWrap>
        <AuthCardTransition {...router.getPageProps()}>
          {/* Logo pegado */}
          <LogoWrap>
            <Logo />
          </LogoWrap>

          {/* Card responsiva, padding simétrico y overflow hidden */}
          <AuthCard cardType="login">
            <AuthCardContent>
            
            {!requires2FA ? (
              <>
                <h1 style={styles.title}>Iniciar sesión</h1>
                <p style={styles.subtitle}>¡Bienvenido! Ingresa tu cuenta para comenzar.</p>

                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                {/* Email */}
                <div style={styles.field}>
                  <label htmlFor="email" style={styles.label}>Mail</label>
                  <AnimatedInput
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    {...register("email")}
                    style={{
                      width: '80%',
                      height: '20px',
                      paddingRight: '40px',
                      ...(errors.email ? styles.inputError : touchedFields.email ? styles.inputOk : null),
                    }}
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email.message}</span>}
                </div>

                {/* Password */}
                <div style={styles.field}>
                  <label htmlFor="password" style={styles.label}>Contraseña</label>
                  <div style={styles.pwdWrap}>
                    <AnimatedInput
                      id="password"
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...register("password")}
                      style={{
                        width: '80%',
                        height: '20px',
                        paddingRight: '40px',
                        ...(errors.password ? styles.inputError : touchedFields.password ? styles.inputOk : null),
                      }}
                    />
                    <button
                      type="button"
                      aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPwd((s) => !s)}
                      style={styles.eyeBtn}
                    >
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span style={styles.errorText}>{errors.password.message}</span>}
                </div>

                {/* Olvidaste tu contraseña */}
                <button 
                  type="button" 
                  onClick={() => router.goForward("/forgot-password")} 
                  style={styles.link}
                  disabled={router.isTransitioning}
                >
                  ¿Olvidaste tu contraseña?
                </button>

                {/* Mensaje de éxito del registro */}
                {successMessage && (
                  <div style={styles.successAlert}>
                    {successMessage}
                  </div>
                )}

                {/* Error global */}
                {err ? <div style={styles.alert}>{err}</div> : null}

                {/* CTA principal */}
                <AnimatedButton
                  type="submit"
                  disabled={!isValid || loading || router.isTransitioning}
                  style={{
                    width: '100%',
                    opacity: (!isValid || loading || router.isTransitioning) ? 0.6 : 1
                  }}
                >
                  {loading ? "Ingresando…" : "Ingresar"}
                </AnimatedButton>
              </form>
              </>
            ) : (
              <>
                <h1 style={styles.title}>Autenticación de dos factores</h1>
                <p style={styles.subtitle}>Ingresa el código de 6 dígitos de tu aplicación autenticadora.</p>

                <form onSubmit={onSubmit2FA} style={styles.form}>
                  {/* Código 2FA */}
                  <div style={styles.field}>
                    <label style={styles.label}>Código de verificación</label>
                    <TwoFactorInput
                      value={twoFactorCode}
                      onChange={setTwoFactorCode}
                      disabled={twoFactorLoading}
                    />
                  </div>

                  {/* Error 2FA */}
                  {err && <div style={styles.alert}>{err}</div>}

                  {/* Botones 2FA */}
                  <div style={styles.twoFactorButtons}>
                    <button 
                      type="button" 
                      onClick={backToLogin}
                      style={styles.backButton}
                      disabled={twoFactorLoading}
                    >
                      Volver
                    </button>
                    <AnimatedButton
                      type="submit"
                      disabled={twoFactorCode.length !== 6 || twoFactorLoading}
                      style={{
                        flex: 1,
                        opacity: (twoFactorCode.length !== 6 || twoFactorLoading) ? 0.6 : 1
                      }}
                    >
                      {twoFactorLoading ? "Verificando…" : "Verificar"}
                    </AnimatedButton>
                  </div>
                </form>
              </>
            )}
          
          {/* Texto de registro dentro del card */}
          <div style={styles.registerSection}>
            <span style={styles.registerText}>¿No tenés cuenta?</span>
            <button 
              style={styles.registerBtn} 
              onClick={() => {
                console.log('🔥 Botón Register clickeado!'); // 🎯 DEBUG
                console.log('🔥 router.toRegister:', router.toRegister); // 🎯 DEBUG
                router.toRegister('login');
              }}
              disabled={router.isTransitioning}
            >
              Registrate
            </button>
          </div>
          
          </AuthCardContent>
        </AuthCard>
        </AuthCardTransition>
      </AuthCenterWrap>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
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

const createStyles = (titleSize, bodySize, labelSize, smallSize, buttonSize) => ({
  title: {
    margin: "0 0 0 0",
    fontFamily: rounded,
    fontSize: titleSize,
    lineHeight: 1.35,
    fontWeight: 700,
    textAlign: "center",
  },
  subtitle: {
    margin: "6px 0 12px 0", // Reducido espacio
    fontFamily: rounded,
    fontSize: bodySize,
    opacity: 0.85,
    lineHeight: 1.4,
    textAlign: "center",
  },
  form: {
    display: "grid",
    gap: 10, // Reducido de 14 a 10
    padding: 14, // Reducido de 18
    paddingTop: 8, // Reducido de 12
  },
  field: {
    display: "grid",
    gap: 5, // Reducido de 8 a 5
  },
  label: {
    fontSize: labelSize,
    fontWeight: '600',
    color: '#374151',
    marginBottom: '3px',
    display: 'block'
  },
  pwdWrap: {
    position: "relative",
    display: "block",
    width: "100%",
  },
  eyeBtn: {
    position: "absolute",
    right: '12px',
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: '#6B7280',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    justifySelf: "flex-start",
    background: "transparent",
    border: "none",
    padding: 0,
    color: "#000000",
    textDecoration: "underline",
    fontSize: bodySize,
    cursor: "pointer",
    fontFamily: rounded,
  },
  alert: {
    background: "rgba(255, 87, 87, 0.15)",
    border: "1px solid rgba(255, 87, 87, 0.4)",
    color: "#a60000",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: smallSize,
    fontFamily: rounded,
  },
  successAlert: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#15803d",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: smallSize,
    fontFamily: rounded,
  },
  registerSection: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 0 0 0",
    marginTop: "12px",
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  registerText: {
    fontSize: smallSize,
    color: "#6B7280",
    fontFamily: rounded,
  },
  registerBtn: {
    border: "1px solid #3B82F6",
    background: "#3B82F6",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: smallSize,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: rounded,
    transition: "all 0.2s ease",
  },
  inputError: {
    border: "1px solid rgba(255, 85, 85, 0.65)",
  },
  inputOk: {
    border: "1px solid rgba(100, 200, 120, 0.55)",
  },
  errorText: {
    color: '#EF4444',
    fontSize: smallSize,
    margin: '2px 0 0 0'
  },
  twoFactorButtons: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginTop: 8
  },
  backButton: {
    background: 'transparent',
    border: '1px solid #D1D5DB',
    color: '#6B7280',
    padding: '12px 20px',
    borderRadius: 12,
    fontSize: buttonSize,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: rounded,
    transition: 'all 0.2s ease',
    minWidth: '80px'
  }
});
