import { useState, useEffect } from 'react';

// Breakpoints estándar para la aplicación
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Llamar una vez para setear el tamaño inicial
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < BREAKPOINTS.mobile;
  const isTablet = windowSize.width >= BREAKPOINTS.mobile && windowSize.width < BREAKPOINTS.tablet;
  const isDesktop = windowSize.width >= BREAKPOINTS.tablet;
  const isSmallMobile = windowSize.width < 375;
  const isLargeMobile = windowSize.width >= 375 && windowSize.width < BREAKPOINTS.mobile;

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeMobile,
    breakpoints: BREAKPOINTS
  };
};

// Helper para obtener estilos responsive
export const getResponsiveStyles = (breakpoint) => {
  const { isMobile, isTablet, isDesktop, isSmallMobile } = useResponsive();
  
  if (breakpoint === 'mobile' && isMobile) return true;
  if (breakpoint === 'tablet' && isTablet) return true;
  if (breakpoint === 'desktop' && isDesktop) return true;
  if (breakpoint === 'small-mobile' && isSmallMobile) return true;
  
  return false;
};