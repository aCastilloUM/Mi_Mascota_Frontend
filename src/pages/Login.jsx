import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";

import logoTop from "../assets/logos/dog+cat.png";
import { useAuth } from "../context/AuthContext";
import { BeamsBackground } from "../components/ui/BeamsBackground";
import { AnimatedInput } from "../components/ui/AnimatedInput";
import { AnimatedButton } from "../components/ui/AnimatedButton";

// Esquema de validación
const schema = z.object({
  email: z.string().min(1, "El mail es obligatorio").email("Ingresá un correo válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const next = params.get("next") || "/";

  const { login, isAuth } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuth) navigate(next, { replace: true });
  }, [isAuth, next, navigate]);

  const onSubmit = async (data) => {
    setErr("");
    setLoading(true);
    try {
      await login({ email: data.email.trim(), password: data.password });
    } catch (e) {
      setErr(e?.message || "No pudimos iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.screen}>
      <BeamsBackground />

      {/* Botón cerrar (arriba-derecha) */}
      <button aria-label="Cerrar" onClick={() => navigate(-1)} style={styles.closeBtn}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5L13 13M13 5L5 13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </button>

      <div style={styles.centerWrap}>
        {/* Logo pegado */}
        <div style={styles.logoWrap}>
          <img src={logoTop} alt="Mi Mascota" style={styles.logoImg} />
        </div>

        {/* Card responsiva, padding simétrico y overflow hidden */}
        <div style={styles.card}>
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
                  width: '90%',
                  height: '20px',
                  maxWidth: '95%',
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
                    width: '100%',
                    height: '20px',
                    ...(errors.password ? styles.inputError : touchedFields.password ? styles.inputOk : null),
                  }}
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPwd((s) => !s)}
                  style={{
                    ...styles.eyeBtn,
                    right: '12px'
                  }}
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <span style={styles.errorText}>{errors.password.message}</span>}
            </div>

            {/* Olvidaste tu contraseña */}
            <button type="button" onClick={() => navigate("/forgot-password")} style={styles.link}>
              ¿Olvidaste tu contraseña?
            </button>

            {/* Error global */}
            {err ? <div style={styles.alert}>{err}</div> : null}

            {/* CTA principal */}
            <AnimatedButton
              type="submit"
              disabled={!isValid || loading}
              style={{
                width: '100%',
                opacity: (!isValid || loading) ? 0.6 : 1
              }}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </AnimatedButton>
          </form>
        </div>
      </div>

      {/* Barra inferior */}
      <div style={styles.bottomBar}>
        <span style={{ opacity: 0.9 }}>¿No tenés cuenta?</span>
        <button style={styles.registerBtn} onClick={() => navigate("/register")}>
          Registrate
        </button>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

/* ---- estilos ---- */
const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

const styles = {
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 3,
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(14, 20, 42, 0.55)",
    backdropFilter: "blur(6px)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    color: "#fff",
  },
  screen: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    fontFamily: rounded,
    color: "#0A0F1E",
  },
  centerWrap: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "90px 16px 40px",     
    boxSizing: "border-box",
  },
  logoWrap: {
    position: "relative",
    zIndex: 2,
    marginBottom: -36,
    display: "grid",
    placeItems: "center",
    width: "100%",
  },
  logoImg: {
    width: 130,
    height: 130,
    objectFit: "contain",
    filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "320px",
    maxHeight: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    borderRadius: 12,
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(6px)",
    overflow: "hidden",
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    margin: "0 0 0 0",
    fontFamily: rounded,
    fontSize: "clamp(18px, 4.1vw, 20px)",
    lineHeight: 1.35,
    fontWeight: 700,
    textAlign: "center",
  },
  subtitle: {
    margin: "8px 0 18px 0",
    fontFamily: rounded,
    fontSize: 14,
    opacity: 0.85,
    lineHeight: 1.4,
    textAlign: "center",
  },
  form: {
    display: "grid",
    gap: 14,
    padding: 18,
    paddingTop: 12,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '3px',
    display: 'block'
  },
  pwdWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: '0px',
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
    color: "#0040cc",
    textDecoration: "underline",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: rounded,
  },
  alert: {
    background: "rgba(255, 87, 87, 0.15)",
    border: "1px solid rgba(255, 87, 87, 0.4)",
    color: "#a60000",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: rounded,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    zIndex: 1,
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 12px",
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
    fontFamily: rounded,
  },
  registerBtn: {
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 999,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: rounded,
  },
  inputError: {
    border: "1px solid rgba(255, 85, 85, 0.65)",
  },
  inputOk: {
    border: "1px solid rgba(100, 200, 120, 0.55)",
  },
  errorText: {
    color: '#EF4444',
    fontSize: '10px',
    margin: '2px 0 0 0'
  }
};
