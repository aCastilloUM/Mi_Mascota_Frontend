// Exportar hooks de animación
export { usePageTransition, useAnimatedNavigation } from './usePageTransition';
export { useAnimatedRouter, useAuthNavigation, useMainNavigation } from './useAnimatedRouter';

// Exportar componentes de transición
export { 
  PageTransition, 
  withPageTransition, 
  AuthCardTransition 
} from './PageTransition';

// Configuraciones predefinidas para diferentes tipos de página
export const animationPresets = {
  // Para páginas de autenticación (Login, Register, etc.)
  auth: {
    type: 'slide',
    duration: 450, // 🎯 Más tiempo para transición suave
  },
  
  // Para onboarding y wizards
  wizard: {
    type: 'slide',
    duration: 400,
  },
  
  // Para páginas principales de la app
  main: {
    type: 'fade',
    duration: 350,
  },
  
  // Para modales y overlays
  modal: {
    type: 'scale',
    duration: 300,
  },
  
  // Para páginas con mucho contenido
  content: {
    type: 'bounce',
    duration: 500,
  },
  
  // Para navegación rápida
  quick: {
    type: 'fade',
    duration: 200,
  },
};

// Utilidades helper
export const navigationDirections = {
  FORWARD: 'forward',
  BACKWARD: 'backward',
  UP: 'up',
  DOWN: 'down',
};

export const transitionTypes = {
  SLIDE: 'slide',
  FADE: 'fade',
  SCALE: 'scale',
  BOUNCE: 'bounce',
};