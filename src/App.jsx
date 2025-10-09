import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import EmailVerificationPending from "./pages/EmailVerificationPending.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

// Componente para manejar la ruta raíz
function AppEntry() {
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
  
  if (!hasSeenOnboarding) {
    // Primera vez: mostrar onboarding
    return <Navigate to="/onboarding" replace />;
  } else {
    // Ya vio onboarding: ir a login o home según autenticación
    return <Navigate to="/login" replace />;
  }
}

function OnboardingWithNavigation() {
  const navigate = useNavigate();
  
  return (
    <Onboarding
      force={true} // Forzar para testing - cambiar a false en producción
      onDone={() => {
        console.log("✅ Onboarding terminado");
        // Marcar que ya vio el onboarding
        localStorage.setItem('hasSeenOnboarding', 'true');
        navigate("/login");
      }}
    />
  );
}

// Página temporal de Home (placeholder)
function HomePage() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>🏠 Bienvenido a Mi Mascota</h1>
      <p>Esta será la página principal de la aplicación</p>
      <button 
        onClick={() => {
          localStorage.removeItem('hasSeenOnboarding');
          localStorage.removeItem('accessToken');
          window.location.href = '/';
        }}
        style={{
          padding: '10px 20px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Reset App (Borrar datos para testing)
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppEntry />} />
          <Route path="/onboarding" element={<OnboardingWithNavigation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/home" element={<HomePage />} />

          {/* más rutas */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
