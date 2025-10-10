# 🎬 Sistema de Animaciones de Páginas

Sistema completo y reutilizable para agregar transiciones suaves entre páginas en la aplicación.

## 📁 Estructura

```
src/animations/
├── usePageTransition.js    # Hook principal para lógica de transiciones
├── PageTransition.jsx      # Componentes de transición reutilizables
├── useAnimatedRouter.js    # Hook para navegación con React Router
└── index.js               # Exportaciones y configuraciones
```

## 🚀 Uso Rápido

### 1. Para páginas de autenticación (Login, Register, etc.)

```jsx
import { AuthCardTransition, useAuthNavigation } from '../animations';

export default function Login() {
  const router = useAuthNavigation();

  const handleGoToRegister = () => {
    router.toRegister('login'); // Animación hacia adelante
  };

  const handleSubmitLogin = async (data) => {
    const result = await login(data);
    if (result.success) {
      router.toHome(); // Navegación al home con animación
    }
  };

  return (
    <AuthCardTransition {...router.getPageProps()}>
      {/* Contenido de la página */}
    </AuthCardTransition>
  );
}
```

### 2. Para páginas principales de la app

```jsx
import { PageTransition, useMainNavigation } from '../animations';

export default function Profile() {
  const router = useMainNavigation();

  return (
    <PageTransition {...router.getPageProps()}>
      {/* Contenido de la página */}
    </PageTransition>
  );
}
```

## 🎯 Hooks Disponibles

### `useAuthNavigation()`
Hook pre-configurado para páginas de autenticación (Login, Register, Onboarding).
- Duración: 300ms
- Tipo: slide
- Incluye métodos específicos: `toLogin()`, `toRegister()`, `toHome()`

### `useMainNavigation()`
Hook para páginas principales de la aplicación.
- Duración: 200ms
- Tipo: fade

### `useAnimatedRouter(options)`
Hook personalizable para cualquier flujo:

```jsx
const router = useAnimatedRouter({
  defaultPreset: 'modal',
  defaultDuration: 250,
});
```

## 🎨 Métodos de Navegación

### Navegación Básica
```jsx
// Hacia adelante
router.goForward('/next-page');

// Hacia atrás
router.goBack(); // O router.goBack('/specific-page');

// Navegación personalizada
router.navigateTo('/page', 'forward', { replace: true });
```

### Navegación Específica para Auth
```jsx
// Ir a Login
router.toLogin('register'); // Desde register (animación hacia atrás)
router.toLogin(); // Desde cualquier otra página (animación hacia adelante)

// Ir a Register
router.toRegister('login'); // Desde login (animación hacia adelante)

// Ir al Home
router.toHome(); // Siempre hacia adelante y con replace
```

### Navegación Condicional
```jsx
// Con validación
const success = await router.conditionalNavigate(
  '/dashboard',
  async () => {
    // Lógica de validación
    return user.isAuthenticated;
  },
  'forward'
);
```

## 🎭 Componentes de Transición

### `AuthCardTransition`
Optimizado para páginas de autenticación con efectos de blur y sombra.

```jsx
<AuthCardTransition {...router.getPageProps()}>
  <AuthCard>
    {/* Contenido */}
  </AuthCard>
</AuthCardTransition>
```

### `PageTransition`
Componente genérico con múltiples tipos de animación.

```jsx
<PageTransition 
  type="slide" 
  direction="forward" 
  duration={300}
  {...router.getPageProps()}
>
  {/* Contenido */}
</PageTransition>
```

### `withPageTransition(Component)`
HOC para envolver componentes existentes:

```jsx
const AnimatedProfile = withPageTransition(ProfileComponent);
```

## ⚙️ Configuraciones Predefinidas

```jsx
animationPresets = {
  auth: { type: 'slide', duration: 300 },      // Login, Register
  wizard: { type: 'slide', duration: 250 },    // Onboarding, pasos
  main: { type: 'fade', duration: 200 },       // Páginas principales
  modal: { type: 'scale', duration: 200 },     // Modales
  content: { type: 'bounce', duration: 350 },  // Páginas con contenido
  quick: { type: 'fade', duration: 150 },      // Navegación rápida
}
```

## 🎪 Tipos de Animación

- **slide**: Deslizamiento horizontal (izquierda/derecha según dirección)
- **fade**: Desvanecimiento con opacidad
- **scale**: Escalado desde el centro
- **bounce**: Efecto de rebote suave

## 🧭 Direcciones

```jsx
navigationDirections = {
  FORWARD: 'forward',   // Hacia adelante en el flujo
  BACKWARD: 'backward', // Hacia atrás en el flujo
  UP: 'up',            // Hacia arriba
  DOWN: 'down',        // Hacia abajo
}
```

## 📱 Estados de Transición

Todos los hooks proporcionan estos estados:

```jsx
const router = useAuthNavigation();

// Estados disponibles
router.isTransitioning  // true durante la animación
router.direction        // 'forward', 'backward', etc.
router.phase           // 'idle', 'exit', 'enter'

// Props para componentes
const pageProps = router.getPageProps();
```

## 🛠️ Ejemplo Completo: Migrar página existente

### Antes (sin animaciones)
```jsx
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <AuthCard>
      {/* contenido */}
    </AuthCard>
  );
}
```

### Después (con animaciones)
```jsx
import { AuthCardTransition, useAuthNavigation } from '../animations';

export default function Login() {
  const router = useAuthNavigation();
  
  const handleGoToRegister = () => {
    router.toRegister('login'); // Con animación
  };

  return (
    <AuthCardTransition {...router.getPageProps()}>
      <AuthCard>
        {/* contenido */}
      </AuthCard>
    </AuthCardTransition>
  );
}
```

## 🚨 Consideraciones Importantes

### Performance
- Las animaciones usan `transform` y `opacity` para mejor rendimiento
- Se aplica `will-change` durante las transiciones
- Duración optimizada para móviles (≤ 300ms en general)

### Estados de Loading
- Deshabilitar botones durante `router.isTransitioning`
- No iniciar nuevas transiciones si ya hay una en curso

### Accesibilidad
- Respetar `prefers-reduced-motion`
- Transiciones suaves que no causen mareos
- Duración razonable para todas las animaciones

## 🔧 Personalización

### Crear preset personalizado
```jsx
// En tu página/componente
const router = useAnimatedRouter({
  defaultDuration: 400,
  defaultPreset: 'custom',
});

// O usar directamente
router.navigateTo('/page', 'forward', { 
  customAnimationType: 'bounce',
  duration: 500 
});
```

### Easing personalizado
Las animaciones usan `cubic-bezier(0.4, 0, 0.2, 1)` por defecto, optimizado para una experiencia suave y natural.

---

¡Con este sistema, todas las transiciones entre páginas serán consistentes y profesionales! 🎉