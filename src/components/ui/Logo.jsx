import React from "react";
import logoTop from "../../assets/logos/dog+cat.png";
import { useResponsive } from "../../hooks/useResponsive";

export const Logo = ({ 
  size, 
  style = {},
  className = "",
  alt = "Mi Mascota"
}) => {
  const { isMobile, isSmallMobile } = useResponsive();
  
  // Tamaño responsive del logo
  const responsiveSize = size || (
    isSmallMobile ? 100 :
    isMobile ? 110 : 
    130
  );

  const logoStyle = {
    width: responsiveSize,
    height: responsiveSize,
    objectFit: "contain",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))", // Sombra mucho más sutil
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
  const { isMobile } = useResponsive();
  
  const wrapStyle = {
    position: "relative",
    zIndex: 2,
    marginBottom: isMobile ? -28 : -36, // Menos overlap en móvil
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