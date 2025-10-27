import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import BottomNavbar from "../components/BottomNavbar.jsx";
import { useAuth } from "../context/AuthContext";
import { get2FAStatus, disable2FA } from "../lib/api";

import "../styles/home-page.css";

export default function Profile() {
  const nav = useNavigate();
  const { logout, user } = useAuth();

  const [twoFAStatus, setTwoFAStatus] = useState({ is_enabled: false, backup_codes_count: 0 });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [code, setCode] = useState("");
  const [setupSeen, setSetupSeen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingStatus(true);
      try {
        const st = await get2FAStatus();
        if (mounted) setTwoFAStatus(st || { is_enabled: false });
      } catch (err) {
        console.debug("No se pudo obtener estado 2FA:", err?.response?.data || err.message);
      } finally {
        if (mounted) setLoadingStatus(false);
      }

      // Chequear si el usuario ya generó el QR (guardado en localStorage por el flujo 'Listo')
      try {
        if (user?.id) {
          const seen = localStorage.getItem(`2fa:seen:${user.id}`);
          if (mounted && seen) setSetupSeen(true);
        }
      } catch (e) {
        console.debug('localStorage read error', e);
      }
    };
    load();
    return () => (mounted = false);
  }, [user]);

  const handleEnable = () => {
    // We already have a dedicated page that starts the enable flow
    nav("/2fa/enable");
  };

  const handleDisable = async () => {
    if (!code || code.trim().length < 6) {
      alert("Ingresá el código TOTP de 6 dígitos para desactivar 2FA");
      return;
    }

    setDisabling(true);
    try {
      const resp = await disable2FA(code.trim());
      alert(resp?.message || "2FA deshabilitado");
      setTwoFAStatus((s) => ({ ...s, is_enabled: false }));
      setCode("");
    } catch (err) {
      console.error(err);
      alert("Error al deshabilitar 2FA: " + (err?.response?.data?.detail || err.message));
    } finally {
      setDisabling(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      nav('/login');
    } catch (err) {
      console.error("Logout error:", err);
      nav('/login');
    }
  };

  return (
    <div className="home-screen">
      <div className="home-screen__content">
        <div className="home-screen__content-inner scrollable-card">
          <article className="home-screen__card surface-animated">
            <div className="card-header">
              <h2>Información básica</h2>
            </div>
            <div className="card-body">
              <p>
                En la próxima actualización vas a poder editar tus datos, sumar mascotas y cargar notas
                para tener todo centralizado.
              </p>
            </div>
          </article>

          <article className="home-screen__card surface-animated">
            <div className="card-header">
              <h2>Seguridad y sesión</h2>
            </div>
            <div className="card-body">
              <p style={{ marginBottom: 12 }}>
                Desde acá podés administrar la autenticación en dos pasos (2FA) y cerrar sesión.
              </p>

              <div style={{ marginBottom: 12 }}>
                <strong>Estado 2FA:</strong> {loadingStatus ? 'cargando...' : twoFAStatus?.is_enabled ? 'Habilitado' : 'No habilitado'}
              </div>

              {!twoFAStatus?.is_enabled ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleEnable} style={{ padding: 10, borderRadius: 8 }} disabled={setupSeen}>
                      Habilitar 2FA
                    </button>
                    {setupSeen && (
                      <button onClick={() => nav('/2fa/verify-setup')} style={{ padding: 10, borderRadius: 8 }}>
                        Verificar configuración
                      </button>
                    )}
                  </div>
                  <small style={{ color: '#6B7280' }}>
                    {setupSeen ? 'Ya generaste el QR. Completá la verificación desde la pantalla de configuración.' : 'Al habilitar se generará QR y códigos de respaldo.'}
                  </small>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div>
                    <label>Ingresa código TOTP para desactivar:</label>
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ padding: 8, marginLeft: 8, borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleDisable} disabled={disabling} style={{ padding: 10, borderRadius: 8 }}>
                      {disabling ? 'Deshabilitando…' : 'Deshabilitar 2FA'}
                    </button>
                  </div>
                </div>
              )}

              <hr style={{ margin: '12px 0' }} />

              <div>
                <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', padding: 10, borderRadius: 8 }}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="home-screen__overlay home-screen__overlay--top">
        <div className="home-screen__overlay-content">
          <AppHeader
            className="app-header--overlay"
            title="Tus mejores amigos y vos"
            subtitle="Gestiona tu cuenta y la información de tus mascotas desde un solo lugar."
          />
        </div>
      </div>

      <div className="home-screen__overlay home-screen__overlay--bottom">
        <div className="home-screen__overlay-content home-screen__overlay-content--navbar">
          <BottomNavbar className="bottom-navbar--overlay" />
        </div>
      </div>
    </div>
  );
}
