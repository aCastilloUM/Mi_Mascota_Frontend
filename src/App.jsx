import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Onboarding from "./pages/onboarding.jsx";
import Login from "./pages/login.jsx";
import MultiStepRegister from "./components/ui/MultiStepRegister.jsx";

function OnboardingWithNavigation() {
  const navigate = useNavigate();
  
  return (
    <Onboarding
      force={true} // Forzar para testing - cambiar a false en producción
      onDone={() => {
        console.log("✅ Onboarding terminado");
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
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnboardingWithNavigation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<MultiStepRegister />} />

          {/* más rutas */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
