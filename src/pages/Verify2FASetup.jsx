import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verify2FASetup } from "../lib/api";
import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";

export default function Verify2FASetup() {
  const loc = useLocation();
  const nav = useNavigate();
  const secret = loc.state?.secret || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setLoading(true);
    try {
      const resp = await verify2FASetup(secret, code);
      alert(resp?.message || "2FA habilitado");
      nav('/perfil');
    } catch (err) {
      console.error(err);
      alert("Error de verificación: " + (err?.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCenterWrap>
        <LogoWrap>
          <Logo />
        </LogoWrap>

        <AuthCard cardType="settings" autoHeight>
          <AuthCardContent>
            <h2>Verificar configuración 2FA</h2>
            <p>Introduce el código de 6 dígitos que te muestra tu app (Authy/Google Authenticator).</p>

            <div style={{ margin: '12px 0' }}>
              <label>Secret (solo referencia):</label>
              <div><code>{secret}</code></div>
            </div>

            <div style={{ marginTop: 12 }}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código de 6 dígitos" style={{ padding: 8, width: '100%', borderRadius: 6 }} />
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={onVerify} disabled={loading} style={{ padding: 10, borderRadius: 8 }}>
                {loading ? 'Verificando...' : 'Verificar y habilitar 2FA'}
              </button>
            </div>
          </AuthCardContent>
        </AuthCard>
      </AuthCenterWrap>
    </AuthLayout>
  );
}
