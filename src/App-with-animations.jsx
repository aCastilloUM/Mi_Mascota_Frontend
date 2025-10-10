import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { PageTransition, useMainNavigation } from './animations';
import { AuthProvider } from './context/AuthContext';

// Páginas de autenticación (usando AuthCardTransition internamente)
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

// Páginas principales (usando PageTransition)
import Home from './pages/Home';
import Profile from './pages/Profile';

// Layout para páginas principales con animaciones
function MainLayout() {
  const router = useMainNavigation();
  
  return (
    <PageTransition {...router.getPageProps()}>
      <div className="main-layout">
        {/* Header, sidebar, etc. */}
        <Outlet />
      </div>
    </PageTransition>
  );
}

// Layout para páginas de autenticación (sin layout adicional)
function AuthLayout() {
  return <Outlet />; // Las páginas auth manejan sus propias transiciones
}

// Configuración del router
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'onboarding', element: <Onboarding /> },
    ],
  },
  {
    path: '/app',
    element: <MainLayout />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'profile', element: <Profile /> },
      // Más rutas principales...
    ],
  },
]);

// Componente principal
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

/*
NOTAS DE IMPLEMENTACIÓN:

1. **Separación de Layouts**:
   - AuthLayout: Para Login, Register, Onboarding (sin animaciones globales)
   - MainLayout: Para páginas principales (con animaciones globales)

2. **Transiciones por Contexto**:
   - Páginas de auth: Usan AuthCardTransition internamente
   - Páginas principales: El layout aplica PageTransition a todas

3. **Rutas Anidadas**:
   - /login, /register, /onboarding → AuthLayout
   - /app/home, /app/profile → MainLayout con transiciones

4. **Performance**:
   - Cada contexto maneja sus propias animaciones
   - No hay conflictos entre diferentes tipos de transición
   - Outlet permite transiciones suaves entre rutas hermanas

5. **Escalabilidad**:
   - Fácil agregar nuevas páginas a cualquier layout
   - Transiciones consistentes automáticamente
   - Configuración centralizada por tipo de página
*/