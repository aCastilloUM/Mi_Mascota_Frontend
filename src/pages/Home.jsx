import { useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import BottomNavbar from "../components/BottomNavbar.jsx";
import MapSearch from "../components/MapSearch.jsx";

import "../styles/home-page.css";

export default function Home() {
  const defaultCenter = useMemo(() => [-34.6037, -58.3816], []);

  return (
    <div className="home-screen">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom
        zoomControl={false} /* hide default + / - controls */
        className="home-screen__map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <div className="home-screen__overlay home-screen__overlay--top">
        <div className="home-screen__overlay-content home-overlay-center">
          <MapSearch
            onSearch={(q) => {
              // Emit search query; actual search logic is managed by the backend.
              // The parent can listen to this prop when wiring map search.
              console.log("Map search:", q);
            }}
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
