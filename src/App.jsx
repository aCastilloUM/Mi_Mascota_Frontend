import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

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
        <Routes>
          <Route path="/" element={<AppEntry />} />
          <Route path="/onboarding" element={<OnboardingWithNavigation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/home" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
