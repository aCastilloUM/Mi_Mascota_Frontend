import React, { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";

/**
 * VetLayer
 * - Queries Overpass API for OSM objects with amenity=veterinary around given center
 * - Renders simple Markers with name/address
 *
 * Props:
 * - defaultCenter: [lat, lon]
 * - defaultRadius: meters
 */
export default function VetLayer({ defaultCenter = [-34.9011, -56.1645], defaultRadius = 5000, onSelect }) {
  const map = useMap();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const GOOGLE_KEY = typeof import.meta !== "undefined" ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY : undefined;

  // helper: load Google Maps JS API with Places library
  function loadGoogleMaps(key) {
    return new Promise((resolve, reject) => {
      if (!key) return reject(new Error("no key"));
      if (window.google && window.google.maps && window.google.maps.places) return resolve(window.google);
      const id = `google-maps-sdk`;
      if (document.getElementById(id)) {
        // script present but maybe not ready yet
        const check = () => {
          if (window.google && window.google.maps && window.google.maps.places) return resolve(window.google);
          setTimeout(check, 200);
        };
        return check();
      }
      const s = document.createElement("script");
      s.id = id;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.onload = () => {
        if (window.google && window.google.maps && window.google.maps.places) return resolve(window.google);
        return reject(new Error("google loaded but places lib missing"));
      };
      s.onerror = (e) => reject(new Error("google maps load error"));
      document.head.appendChild(s);
    });
  }

  // Haversine distance in meters
  function haversine(lat1, lon1, lat2, lon2) {
    function toRad(x) { return (x * Math.PI) / 180; }
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R*c;
  }

  useEffect(() => {
    const center = defaultCenter;
    const radius = defaultRadius;

    let aborted = false;

  async function fetchGooglePlacesAndSet() {
      try {
        setLoading(true);
        setError(null);
        await loadGoogleMaps(GOOGLE_KEY);
        if (aborted) return;
        const svc = new window.google.maps.places.PlacesService(document.createElement("div"));
        const request = {
          location: new window.google.maps.LatLng(center[0], center[1]),
          radius: radius,
          type: "veterinary",
        };
        svc.nearbySearch(request, (results, status) => {
          if (aborted) return;
          if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
            console.warn("Google Places status", status);
            // fallback to Overpass
            fetchOverpass();
            return;
          }
          const items = (results || []).map((r) => {
            const loc = r.geometry && r.geometry.location;
            const lat = loc && (typeof loc.lat === 'function' ? loc.lat() : loc.lat);
            const lon = loc && (typeof loc.lng === 'function' ? loc.lng() : loc.lng);
            return {
              id: `g-${r.place_id}`,
              lat,
              lon,
              name: r.name,
              address: r.vicinity || r.formatted_address || null,
              phone: null, // requires extra detail call; keep null for now
              raw: r,
            };
          }).filter(p => p.lat && p.lon);

          // sort by distance
          items.sort((a,b) => haversine(center[0], center[1], a.lat, a.lon) - haversine(center[0], center[1], b.lat, b.lon));
          setPlaces(items);
          setLoading(false);
        });
      } catch (err) {
        console.error('Google Places error', err);
        // fallback
        fetchOverpass();
      }
    }

    async function fetchOverpass() {
      setLoading(true);
      setError(null);
      const q = `[out:json][timeout:25];(node["amenity"="veterinary"](around:${radius},${center[0]},${center[1]});way["amenity"="veterinary"](around:${radius},${center[0]},${center[1]});relation["amenity"="veterinary"](around:${radius},${center[0]},${center[1]}););out center;`;
      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: q,
        });
        if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
        const data = await res.json();
        const items = (data.elements || []).map((el) => {
          const isNode = el.type === "node";
          const lat = isNode ? el.lat : (el.center && el.center.lat) || null;
          const lon = isNode ? el.lon : (el.center && el.center.lon) || null;
          const tags = el.tags || {};
          return {
            id: `${el.type}-${el.id}`,
            lat,
            lon,
            name: tags.name || tags["operator"] || "Veterinaria",
            address: [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
              .filter(Boolean)
              .join(" ") || null,
            phone: tags.phone || tags["contact:phone"] || null,
            raw: tags,
          };
        }).filter((p) => p.lat && p.lon);

        // sort by distance
        items.sort((a,b) => haversine(center[0], center[1], a.lat, a.lon) - haversine(center[0], center[1], b.lat, b.lon));
        setPlaces(items);
      } catch (err) {
        console.error("VetLayer error", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    // if key available, try Google Places first
    if (GOOGLE_KEY) {
      fetchGooglePlacesAndSet();
    } else {
      fetchOverpass();
    }

    return () => { aborted = true; };
  }, [defaultCenter, defaultRadius, map]);

  if (error) return null;

  // helper to get extra details (phone, rating, reviews) when user clicks a marker
  async function getDetails(place) {
    // Google Places detail call only available if loaded
    try {
      if (place.id && place.id.startsWith("g-") && window.google && window.google.maps && window.google.maps.places) {
        const svc = new window.google.maps.places.PlacesService(document.createElement("div"));
        return new Promise((resolve) => {
          svc.getDetails({ placeId: place.raw.place_id, fields: ['formatted_phone_number','rating','user_ratings_total','reviews','website','photos','formatted_address','name'] }, (res, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve({
                  ...place,
                  name: res.name || place.name,
                  address: res.formatted_address || place.address,
                  phone: res.formatted_phone_number || place.phone,
                  rating: res.rating || null,
                  reviews_count: res.user_ratings_total || null,
                  reviews: (res.reviews || []).slice(0, 3).map(r => ({ author: r.author_name, text: r.text, rating: r.rating })) || [],
                  website: res.website || null,
                  photos: res.photos || null,
                });
              } else {
                resolve({ ...place, rating: place.raw.rating || null, reviews: [], photos: place.raw.photos || null });
              }
            });
        });
      }
    } catch (err) {
      console.warn('getDetails google failed', err);
    }
    // fallback for Overpass or missing Google: use existing fields
    return { ...place, rating: place.raw && place.raw['rating'] ? Number(place.raw['rating']) : null, reviews: [] };
  }

  return (
    <>
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lon]}
          eventHandlers={{
            click: async () => {
              try {
                const full = await getDetails(p);
                if (onSelect) onSelect(full);
              } catch (err) {
                console.error('select details error', err);
                if (onSelect) onSelect(p);
              }
            }
          }}
        />
      ))}
    </>
  );
}
