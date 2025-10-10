import { useNavigate } from 'react-router-dom';
import { useAnimatedNavigation, animationPresets, navigationDirections } from './index';

/**
 * Hook especializado para navegación con animaciones en React Router
 * Simplifica el uso de animaciones entre páginas
 */
export const useAnimatedRouter = (options = {}) => {
  const navigate = useNavigate();
  const {
    defaultDuration = 300,
    defaultPreset = 'auth',
    ...transitionOptions
  } = options;

  const transition = useAnimatedNavigation(navigate, defaultDuration);

  // Funciones de navegación específicas para diferentes flujos
  const navigationMethods = {
    // Navegación hacia adelante (siguiente página en un flujo)
    goForward: (path, preset = defaultPreset) => {
      const config = animationPresets[preset] || animationPresets.auth;
      transition.executeTransition(() => {
        navigate(path);
      }, navigationDirections.FORWARD);
    },

    // Navegación hacia atrás (página anterior)
    goBack: (path = -1, preset = defaultPreset) => {
      const config = animationPresets[preset] || animationPresets.auth;
      transition.executeTransition(() => {
        if (typeof path === 'number') {
          navigate(path); // Usar history.go()
        } else {
          navigate(path);
        }
      }, navigationDirections.BACKWARD);
    },

    // Navegación a Login
    toLogin: (fromPage = '') => {
      const direction = fromPage === 'register' 
        ? navigationDirections.BACKWARD 
        : navigationDirections.FORWARD;
      
      transition.executeTransition(() => {
        navigate('/login');
      }, direction);
    },

    // Navegación a Register
    toRegister: (fromPage = '') => {
      const direction = fromPage === 'login' 
        ? navigationDirections.FORWARD 
        : navigationDirections.BACKWARD;
      
      transition.executeTransition(() => {
        navigate('/register');
      }, direction);
    },

    // Navegación al Home
    toHome: () => {
      transition.executeTransition(() => {
        navigate('/home', { replace: true });
      }, navigationDirections.FORWARD);
    },

    // Navegación personalizada con opciones completas
    navigateTo: (path, direction = navigationDirections.FORWARD, options = {}) => {
      transition.executeTransition(() => {
        navigate(path, options);
      }, direction);
    },

    // Reemplazar página actual (sin animación de dirección)
    replacePage: (path, options = {}) => {
      transition.executeTransition(() => {
        navigate(path, { replace: true, ...options });
      }, navigationDirections.FORWARD);
    },

    // Navegación condicional (con validación)
    conditionalNavigate: async (path, validationFn, direction = navigationDirections.FORWARD) => {
      if (transition.isTransitioning) return false;
      
      try {
        const isValid = await validationFn();
        if (isValid) {
          transition.executeTransition(() => {
            navigate(path);
          }, direction);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Validation failed:', error);
        return false;
      }
    },
  };

  return {
    // Estados de transición
    ...transition,
    
    // Métodos de navegación
    ...navigationMethods,
    
    // Función de navegación original (sin animación)
    navigateWithoutAnimation: navigate,
    
    // Helper para obtener props de animación
    getPageProps: () => transition.getAnimationProps(),
  };
};

/**
 * Hook específico para páginas de autenticación
 * Pre-configurado para flujos de Login/Register/Onboarding
 */
export const useAuthNavigation = () => {
  return useAnimatedRouter({
    defaultPreset: 'auth',
    defaultDuration: 450, // 🎯 Duración más suave
  });
};

/**
 * Hook específico para páginas principales de la app
 */
export const useMainNavigation = () => {
  return useAnimatedRouter({
    defaultPreset: 'main',
    defaultDuration: 200,
  });
};