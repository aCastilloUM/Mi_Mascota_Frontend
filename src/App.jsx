import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Onboarding from "./pages/onboarding.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/onboarding"
            element={
              <Onboarding
                force={true}
                onDone={() => console.log("✅ Onboarding terminado")}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* más rutas */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
