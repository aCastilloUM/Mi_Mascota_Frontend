import { useState, useEffect } from 'react';

/**
 * Hook para manejar animaciones de transición entre páginas
 * Proporciona estados y funciones para crear transiciones suaves
 */
export const usePageTransition = (duration = 450) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('forward'); // 'forward' | 'backward'
  const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle' | 'exit' | 'enter'

  /**
   * Ejecuta una transición entre páginas
   * @param {Function} navigationCallback - Función que realiza la navegación
   * @param {string} direction - Dirección de la transición ('forward' | 'backward')
   */
  const executeTransition = async (navigationCallback, direction = 'forward') => {
    if (isTransitioning) return; // Prevenir múltiples transiciones

    setIsTransitioning(true);
    setTransitionDirection(direction);
    setCurrentPhase('exit');

    // Fase 1: Animación de salida (más tiempo para exit)
    await new Promise(resolve => setTimeout(resolve, duration * 0.4));

    // Ejecutar navegación
    navigationCallback();

    // Fase 2: Animación de entrada (más tiempo para enter)
    setCurrentPhase('enter');
    await new Promise(resolve => setTimeout(resolve, duration * 0.6));

    // Limpiar estados
    setCurrentPhase('idle');
    setIsTransitioning(false);
  };

  /**
   * Obtiene los estilos CSS para la animación actual
   */
  const getTransitionStyles = () => {
    const baseStyles = {
      transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`, // 🎯 Easing más suave
    };

    switch (currentPhase) {
      case 'exit':
        return {
          ...baseStyles,
          opacity: 0.2, // 🎯 MUY visible
          transform: transitionDirection === 'forward' 
            ? 'translateX(-50px) scale(0.9)' // 🎯 Movimiento MUY visible
            : 'translateX(50px) scale(0.9)',
        };
      
      case 'enter':
        return {
          ...baseStyles,
          opacity: 0.6, // 🎯 Cambio visible
          transform: transitionDirection === 'forward'
            ? 'translateX(30px) scale(0.95)' // 🎯 Movimiento visible
            : 'translateX(-30px) scale(0.95)',
        };
      
      case 'idle':
      default:
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'translateX(0) scale(1)',
        };
    }
  };

  /**
   * Obtiene las propiedades para el contenedor de animación
   */
  const getAnimationProps = () => ({
    style: getTransitionStyles(),
    'data-transitioning': isTransitioning,
    'data-phase': currentPhase,
    'data-direction': transitionDirection,
  });

  return {
    isTransitioning,
    transitionDirection,
    currentPhase,
    executeTransition,
    getTransitionStyles,
    getAnimationProps,
  };
};

/**
 * Hook simplificado para navegación con animaciones
 * @param {Function} navigate - Función de navegación (useNavigate de React Router)
 * @param {number} duration - Duración de la animación en ms
 */
export const useAnimatedNavigation = (navigate, duration = 300) => {
  const transition = usePageTransition(duration);

  const animatedNavigate = (path, options = {}) => {
    const direction = options.direction || 'forward';
    
    transition.executeTransition(() => {
      navigate(path, options);
    }, direction);
  };

  return {
    ...transition,
    animatedNavigate,
  };
};