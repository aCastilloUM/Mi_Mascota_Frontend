import React, { useMemo, useState, useEffect } from "react";

import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";
import { useResponsiveText } from "../hooks/useResponsiveText";
import { useResponsive } from "../hooks/useResponsive";
import logoTop from "../assets/logos/dog+cat.png";

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' o 'prev'
  const { title, body } = useResponsiveText();
  const { height } = useResponsive();

  // Estados para swipe gesture
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Mínima distancia de swipe (en px)
  const minSwipeDistance = 50;

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
    if (isAnimating) return; // Prevenir múltiples clicks durante animación
    
    if (step < steps.length - 1) {
      setIsAnimating(true);
      setDirection('next');
      setTimeout(() => {
        setStep(step + 1);
        setTimeout(() => setIsAnimating(false), 50);
      }, 150);
    } else {
      finish();
    }
  };

  const previous = () => {
    if (isAnimating) return; // Prevenir múltiples clicks durante animación
    
    if (step > 0) {
      setIsAnimating(true);
      setDirection('prev');
      setTimeout(() => {
        setStep(step - 1);
        setTimeout(() => setIsAnimating(false), 50);
      }, 150);
    }
  };

  // Funciones para manejar swipe gestures
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      next(); // Swipe izquierda = siguiente
    }
    if (isRightSwipe) {
      previous(); // Swipe derecha = anterior
    }
  };

  if (!visible) return null;

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <AuthLayout>
      <AuthCenterWrap>
        {/* Logo pegado arriba del card */}
        <LogoWrap>
          <Logo />
        </LogoWrap>

        {/* Card con soporte para swipe usando AuthCard */}
        <AuthCard 
          cardType="onboarding"
          autoHeight={true}
          style={{ 
            maxHeight: "calc(100vh - 140px)",
            minHeight: "auto"
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <AuthCardContent
            style={{ 
              textAlign: "center",
              padding: "0 24px 0px",
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}
          >

          {/* Contenido */}
          <div 
            style={{ 
              marginBottom: "auto",
              opacity: isAnimating ? 0.3 : 1,
              transform: isAnimating 
                ? direction === 'next' 
                  ? 'translateX(-20px)' 
                  : 'translateX(20px)'
                : 'translateX(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <h2 style={{ ...styles.title, fontSize: title }}>{currentStep.title}</h2>
            <p style={{ ...styles.description, fontSize: body, marginTop: "18px" }}>{currentStep.description}</p>
          </div>

          {/* Sección inferior fija */}
          <div style={{ marginTop: "auto", paddingTop: "10px" }}>
            {/* Indicadores de progreso */}
            <div style={styles.progress}>
              {steps.map((_, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!isAnimating && index !== step) {
                      setIsAnimating(true);
                      setDirection(index > step ? 'next' : 'prev');
                      setTimeout(() => {
                        setStep(index);
                        setTimeout(() => setIsAnimating(false), 50);
                      }, 150);
                    }
                  }}
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
                style={{
                  ...styles.skipBtn,
                  opacity: isAnimating ? 0.5 : 1,
                  cursor: isAnimating ? "not-allowed" : "pointer"
                }}
                disabled={isAnimating}
              >
                {skipLabel}
              </button>
              <button 
                onClick={next} 
                style={{
                  ...styles.nextBtn,
                  background: isAnimating 
                    ? "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)"
                    : "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                  cursor: isAnimating ? "not-allowed" : "pointer",
                  boxShadow: isAnimating 
                    ? "0 2px 6px rgba(107, 114, 128, 0.2)"
                    : "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transform: isAnimating ? "scale(0.98)" : "scale(1)",
                  opacity: isAnimating ? 0.7 : 1
                }}
                disabled={isAnimating}
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
          </AuthCardContent>
        </AuthCard>
      </AuthCenterWrap>
      
      {/* Estilos CSS para animaciones y efectos hover */}
      <style jsx>{`
        button:hover:not(:disabled) {
          transform: translateY(-1px) !important;
        }
        
        button:active:not(:disabled) {
          transform: translateY(0px) scale(0.98) !important;
        }
        
        .onboarding-dot:hover {
          transform: scale(1.4) !important;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.3) !important;
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </AuthLayout>
  );
}

/* ---------- Estilos ---------- */
const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

const styles = {
  title: {
    fontSize: "clamp(18px, 4.1vw, 20px)",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
    lineHeight: "1.2",
    fontFamily: rounded,
  },

  description: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.4",
    margin: "10px",
    fontFamily: rounded,
    opacity: 0.85,
  },

  progress: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    padding: "0 0 8px",
    margin: "0 0 8px 0",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },

  activeDot: {
    backgroundColor: "#3B82F6",
    transform: "scale(1.3)",
    boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
  },

  completedDot: {
    backgroundColor: "#10B981",
    transform: "scale(1.1)",
  },

  actions: {
    display: "flex",
    gap: "12px",
    padding: "0 32px 16px",
    justifyContent: "space-between",
    marginTop: "0px",
  },

  skipBtn: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: rounded,
  },

  nextBtn: {
    padding: "8px 16px",
    border: "none",
    background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
