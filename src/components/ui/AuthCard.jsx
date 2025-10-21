import React, { useEffect, useState, useRef } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import { useSmartCardHeight } from "../../hooks/useSmartCardHeight";

export const AuthCard = ({ 
  children, 
  maxWidth,
  style = {},
  className = "",
  autoHeight = true,  // Nueva prop para controlar si usa altura automática
  cardType = 'auto', // Nueva prop para identificar tipo de card
  ...props
}) => {
  const { width, height, widthPercent, heightPercent } = useResponsive();
  
  // Usar el sistema inteligente de detección
  const { cardRef, autoHeight: smartAutoHeight, optimalHeight, debugInfo } = useSmartCardHeight(cardType);
  
  // Decidir si usar autoHeight manual o el inteligente
  const finalAutoHeight = cardType !== 'auto' ? smartAutoHeight : autoHeight;
  
  // MaxWidth proporcional: entre 60% y 90% del ancho de pantalla
  const responsiveMaxWidth = maxWidth || `${Math.max(220, Math.min(widthPercent(80), 400))}px`;
  
  // Altura dinámica: usar max-height en lugar de forzar height para evitar "saltos" durante cambios pequeños de viewport
  // Sólo aplicaremos un nuevo valor de altura si la diferencia con la anterior supera un umbral para evitar re-layouts frecuentes.
  const [appliedHeight, setAppliedHeight] = useState(null);
  const HEIGHT_DELTA_THRESHOLD = 64; // px

  useEffect(() => {
    if (typeof optimalHeight === 'number') {
      const capped = Math.min(optimalHeight, heightPercent(80));
      if (typeof appliedHeight !== 'number' || Math.abs(appliedHeight - capped) > HEIGHT_DELTA_THRESHOLD) {
        setAppliedHeight(capped);
      }
    } else {
      setAppliedHeight(null);
    }
  }, [optimalHeight, heightPercent]);

  const cardStyle = {
    position: "relative",
    width: "100%",
    maxWidth: responsiveMaxWidth,
  // Aplicar maxHeight para permitir scroll interno sin redimensionar el card
  maxHeight: typeof appliedHeight === 'number' ? `${appliedHeight}px` : 'none',
  minHeight: typeof appliedHeight === 'number' ? `${Math.min(appliedHeight, heightPercent(50))}px` : 'auto',
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    borderRadius: Math.max(8, Math.min(widthPercent(3), 16)), // entre 8 y 16px
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: `0 2px ${Math.max(8, Math.min(heightPercent(2), 16))}px rgba(0, 0, 0, 0.13)`,
    backdropFilter: "blur(6px)",
  overflow: !finalAutoHeight ? "visible" : "hidden",
    paddingTop: Math.max(12, Math.min(heightPercent(2.5), 28)),
    paddingBottom: Math.max(12, Math.min(heightPercent(2.5), 28)),
    ...style
  };

  return (
    <div 
      ref={cardRef} 
      style={cardStyle} 
      className={className}
      data-card-type={cardType}
      data-auto-height={finalAutoHeight}
      {...props}
    >
      {children}
    </div>
  );
};

export const AuthCardContent = ({ 
  children, 
  padding,
  style = {} 
}) => {
  const { widthPercent } = useResponsive();
  // Padding lateral proporcional: entre 12px y 28px
  const responsivePadding = padding || `0 ${Math.max(12, Math.min(widthPercent(5), 28))}px`;

  const contentStyle = {
    padding: responsivePadding,
    flex: 1,
    overflowY: "auto",
    ...style
  };

  return (
    <div data-card-content style={contentStyle} className="auth-card-content">
      {children}
    </div>
  );
};