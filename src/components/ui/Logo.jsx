import React from "react";
import logoTop from "../../assets/logos/dog+cat.png";
import { useResponsive } from "../../hooks/useResponsive";

export const Logo = ({ 
  size, 
  style = {},
  className = "",
  alt = "Mi Mascota"
}) => {
  const { width } = useResponsive();
  // El logo ocupa entre 18% y 22% del ancho de pantalla, pero nunca menos de 80px ni más de 160px
  const responsiveSize = size || Math.max(80, Math.min(width * 0.50, 160));

  const logoStyle = {
    width: responsiveSize,
    height: responsiveSize,
    objectFit: "contain",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))", // Sombra mucho más sutil
    margin: "0px 0px -40px 0px",
    ...style
  };

  return (
    <img 
      src={logoTop} 
      alt={alt} 
      style={logoStyle}
      className={className}
    />
  );
};

export const LogoWrap = ({ children, style = {} }) => {
  const wrapStyle = {
    position: "relative",
    zIndex: 2,
    display: "grid",
    placeItems: "center",
    width: "100%",
    ...style
  };

  return (
    <div style={wrapStyle}>
      {children}
    </div>
  );
};