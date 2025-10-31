import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentProfile } from '../lib/api';
import AppHeader from '../components/AppHeader.jsx';
import BottomNavbar from '../components/BottomNavbar.jsx';
import { AuthCard, AuthCardContent } from '../components/ui/AuthCard';
import { Logo, LogoWrap } from '../components/ui/Logo';
import '../styles/home-page.css';

// Página de perfil / menú lateral estilo tarjeta (sin tocar otros archivos)
export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  // no collapsible settings header — show settings entries directly
  const [profileData, setProfileData] = useState(null);
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState(null);

  const handleSignOut = async () => {
    await logout();
    nav('/login');
  };

  // show real profile photo when available, otherwise show initial placeholder
  const avatarInitial = (user?.name || user?.display_name || 'U')[0].toUpperCase();
  const source = profileData || user || {};
  // show full name (name + second_name) or display_name; never fall back to email
  const fullName = source.name ? `${source.name}${source?.second_name ? ' ' + source.second_name : ''}` : (source.display_name || 'Usuario');
  const roleLabel = source.role ? (source.role === 'provider' ? 'Proveedor' : source.role === 'client' ? 'Usuario' : String(source.role)) : (source.roles?.includes('provider') ? 'Proveedor' : 'Miembro');

  useEffect(() => {
    let mounted = true;

    const resolvePhoto = (photo) => {
      if (!photo) return null;
      if (photo.startsWith('http')) return photo;
        const base = (import.meta.env.VITE_MINIO_PUBLIC_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        if (!base) {
          // no base configured; return raw photo (will likely fail) but log to help debugging
          try { console.debug('[ProfileMenu] no VITE_MINIO_PUBLIC_URL or VITE_API_URL configured, returning raw photo:', photo); } catch (e) {}
          return photo;
        }
        return base + (photo.startsWith('/') ? '' : '/') + photo;
    };

    const needFetch = !user || (!user.display_name && !user.photo_url && !user.name);
    if (needFetch) {
      getCurrentProfile()
        .then((p) => {
          if (!mounted) return;
          setProfileData(p || null);
          const photo = p?.photo_url || p?.photo;
          const resolved = resolvePhoto(photo);
          setResolvedPhotoUrl(resolved);
        })
        .catch(() => {
          /* ignore */
        });
    } else {
      const photo = user?.photo_url || user?.photo;
      setResolvedPhotoUrl(resolvePhoto(photo));
    }

    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="home-screen">
      <div className="home-screen__content">
        <div className="home-screen__content-inner scrollable-card" style={{ display: 'flex', justifyContent: 'center' }}>
          <article className="home-screen__card surface-animated" style={{ maxWidth: 640, width: '100%' }}>
            <div className="card-header">
              <h2>Perfil</h2>
            </div>
            <div className="card-body">
              <div style={styles.header}>
                <div style={styles.avatarWrap}>
                  {resolvedPhotoUrl ? (
                    <img src={resolvedPhotoUrl} alt="avatar" style={styles.avatar} onError={() => setResolvedPhotoUrl(null)} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>{avatarInitial}</div>
                  )}
                </div>
                <div style={{ marginLeft: 12, flex: 1 }}>
                  <div style={styles.nameRow}>
                    <div style={styles.name}>{fullName}</div>
                  </div>
                  <div style={styles.meta}>{roleLabel}</div>
                </div>
              </div>

              <div style={{ height: 12 }} />

              <div style={styles.section}>
                <div style={styles.subList}>
                  <button style={styles.subItem} onClick={() => nav('/perfil/editar')}>
                    <span>Editar Perfil</span>
                    <span style={styles.chev}>›</span>
                  </button>
                  <button style={styles.subItem} onClick={() => nav('/perfil/credenciales')}>
                    <span>Credenciales</span>
                    <span style={styles.chev}>›</span>
                  </button>
                  <button style={styles.subItem} onClick={() => nav('/perfil/privacidad')}>
                    <span>Privacidad y Seguridad</span>
                    <span style={styles.chev}>›</span>
                  </button>
                  <button style={styles.subItem} onClick={() => nav('/perfil/notificaciones')}>
                    <span>Notificaciones</span>
                    <span style={styles.chev}>›</span>
                  </button>
                </div>
              </div>

              <div style={{ height: 8 }} />

              <div style={styles.linkList}>
                <button style={styles.linkItem} onClick={() => nav('/mis-posteos')}>
                  <span>Posteos de Servicios</span>
                  <span style={styles.chev}>›</span>
                </button>
                <button style={styles.premiumBtn} onClick={() => nav('/premium')}>
                  <span>Empezar premium</span>
                  <span style={{ marginLeft: 10 }}>›</span>
                </button>
              </div>

              <div style={{ height: 12 }} />

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button style={styles.signout} onClick={handleSignOut}>Sign out</button>
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

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#F8FAFC',
    fontSize: 18,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: '#F8FAFC',
  },
  meta: {
    fontSize: 12,
    color: 'rgba(248,250,252,0.8)',
    marginTop: 4,
  },
  section: {
    marginTop: 6,
  },
  sectionToggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#F8FAFC' },
  sectionSubtitle: { fontSize: 12, color: 'rgba(248,250,252,0.8)' },
  subList: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 },
  subItem: { textAlign: 'left', padding: '0 12px', height: 48, minHeight: 48, borderRadius: 8, border: '1px solid transparent', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F8FAFC' },
  linkList: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 },
  linkItem: { padding: '0 12px', height: 48, minHeight: 48, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', textAlign: 'left', cursor: 'pointer', color: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  premiumBtn: { padding: '0 12px', height: 48, minHeight: 48, borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#ff7a18,#ff3b3b)', color: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  signout: { padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.02)', color: '#ff7b7b', cursor: 'pointer', fontWeight: 700 },
  chev: { color: 'rgba(248,250,252,0.85)', fontSize: 18, marginLeft: 8 },
};
