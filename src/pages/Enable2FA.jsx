import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enable2FA, get2FAStatus } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";

export default function Enable2FA() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const nav = useNavigate();

  const onStart = async () => {
    setLoading(true);
    try {
      const resp = await enable2FA();
      setData(resp);
    } catch (err) {
      console.error(err);
      alert("Error al solicitar 2FA: " + (err?.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Chequear si 2FA ya está habilitado para este usuario; si está habilitado,
  // no deberíamos mostrar el QR ni los códigos de respaldo nuevamente.
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await get2FAStatus();
        if (!mounted) return;
        if (st?.is_enabled) {
          setData({ alreadyEnabled: true });
        }
      } catch (err) {
        // Ignorar errores (por ejemplo usuario no autenticado)
        console.debug("get2FAStatus error:", err?.response?.data || err?.message);
      }
    })();
    // tambien chequear si el usuario ya generó el QR anteriormente (localStorage)
    try {
      if (user?.id) {
        const seen = localStorage.getItem(`2fa:seen:${user.id}`);
        if (seen && mounted) {
          setData({ alreadySeen: true });
        }
      }
    } catch (e) {
      console.debug('localStorage read error', e);
    }

    return () => (mounted = false);
  }, [user]);

  

  const markSetupSeen = () => {
    if (!user?.id) return;
    try {
      localStorage.setItem(`2fa:seen:${user.id}`, String(Date.now()));
    } catch (e) {
      console.debug('localStorage error', e);
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
            <h2>Habilitar Autenticación en Dos Pasos (2FA)</h2>

            {!data ? (
              <div>
                <p>Al habilitar 2FA se generará una clave secreta y un QR para escanear con tu app (Authy/Google Authenticator).</p>
                <button onClick={onStart} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
                  {loading ? "Generando..." : "Generar QR y códigos de respaldo"}
                </button>
              </div>
            ) : (
              <div>
                {data.alreadyEnabled ? (
                  <div>
                    <p>La autenticación en dos pasos ya está habilitada para esta cuenta. No es posible volver a ver el QR ni los códigos de respaldo.</p>
                    <div style={{ marginTop: 12 }}>
                      <button onClick={() => nav('/perfil')} style={{ padding: 10, borderRadius: 8 }}>Volver al perfil</button>
                    </div>
                  </div>
                ) : data.alreadySeen ? (
                  <div>
                    <p>Ya generaste el QR y los códigos de respaldo para esta cuenta. No podés generar otro desde esta interfaz.</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button onClick={() => nav('/2fa/verify-setup')} style={{ padding: 10, borderRadius: 8 }}>Verificar configuración</button>
                      <button onClick={() => nav('/perfil')} style={{ padding: 10, borderRadius: 8 }}>Volver al perfil</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>Copiá el código secreto o escaneá el QR con tu app de autenticación:</p>
                    <div style={{ margin: '12px 0' }}>
                      {data.qr_code ? (
                        <img alt="qr" src={data.qr_code} style={{ maxWidth: 240, background: '#fff', padding: 8 }} />
                      ) : null}
                    </div>
                    <p><strong>Secret:</strong> <code>{data.secret}</code></p>

                    <div style={{ marginTop: 12 }}>
                      <h4>Códigos de respaldo (guardalos en un lugar seguro)</h4>
                      <ul>
                        {(data.backup_codes || []).map((c) => (
                          <li key={c}><code>{c}</code></li>
                        ))}
                      </ul>
                    </div>

                        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                          <button onClick={() => nav('/2fa/verify-setup', { state: { secret: data.secret } })} style={{ padding: 10, borderRadius: 8 }}>
                            Verificar configuración
                          </button>
                          <button onClick={() => { markSetupSeen(); nav('/perfil'); }} style={{ padding: 10, borderRadius: 8 }}>
                            Listo
                          </button>
                        </div>
                  </div>
                )}
              </div>
            )}
          </AuthCardContent>
        </AuthCard>
      </AuthCenterWrap>
    </AuthLayout>
  );
}
