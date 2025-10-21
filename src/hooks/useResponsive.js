import { useState, useEffect } from 'react';

// Hook que devuelve el tamaño exacto de pantalla y helpers para porcentajes
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
    handleResize(); // Setea el tamaño inicial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helpers para calcular porcentajes
  const widthPercent = (percent) => (windowSize.width * percent) / 100;
  const heightPercent = (percent) => (windowSize.height * percent) / 100;

  return {
    width: windowSize.width, // ancho exacto en px
    height: windowSize.height, // alto exacto en px
    widthPercent, // función para obtener % del ancho
    heightPercent // función para obtener % del alto
  };
};