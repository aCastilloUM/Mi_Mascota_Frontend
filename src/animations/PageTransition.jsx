import React from 'react';

/**
 * Componente wrapper que aplica animaciones a las páginas
 * Envuelve el contenido de cualquier página para aplicar transiciones suaves
 */
export const PageTransition = ({ 
  children, 
  isTransitioning = false,
  transitionPhase = 'idle',
  direction = 'forward',
  duration = 300,
  type = 'slide', // 'slide' | 'fade' | 'scale' | 'bounce'
  className = '',
  style = {},
  ...props 
}) => {
  
  /**
   * Obtiene los estilos de animación según el tipo y fase
   */
  const getAnimationStyles = () => {
    const baseTransition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    const animations = {
      slide: {
        idle: {
          opacity: 1,
          transform: 'translateX(0) scale(1)',
        },
        exit: {
          opacity: 0.3,
          transform: direction === 'forward' 
            ? 'translateX(-30px) scale(0.98)' 
            : 'translateX(30px) scale(0.98)',
        },
        enter: {
          opacity: 0.7,
          transform: direction === 'forward'
            ? 'translateX(15px) scale(0.99)'
            : 'translateX(-15px) scale(0.99)',
        },
      },
      
      fade: {
        idle: {
          opacity: 1,
          transform: 'scale(1)',
        },
        exit: {
          opacity: 0.2,
          transform: 'scale(0.95)',
        },
        enter: {
          opacity: 0.6,
          transform: 'scale(0.98)',
        },
      },
      
      scale: {
        idle: {
          opacity: 1,
          transform: 'scale(1) rotate(0deg)',
        },
        exit: {
          opacity: 0.4,
          transform: 'scale(0.9) rotate(1deg)',
        },
        enter: {
          opacity: 0.8,
          transform: 'scale(0.95) rotate(-0.5deg)',
        },
      },
      
      bounce: {
        idle: {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
        },
        exit: {
          opacity: 0.5,
          transform: 'translateY(-10px) scale(0.96)',
        },
        enter: {
          opacity: 0.8,
          transform: 'translateY(5px) scale(0.98)',
        },
      },
    };

    const currentAnimation = animations[type] || animations.slide;
    
    return {
      transition: baseTransition,
      ...currentAnimation[transitionPhase],
      ...style, // Permitir override de estilos
    };
  };

  return (
    <div
      className={`page-transition ${className}`}
      style={getAnimationStyles()}
      data-transitioning={isTransitioning}
      data-phase={transitionPhase}
      data-direction={direction}
      data-animation-type={type}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * HOC que envuelve automáticamente una página con animaciones
 * @param {React.Component} WrappedComponent - Componente a envolver
 * @param {Object} animationOptions - Opciones de animación
 */
export const withPageTransition = (WrappedComponent, animationOptions = {}) => {
  const AnimatedPage = (props) => {
    return (
      <PageTransition {...animationOptions}>
        <WrappedComponent {...props} />
      </PageTransition>
    );
  };
  
  AnimatedPage.displayName = `withPageTransition(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AnimatedPage;
};

/**
 * Componente específico para animaciones de AuthCard
 * Optimizado para las transiciones entre páginas de autenticación
 */
export const AuthCardTransition = ({ 
  children, 
  isTransitioning = false,
  transitionPhase = 'idle',
  direction = 'forward',
  duration = 300,
  ...props 
}) => {
  const getAuthCardStyles = () => {
    const baseTransition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`; // 🎯 Easing más suave
    
    const phases = {
      idle: {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        filter: 'blur(0px)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
      exit: {
        opacity: 0.5, // 🎯 Menos transparencia
        transform: direction === 'forward' 
          ? 'translateY(-15px) scale(0.97)' // 🎯 Movimiento más sutil
          : 'translateY(15px) scale(0.97)',
        filter: 'blur(1.5px)', // 🎯 Menos blur
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      },
      enter: {
        opacity: 0.85, // 🎯 Transición más gradual
        transform: direction === 'forward'
          ? 'translateY(8px) scale(0.985)' // 🎯 Movimiento más sutil
          : 'translateY(-8px) scale(0.985)',
        filter: 'blur(0.5px)', // 🎯 Menos blur
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
      },
    };

    return {
      transition: baseTransition,
      ...phases[transitionPhase],
      willChange: 'transform, opacity, filter, box-shadow', // Optimización de performance
    };
  };

  return (
    <div
      className="auth-card-transition"
      style={getAuthCardStyles()}
      data-transitioning={isTransitioning}
      data-phase={transitionPhase}
      data-direction={direction}
      {...props}
    >
      {children}
    </div>
  );
};