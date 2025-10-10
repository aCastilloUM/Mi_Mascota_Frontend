import React from "react";
import { BeamsBackground } from "./BeamsBackground";
import { useResponsive } from "../../hooks/useResponsive";

const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

export const AuthLayout = ({ 
  children, 
  style = {},
  showBeamsBackground = true 
}) => {
  const screenStyle = {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    fontFamily: rounded,
    color: "#0A0F1E",
    ...style
  };

  return (
    <div style={screenStyle}>
      {showBeamsBackground && <BeamsBackground />}
      {children}
    </div>
  );
};

export const AuthCenterWrap = ({ 
  children, 
  padding,
  style = {}
}) => {
  const { width, height } = useResponsive();
  
  // Cálculo simplificado - el card se encarga de su propia altura
  const calculateResponsivePadding = (viewportWidth, viewportHeight) => {
    const logoHeight = 60;
    const minBottomPadding = 10;
    const safetyMargin = 40; // Margen de seguridad para navegación móvil
    
    // Padding dinámico más conservador
    const availableSpace = viewportHeight - logoHeight - safetyMargin;
    const topPaddingPercent = Math.min(availableSpace * 0.1, 40); // 10% del espacio, máximo 40px
    const topPadding = Math.max(10, topPaddingPercent);
    
    return `${topPadding}px clamp(12px, 4vw, 40px) ${minBottomPadding}px`;
  };

  const responsivePadding = padding || calculateResponsivePadding(width, height);

  const centerWrapStyle = {
    position: "relative",
    zIndex: 1,
    width: "100%",
    height: "100vh", // Altura fija
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start", // Cambiar a flex-start para alinear arriba
    alignItems: "center",
    padding: responsivePadding,
    boxSizing: "border-box",
    overflow: "hidden", // Sin scroll en el contenedor principal
    ...style
  };

  return (
    <div style={centerWrapStyle}>
      {children}
    </div>
  );
};