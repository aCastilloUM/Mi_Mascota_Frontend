import AppHeader from "../components/AppHeader.jsx";
import BottomNavbar from "../components/BottomNavbar.jsx";

import "../styles/home-page.css";

export default function Services() {
  return (
    <div className="home-screen">
      <div className="home-screen__content">
        <div className="home-screen__content-inner scrollable-card">
          <article className="home-screen__card surface-animated">
            <div className="card-header">
              <h2>Agenda turnos y recordatorios</h2>
            </div>
            <div className="card-body">
              <p>
                Pronto vas a poder reservar turnos con veterinarias, configurar recordatorios de
                vacunas y encontrar profesionales sin salir de Mi Mascota.
              </p>
            </div>
          </article>

          <article className="home-screen__card surface-animated">
            <div className="card-header">
              <h2>¿Qué servicios sumarías?</h2>
            </div>
            <div className="card-body">
              <p>
                Estamos priorizando la próxima versión. Contanos qué funcionalidades te servirían
                primero para ayudarte mejor.
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className="home-screen__overlay home-screen__overlay--top">
        <div className="home-screen__overlay-content">
          <AppHeader
            className="app-header--overlay"
            title="Servicios - Próximamente"
            subtitle="Reservá turnos, recibí recordatorios y descubrí profesionales cerca tuyo."
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
