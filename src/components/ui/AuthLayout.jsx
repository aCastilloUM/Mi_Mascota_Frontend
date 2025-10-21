import React, { useEffect } from "react";
import { BeamsBackground } from "./BeamsBackground";
import { useResponsive } from "../../hooks/useResponsive";

const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

export const AuthLayout = ({ 
  children, 
  style = {},
  showBeamsBackground = true 
}) => {
  useEffect(() => {
    // Asegurar que el body pueda hacer scroll y que el fondo permanezca visible
    document.body.classList.add('auth-scroll-enabled');
    document.documentElement.classList.add('auth-scroll-enabled');
    return () => {
      document.body.classList.remove('auth-scroll-enabled');
      document.documentElement.classList.remove('auth-scroll-enabled');
    };
  }, []);
  const screenStyle = {
    position: "relative",
    inset: 0,
    width: "100%",
    minHeight: "100vh",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    fontFamily: rounded,
    color: "#0A0F1E",
    ...style
  };

  return (
    <div style={screenStyle}>
      {/* El fondo se mantiene fixed y detrás del contenido para que sea visible al hacer scroll */}
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
  const { width, height, widthPercent, heightPercent } = useResponsive();
  // Padding superior/inferior: 8% de la altura, entre 24 y 60px
  // Padding lateral: 4% del ancho, entre 12 y 32px
  const responsivePadding = padding || {
    paddingTop: Math.max(24, Math.min(heightPercent(8), 60)),
    paddingBottom: Math.max(24, Math.min(heightPercent(8), 60)),
    paddingLeft: Math.max(12, Math.min(widthPercent(4), 32)),
    paddingRight: Math.max(12, Math.min(widthPercent(4), 32)),
  };

  const centerWrapStyle = {
    position: "relative",
    zIndex: 1,
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    ...responsivePadding,
    boxSizing: "border-box",
    overflow: "visible",
    ...style
  };

  return (
    <div style={centerWrapStyle}>
      {children}
    </div>
  );
}