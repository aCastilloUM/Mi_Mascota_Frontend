import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import EmailVerificationPending from "./pages/EmailVerificationPending.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Favorites from "./pages/Favorites.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileMenu from "./pages/ProfileMenu.jsx";
import Enable2FA from "./pages/Enable2FA.jsx";
import Verify2FASetup from "./pages/Verify2FASetup.jsx";
import PerfilPrivacidad from "./pages/PerfilPrivacidad.jsx";

function AppEntry() {
  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

  if (!hasSeenOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/login" replace />;
}

function OnboardingWithNavigation() {
  const navigate = useNavigate();

  return (
    <Onboarding
      force={true} // Cambiar a false en producción
      onDone={() => {
        localStorage.setItem("hasSeenOnboarding", "true");
        navigate("/login");
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalEventsHandler />
        <Routes>
          <Route path="/" element={<AppEntry />} />
          <Route path="/onboarding" element={<OnboardingWithNavigation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/2fa/enable" element={<Enable2FA />} />
          <Route path="/2fa/verify-setup" element={<Verify2FASetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/perfil" element={<ProfileMenu />} />
          <Route path="/perfil/privacidad" element={<PerfilPrivacidad />} />
          <Route path="/perfil-original" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Global event handler: stores last path and listens for postMessage, BroadcastChannel and storage events
function GlobalEventsHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  // Store last meaningful path (avoid storing verify-email path itself)
  useEffect(() => {
    try {
      // store last path for analytics/debug only, but don't rely on it for redirect
      if (location && location.pathname) {
        sessionStorage.setItem('mimascota:last_path', location.pathname + (location.search || ''));
      }
    } catch (e) {
      // noop
    }
  }, [location]);

  useEffect(() => {
    const handlePayload = (payload) => {
      try {
        // Always redirect to login when an email_verified event arrives.
        navigate('/login', { state: { message: payload?.message } });
      } catch (e) {
        try { navigate('/login'); } catch (e2) { /* noop */ }
      }
    };

    // BroadcastChannel listener
    let bc = null;
    try {
      bc = new BroadcastChannel('mimascota:email_events');
      bc.addEventListener('message', (ev) => {
        if (ev?.data?.type === 'email_verified') handlePayload(ev.data.payload);
      });
    } catch (e) {
      bc = null;
    }

    // storage event (localStorage fallback)
    const onStorage = (ev) => {
      if (ev.key === 'mimascota:email_verified' && ev.newValue) {
        try { const payload = JSON.parse(ev.newValue); handlePayload(payload); } catch (e) { handlePayload(); }
      }
    };
    window.addEventListener('storage', onStorage);

    // postMessage (from opener)
    const onMessage = (ev) => {
      try {
        const data = ev.data;
        if (data && data.type === 'mimascota:email_verified') {
          handlePayload(data.payload);
        }
      } catch (e) {
        // noop
      }
    };
    window.addEventListener('message', onMessage);

    return () => {
      try { if (bc) bc.close(); } catch (e) {}
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
    };
  }, [navigate]);
  return null;
}
