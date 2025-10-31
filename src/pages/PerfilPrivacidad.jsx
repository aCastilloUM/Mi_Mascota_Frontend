import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PerfilPrivacidad() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h2>Privacidad y seguridad</h2>
      <p style={{ color: '#334155' }}>
        Administra tus opciones de privacidad y seguridad de la cuenta.
      </p>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => nav('/2fa/enable')}
          style={{
            background: '#0EA5A4',
            color: '#fff',
            border: 'none',
            padding: '10px 14px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Habilitar 2FA
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3>Cuenta</h3>
        <div style={{ color: '#475569' }}>
          <p><strong>Usuario:</strong> {user?.display_name || user?.name || '—'}</p>
          <p><strong>Rol:</strong> {user?.role || '—'}</p>
        </div>
      </div>
    </div>
  );
}
