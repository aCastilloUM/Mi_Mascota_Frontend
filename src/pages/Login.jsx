import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";

import bg1 from "../assets/backgrounds/background_blue.png";
import logoTop from "../assets/logos/dog+cat.png";
import { useAuth } from "../context/AuthContext";

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
    <div style={sx.screen}>
      <img src={bg1} alt="bg" style={sx.bg} />

      {/* Botón cerrar (arriba-derecha) */}
      <button aria-label="Cerrar" onClick={() => navigate(-1)} style={sx.closeBtn}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5L13 13M13 5L5 13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </button>


      <div style={sx.centerWrap}>
        {/* Logo pegado */}
        <div style={sx.logoWrap}>
          <img src={logoTop} alt="Mi Mascota" style={sx.logoImg} />
        </div>

        {/* Card responsiva, padding simétrico y overflow hidden */}
        <div style={sx.card}>
          <h1 style={sx.title}>Iniciar sesión</h1>
          <p style={sx.subtitle}>Bienvenido 👋 Ingresá con tu cuenta para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} style={sx.form}>
            {/* Email */}
            <div style={sx.field}>
              <label htmlFor="email" style={sx.label}>Mail</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                {...register("email")}
                style={{
                  ...sx.input,
                  ...sx.inputSameWidth, 
                  ...(errors.email ? sx.inputError : touchedFields.email ? sx.inputOk : null),
                }}
              />
              {errors.email && <span style={sx.errorText}>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div style={sx.field}>
              <label htmlFor="password" style={sx.label}>Contraseña</label>
              <div style={sx.pwdWrap}>
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  style={{
                    ...sx.input,
                    ...sx.inputSameWidth, 
                    paddingRight: 44,
                    ...(errors.password ? sx.inputError : touchedFields.password ? sx.inputOk : null),
                  }}
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPwd((s) => !s)}
                  style={sx.eyeBtn}
                >
                  {showPwd ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && <span style={sx.errorText}>{errors.password.message}</span>}
            </div>

            {/* Olvidaste tu contraseña */}
            <button type="button" onClick={() => navigate("/forgot-password")} style={sx.link}>
              ¿Olvidaste tu contraseña?
            </button>

            {/* Error global */}
            {err ? <div style={sx.alert}>{err}</div> : null}

            {/* CTA principal */}
            <button
              type="submit"
              disabled={!isValid || loading}
              style={{ ...sx.primaryBtn, ...(!isValid || loading ? sx.primaryBtnDisabled : null) }}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>

      {/* Barra inferior */}
      <div style={sx.bottomBar}>
        <span style={{ opacity: 0.9 }}>¿No tenés cuenta?</span>
        <button style={sx.registerBtn} onClick={() => navigate("/register")}>
          Registrate
        </button>
      </div>
    </div>
  );
}

/* ---- estilos ---- */
const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

const sx = {
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
  bg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 12,
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
  width: "min(520px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 120px)",
  display: "flex",
  flexDirection: "column",
  margin: "0 auto",
  borderRadius: 20,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
  paddingTop: 32,
  paddingBottom: 32,

},
  title: {
  margin: "0 0 0 20px",
    fontFamily: rounded,
    fontSize: "clamp(18px, 4.1vw, 20px)",
    lineHeight: 1.35,
    fontWeight: 700,
  },
  subtitle: {
  margin: "8px 0 18px 20px",
    fontFamily: rounded,
    fontSize: 14,
    opacity: 0.85,
    lineHeight: 1.4,
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
    fontFamily: rounded,
    fontSize: 13,
    opacity: 0.9,
  },
  input: {
    width: "100%",
    height: 46,                 
    display: "block",
    boxSizing: "border-box",    
    borderRadius: 30,
    border: "1px solid rgba(0,0,0,0.16)",
    background: "#fff",
    color: "#0A0F1E",
    outline: "none",
    padding: "14px 16px",
    fontSize: 14,
    fontFamily: rounded,
  },
  inputSameWidth: {
    paddingRight: 44,
  },
  inputOk: {
    border: "1px solid rgba(100, 200, 120, 0.55)",
  },
  inputError: {
    border: "1px solid rgba(255, 85, 85, 0.65)",
  },
  pwdWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#333",
    cursor: "pointer",
    padding: 4,
    lineHeight: 1,
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
  primaryBtn: {
    marginTop: 2,
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "14px 16px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    color: "#fff",
    background: "#0389ffff",
    fontFamily: rounded,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
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
};
