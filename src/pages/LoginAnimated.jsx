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

// Esquema de validación
const schema = z.object({
  email: z.string().min(1, "El mail es obligatorio").email("Ingresá un correo válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const { search, state } = useLocation();
  const router = useAuthNavigation(); // 🎯 Usar el nuevo hook de navegación animada
  
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const { title: titleSize, body: bodySize, label: labelSize, small: smallSize, button: buttonSize } = useResponsiveText();
  const { height } = useResponsive();
  
  // Crear estilos con tamaños responsive
  const styles = useMemo(() => createStyles(titleSize, bodySize, labelSize, smallSize, buttonSize), [titleSize, bodySize, labelSize, smallSize, buttonSize]);
  const next = params.get("next") || "/home";

  const { login } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMessage, setSuccessMessage] = useState(state?.message || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    if (loading || router.isTransitioning) return; // 🎯 Verificar también si hay transición
    
    setLoading(true);
    setErr("");
    setSuccessMessage("");

    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        // 🎯 Usar navegación animada al éxito
        router.toHome();
      } else {
        setErr(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setErr("Error inesperado al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Función para ir a register con animación
  const handleGoToRegister = () => {
    router.toRegister('login');
  };

  return (
    <AuthLayout>
      <AuthCenterWrap>
        {/* 🎯 Envolver con el componente de transición animada */}
        <AuthCardTransition 
          {...router.getPageProps()} // 🎯 Obtener props de animación
          className="w-full max-w-md mx-auto"
        >
          <LogoWrap>
            <Logo />
          </LogoWrap>

          <AuthCard>
            <AuthCardContent>
              {/* Mensaje de éxito si existe */}
              {successMessage && (
                <div style={styles.successMessage}>
                  {successMessage}
                </div>
              )}

              {/* Título */}
              <h1 style={styles.title}>
                ¡Hola de nuevo! 👋
              </h1>
              
              {/* Subtítulo */}
              <p style={styles.subtitle}>
                Ingresá tus datos para continuar
              </p>

              {/* Formulario */}
              <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                {/* Email */}
                <div style={styles.fieldGroup}>
                  <AnimatedInput
                    {...register("email")}
                    type="email"
                    placeholder="tucorreo@email.com"
                    error={errors.email?.message}
                    isTouched={touchedFields.email}
                    isValid={!errors.email && touchedFields.email}
                    style={styles.input}
                  />
                </div>

                {/* Password */}
                <div style={styles.fieldGroup}>
                  <div style={styles.passwordContainer}>
                    <AnimatedInput
                      {...register("password")}
                      type={showPwd ? "text" : "password"}
                      placeholder="Tu contraseña"
                      error={errors.password?.message}
                      isTouched={touchedFields.password}
                      isValid={!errors.password && touchedFields.password}
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={styles.eyeButton}
                    >
                      {showPwd ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {err && (
                  <div style={styles.error}>
                    {err}
                  </div>
                )}

                {/* Botón submit */}
                <AnimatedButton
                  type="submit"
                  disabled={!isValid || loading || router.isTransitioning} // 🎯 También deshabilitar durante transiciones
                  loading={loading}
                  style={styles.submitButton}
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </AnimatedButton>
              </form>

              {/* Enlaces */}
              <div style={styles.linksContainer}>
                <button
                  type="button"
                  onClick={handleGoToRegister} // 🎯 Usar función con animación
                  style={styles.link}
                  disabled={router.isTransitioning} // 🎯 Deshabilitar durante transiciones
                >
                  ¿No tenés cuenta? Registrate
                </button>
              </div>
            </AuthCardContent>
          </AuthCard>
        </AuthCardTransition>
      </AuthCenterWrap>
    </AuthLayout>
  );
}

// Función para crear estilos responsive
const createStyles = (titleSize, bodySize, labelSize, smallSize, buttonSize) => ({
  successMessage: {
    padding: "12px 16px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontSize: smallSize,
    marginBottom: "20px",
    textAlign: "center",
  },

  title: {
    fontSize: titleSize,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: "8px",
    lineHeight: "1.2",
  },

  subtitle: {
    fontSize: bodySize,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "24px",
    lineHeight: "1.4",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: bodySize,
    backgroundColor: "white",
    transition: "all 0.2s ease",
    outline: "none",
  },

  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  eyeButton: {
    position: "absolute",
    right: "16px",
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "color 0.2s ease",
  },

  error: {
    color: "#dc2626",
    fontSize: smallSize,
    textAlign: "center",
    padding: "8px",
    backgroundColor: "#fef2f2",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },

  submitButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: buttonSize,
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "8px",
  },

  linksContainer: {
    marginTop: "24px",
    textAlign: "center",
  },

  link: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    fontSize: smallSize,
    cursor: "pointer",
    textDecoration: "underline",
    transition: "color 0.2s ease",
  },
});