# 🔄 Guía de Migración: Animaciones de Páginas

Pasos para migrar las páginas existentes al nuevo sistema de animaciones.

## 📋 Lista de Verificación

### ✅ Páginas por Migrar
- [ ] `Login.jsx` → Usar `useAuthNavigation` + `AuthCardTransition`
- [ ] `Register.jsx` → Usar `useAuthNavigation` + `AuthCardTransition`  
- [ ] `Onboarding.jsx` → Usar `useAuthNavigation` + `AuthCardTransition`
- [ ] Páginas principales → Usar `useMainNavigation` + `PageTransition`

### ✅ Archivos de Configuración
- [ ] Actualizar `App.jsx` con layouts animados
- [ ] Verificar rutas en `react-router-dom`
- [ ] Probar transiciones en diferentes dispositivos

## 🚀 Pasos de Migración

### 1. Login.jsx

```diff
// ANTES
- import { useNavigate } from 'react-router-dom';
+ import { AuthCardTransition, useAuthNavigation } from '../animations';

export default function Login() {
-  const navigate = useNavigate();
+  const router = useAuthNavigation();

   const handleGoToRegister = () => {
-    navigate('/register');
+    router.toRegister('login');
   };

   const handleLogin = async (data) => {
     const result = await login(data);
     if (result.success) {
-      navigate('/home');
+      router.toHome();
     }
   };

   return (
+    <AuthCardTransition {...router.getPageProps()}>
       <AuthCard>
         {/* contenido existente */}
       </AuthCard>
+    </AuthCardTransition>
   );
}
```

### 2. Register.jsx

```diff
// ANTES
- import { useNavigate } from 'react-router-dom';
+ import { AuthCardTransition, useAuthNavigation } from '../animations';

export default function Register() {
-  const navigate = useNavigate();
+  const router = useAuthNavigation();

   const handleGoToLogin = () => {
-    navigate('/login');
+    router.toLogin('register');
   };

   const handleRegister = async (data) => {
     const result = await register(data);
     if (result.success) {
-      navigate('/onboarding');
+      router.goForward('/onboarding');
     }
   };

   return (
+    <AuthCardTransition {...router.getPageProps()}>
       <AuthCard>
         {/* contenido existente - mantener animaciones de steps */}
       </AuthCard>
+    </AuthCardTransition>
   );
}
```

### 3. Onboarding.jsx

```diff
// ANTES
- import { useNavigate } from 'react-router-dom';
+ import { AuthCardTransition, useAuthNavigation } from '../animations';

export default function Onboarding() {
-  const navigate = useNavigate();
+  const router = useAuthNavigation();

   const handleComplete = () => {
-    navigate('/home');
+    router.toHome();
   };

   const handleSkip = () => {
-    navigate('/home');
+    router.toHome();
   };

   return (
+    <AuthCardTransition {...router.getPageProps()}>
       {/* contenido existente - mantener animaciones de steps */}
+    </AuthCardTransition>
   );
}
```

### 4. App.jsx - Configuración de Rutas

```diff
+ import { PageTransition, useMainNavigation } from './animations';

+ function MainLayout() {
+   const router = useMainNavigation();
+   
+   return (
+     <PageTransition {...router.getPageProps()}>
+       <div className="main-layout">
+         <Outlet />
+       </div>
+     </PageTransition>
+   );
+ }

const router = createBrowserRouter([
  {
    path: '/',
-   element: <App />,
+   element: <Outlet />, // AuthLayout
    children: [
      { index: true, element: <Login /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'onboarding', element: <Onboarding /> },
    ],
  },
+ {
+   path: '/app',
+   element: <MainLayout />,
+   children: [
+     { path: 'home', element: <Home /> },
+     { path: 'profile', element: <Profile /> },
+   ],
+ },
]);
```

## 🔧 Ajustes Específicos

### Login.jsx - Cambios Específicos

1. **Importaciones**:
```jsx
import { AuthCardTransition, useAuthNavigation } from '../animations';
```

2. **Hook de navegación**:
```jsx
const router = useAuthNavigation();
```

3. **Métodos de navegación**:
```jsx
// Ir a register
const handleGoToRegister = () => {
  router.toRegister('login');
};

// Después del login exitoso
const handleLogin = async (data) => {
  if (loading || router.isTransitioning) return;
  
  // ... lógica de login
  if (result.success) {
    router.toHome();
  }
};
```

4. **Envolver contenido**:
```jsx
return (
  <AuthLayout>
    <AuthCenterWrap>
      <AuthCardTransition {...router.getPageProps()}>
        <LogoWrap>
          <Logo />
        </LogoWrap>
        <AuthCard>
          {/* contenido existente */}
        </AuthCard>
      </AuthCardTransition>
    </AuthCenterWrap>
  </AuthLayout>
);
```

5. **Deshabilitar durante transiciones**:
```jsx
<AnimatedButton
  disabled={!isValid || loading || router.isTransitioning}
  // ...resto de props
>
```

### Register.jsx - Cambios Específicos

1. **Mantener animaciones de steps internas**:
```jsx
// MANTENER las animaciones existentes de pasos
// AGREGAR solo la transición de página completa

return (
  <AuthCardTransition {...router.getPageProps()}>
    <AuthCard>
      {/* Mantener toda la lógica de steps existente */}
      <div 
        style={{
          transform: `translateX(-${currentStep * 100}%)`,
          transition: 'transform 0.3s ease-in-out',
          // ... estilos existentes
        }}
      >
        {/* Steps existentes */}
      </div>
    </AuthCard>
  </AuthCardTransition>
);
```

## ⚡ Testing Rápido

### 1. Probar Transiciones
```bash
# Navegar entre páginas y verificar:
# ✅ Login → Register (slide hacia adelante)
# ✅ Register → Login (slide hacia atrás)  
# ✅ Login/Register → Home (slide hacia adelante)
# ✅ Onboarding → Home (slide hacia adelante)
```

### 2. Verificar Estados
```jsx
// En DevTools, verificar que estos estados cambien:
console.log({
  isTransitioning: router.isTransitioning,
  direction: router.direction,
  phase: router.phase,
});
```

### 3. Performance en Móvil
```bash
# Probar en dispositivos móviles:
# ✅ Animaciones fluidas (60fps)
# ✅ Sin lag en transiciones
# ✅ Botones deshabilitados durante transiciones
```

## 🚨 Problemas Comunes y Soluciones

### Problema: Doble animación
```jsx
// ❌ INCORRECTO: Animación de página + animación interna conflicto
<AuthCardTransition>
  <div style={{ transform: 'translateX(...)' }}> // Conflicto!

// ✅ CORRECTO: Separar animaciones
<AuthCardTransition> // Solo para transición de página
  <div> // Animaciones internas sin conflicto
```

### Problema: Navegación sin animación
```jsx
// ❌ INCORRECTO: Usar navigate directamente
navigate('/home');

// ✅ CORRECTO: Usar router con animación
router.toHome();
```

### Problema: Estados de loading
```jsx
// ✅ CORRECTO: Verificar ambos estados
if (loading || router.isTransitioning) return;
```

## ✨ Resultado Final

Después de la migración:

1. **Transiciones suaves** entre todas las páginas
2. **Consistencia visual** en toda la aplicación  
3. **Performance optimizada** en móviles
4. **Código más limpio** con hooks especializados
5. **Experiencia de usuario mejorada** con feedback visual

---

¡La migración debería tomar aproximadamente 30-45 minutos para todas las páginas! 🎉