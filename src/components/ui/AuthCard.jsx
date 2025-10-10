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
  const { isMobile, isSmallMobile, width, height } = useResponsive();
  
  // Usar el sistema inteligente de detección
  const { cardRef, autoHeight: smartAutoHeight, optimalHeight, debugInfo } = useSmartCardHeight(cardType);
  
  // Decidir si usar autoHeight manual o el inteligente
  const finalAutoHeight = cardType !== 'auto' ? smartAutoHeight : autoHeight;
  
  // Responsive maxWidth
  const responsiveMaxWidth = maxWidth || (
    isSmallMobile ? "280px" : 
    isMobile ? "300px" : 
    "320px"
  );
  
  // Altura dinámica basada en el sistema inteligente
  const responsiveHeight = !finalAutoHeight 
    ? "auto" // Altura automática sin padding extra
    : typeof optimalHeight === 'number' 
      ? `${Math.min(optimalHeight, isMobile ? height * 0.8 : height * 0.9)}px` // Límite más estricto para móviles
      : "auto";
  
  const minHeight = !finalAutoHeight 
    ? "auto" // Sin altura mínima para contenido simple
    : typeof optimalHeight === 'number'
      ? `${Math.min(optimalHeight, isMobile ? height * 0.8 : height * 0.9)}px`
      : "auto";

  const cardStyle = {
    position: "relative",
    width: "100%",
    maxWidth: responsiveMaxWidth,
    height: responsiveHeight,
    minHeight: minHeight,
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    borderRadius: isMobile ? 8 : 12,
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: isMobile 
      ? "0 2px 12px rgba(0, 0, 0, 0.12)" 
      : "0 4px 16px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(6px)",
    overflow: !finalAutoHeight ? "visible" : "hidden",
    paddingTop: isMobile ? 16 : 20,
    paddingBottom: isMobile ? 16 : 20,
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
  const { isMobile, isSmallMobile } = useResponsive();
  
  // Padding responsive
  const responsivePadding = padding || (
    isSmallMobile ? "0 16px" :
    isMobile ? "0 18px" : 
    "0 20px"
  );

  const contentStyle = {
    padding: responsivePadding,
    flex: 1, // Permitir que el contenido se expanda
    overflowY: "auto", // Scroll interno cuando sea necesario
    ...style
  };

  return (
    <div data-card-content style={contentStyle} className="auth-card-content">
      {children}
    </div>
  );
};