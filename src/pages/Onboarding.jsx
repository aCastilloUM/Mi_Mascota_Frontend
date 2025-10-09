import React, { useMemo, useState, useEffect } from "react";

import logoTop from "../assets/logos/dog+cat.png";
import { BeamsBackground } from "../components/ui/BeamsBackground";

const defaultSteps = [
  {
    title: "Bienvenido a Mi Mascota",
    description: "Descubre una plataforma integral diseñada para el bienestar y cuidado de tu mejor amigo."
  },
  {
    title: "Conecta con Expertos",
    description: "Encuentra paseadores, cuidadores y servicios profesionales verificados para tu mascota."
  },
  {
    title: "Reseñas Reales",
    description: "Toma decisiones informadas con reseñas y calificaciones auténticas de otros dueños."
  },
  {
    title: "¡Listo para Empezar!",
    description: "Comienza a explorar todas las funcionalidades que tenemos preparadas para ti y tu mascota."
  }
];

/**
 * Onboarding moderno tipo dialog con el estilo de Origin UI
 */
export default function Onboarding({
  logoTopSrc = logoTop,
  steps = defaultSteps,
  onDone,
  force = false,
  nextLabel = "Siguiente",
  skipLabel = "Omitir",
  finalLabel = "Empezar"
}) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!force) {
      const seen = localStorage.getItem("onboardingSeen");
      if (seen === "1") setVisible(false);
    }
  }, [force]);

  const finish = () => {
    localStorage.setItem("onboardingSeen", "1");
    setVisible(false);
    onDone?.();
  };

  const skip = () => {
    finish();
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  if (!visible) return null;

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div style={styles.overlay}>
      <BeamsBackground />
      
      <div style={styles.centerWrap}>
        {/* Logo pegado arriba del card */}
        <div style={styles.logoWrap}>
          <img src={logoTopSrc} alt="Mi Mascota" style={styles.logoImg} />
        </div>

        {/* Dialog/Card */}
        <div style={styles.dialog}>
          {/* Botón cerrar */}
          <button 
            onClick={skip} 
            style={styles.closeBtn}
            aria-label="Cerrar onboarding"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Contenido */}
          <div style={styles.content}>
            <h2 style={styles.title}>{currentStep.title}</h2>
            <p style={styles.description}>{currentStep.description}</p>
          </div>

          {/* Indicadores de progreso */}
          <div style={styles.progress}>
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.dot,
                  ...(index === step ? styles.activeDot : {}),
                  ...(index < step ? styles.completedDot : {})
                }}
              />
            ))}
          </div>

          {/* Botones de acción */}
          <div style={styles.actions}>
            <button 
              onClick={skip} 
              style={styles.skipBtn}
            >
              {skipLabel}
            </button>
            <button 
              onClick={next} 
              style={styles.nextBtn}
            >
              {isLastStep ? finalLabel : nextLabel}
              {!isLastStep && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.arrow}>
                  <path 
                    d="M6 4L10 8L6 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Estilos ---------- */
const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  dialog: {
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
    fontFamily: rounded,
  },

  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(0, 0, 0, 0.05)",
    color: "#6B7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    zIndex: 1,
  },

  content: {
    padding: "0 32px 24px",
    textAlign: "center",
  },

  title: {
    fontSize: "clamp(18px, 4.1vw, 20px)",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 12px 0",
    lineHeight: "1.3",
    fontFamily: rounded,
  },

  description: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.5",
    margin: "0",
    fontFamily: rounded,
    opacity: 0.85,
  },

  progress: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    padding: "0 32px 24px",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    transition: "all 0.3s ease",
  },

  activeDot: {
    backgroundColor: "#3B82F6",
    transform: "scale(1.2)",
  },

  completedDot: {
    backgroundColor: "#10B981",
  },

  actions: {
    display: "flex",
    gap: "12px",
    padding: "0 32px 0px",
    justifyContent: "space-between",
  },

  skipBtn: {
    padding: "10px 20px",
    border: "none",
    background: "transparent",
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    fontFamily: rounded,
  },

  nextBtn: {
    padding: "10px 20px",
    border: "none",
    background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    fontFamily: rounded,
  },

  arrow: {
    marginLeft: "2px",
  }
};
