import AppHeader from "../components/AppHeader.jsx";
import BottomNavbar from "../components/BottomNavbar.jsx";

import "../styles/home-page.css";

export default function Profile() {
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
              <h2>SesiÃ³n y dispositivos</h2>
            </div>
            <div className="card-body">
              <p>
                Desde aca vas a administrar sesiones activas, cerrar sesión rápidamente y vincular
                nuevos dispositivos cuando esté disponible.
              </p>
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
