import { useResponsive } from "./useResponsive";

// Hook para obtener tamaños de fuente responsive
export const useResponsiveText = () => {
  const { isMobile, isSmallMobile } = useResponsive();

  const getTextSize = (baseSize, mobileSize, smallMobileSize) => {
    if (isSmallMobile && smallMobileSize) return smallMobileSize;
    if (isMobile && mobileSize) return mobileSize;
    return baseSize;
  };

  return {
    // Títulos principales
    title: getTextSize("clamp(18px, 4.1vw, 20px)", "18px", "16px"),
    
    // Subtítulos
    subtitle: getTextSize("14px", "13px", "12px"),
    
    // Texto del cuerpo
    body: getTextSize("14px", "13px", "12px"),
    
    // Texto pequeño
    small: getTextSize("12px", "11px", "10px"),
    
    // Botones
    button: getTextSize("14px", "13px", "12px"),
    
    // Labels de formulario
    label: getTextSize("13px", "12px", "11px"),
    
    // Helper para obtener tamaño personalizado
    custom: getTextSize,
    
    // Utilidades comunes
    isMobile,
    isSmallMobile
  };
};