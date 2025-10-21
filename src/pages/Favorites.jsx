import AppHeader from "../components/AppHeader.jsx";
import BottomNavbar from "../components/BottomNavbar.jsx";

import "../styles/home-page.css";

export default function Favorites() {
  return (
    <div className="home-screen">
      <div className="home-screen__content">
          <div className="home-screen__content-inner scrollable-card">
            <article className="home-screen__card surface-animated">
              <div className="card-header">
                <h2>Tu lista está vacía</h2>
              </div>
              <div className="card-body">
                <p>
                  Todavía no agregaste lugares o profesionales. Tocá el corazón dentro del mapa para
                  guardarlos y tenerlos a mano acá.
                </p>
              </div>
            </article>
          </div>
      </div>

      <div className="home-screen__overlay home-screen__overlay--top">
        <div className="home-screen__overlay-content">
            <AppHeader
              className="app-header--overlay"
              title="Favoritos"
              subtitle="Accedé rápido a los lugares y profesionales que más usás."
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
