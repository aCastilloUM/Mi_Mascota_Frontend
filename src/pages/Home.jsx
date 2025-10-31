import { useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import BottomNavbar from "../components/BottomNavbar.jsx";
import MapSearch from "../components/MapSearch.jsx";
import VetLayer from "../components/VetLayer.jsx";
import VetCard from "../components/VetCard.jsx";

import "../styles/home-page.css";

export default function Home() {
  // Montevideo, Uruguay as default center
  const defaultCenter = useMemo(() => [-34.9011, -56.1645], []);
  const [selectedVet, setSelectedVet] = useState(null);

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
        {/* Layer that fetches and shows nearby veterinarians (Overpass / OSM or Google Places) */}
        <VetLayer defaultCenter={defaultCenter} defaultRadius={7000} onSelect={(v) => setSelectedVet(v)} />
      </MapContainer>

      {/* Floating card that shows selected veterinarian details */}
      {selectedVet ? (
        <div className="home-screen__vet-card-wrap">
          <VetCard place={selectedVet} onClose={() => setSelectedVet(null)} />
        </div>
      ) : null}

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
