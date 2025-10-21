import { useEffect, useRef, useState } from "react";
import "../styles/map-search.css";

const HISTORY_KEY = "mi_mascota_map_search_history";

export default function MapSearch({ onSearch }) {
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // history disabled per user request
  const wrapperRef = useRef(null);
  const freezeTimerRef = useRef(null);

  const suggestions = useRef([
    "Paseadores",
    "Veterinarias cerca",
    "Guardería para perros",
    "Peluquería para mascotas",
    "Entrenadores de Pitbull",
    "Busque cerca de tí",
  ]);

  // typing state refs
  const idxRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef("typing"); // 'typing' | 'pausing' | 'deleting'
  const timerRef = useRef(null);

  // clear any previously stored history to respect user preference
  useEffect(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // main loop for typing + deleting
    function clear() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function loop() {
      clear();
      if (isFocused || value) return; // pause animation while interacting

      const current = suggestions.current[idxRef.current] || "";
      const typingSpeed = 70;
      const deletingSpeed = 40;
      const pauseAfterTyping = 900;
      const pauseAfterDeleting = 300;

      if (phaseRef.current === "typing") {
        if (charRef.current < current.length) {
          charRef.current += 1;
          setPlaceholder(current.slice(0, charRef.current));
          timerRef.current = setTimeout(loop, typingSpeed);
        } else {
          phaseRef.current = "pausing";
          timerRef.current = setTimeout(() => {
            phaseRef.current = "deleting";
            timerRef.current = setTimeout(loop, deletingSpeed);
          }, pauseAfterTyping);
        }
      } else if (phaseRef.current === "deleting") {
        if (charRef.current > 0) {
          charRef.current -= 1;
          setPlaceholder(current.slice(0, charRef.current));
          timerRef.current = setTimeout(loop, deletingSpeed);
        } else {
          // move to next suggestion
          idxRef.current = (idxRef.current + 1) % suggestions.current.length;
          phaseRef.current = "typing";
          timerRef.current = setTimeout(loop, pauseAfterDeleting);
        }
      }
    }

    loop();
    return clear;
  }, [isFocused, value]);

  function saveHistory(q) {
    // history persistence intentionally disabled
  }

  function handleSubmit(e) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    // history saving disabled by user request
    if (onSearch && typeof onSearch === "function") onSearch(q);
  }

  // keep a global hint on the document so CSS can react in browsers
  // (some mobile Safari variants don't reliably match :focus-within on html/body)
  function handleFocus() {
    setIsFocused(true);
    // history UI disabled; keep placeholder animation behavior only
    try {
      document.documentElement.classList.add("has-input-focus");
    } catch (e) {
      // ignore in non-browser environments
    }
    // freeze wrapper width to prevent viewport/keyboard reflow from resizing it
    try {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        wrapperRef.current.style.width = `${Math.round(rect.width)}px`;
      }
    } catch (e) {}
  }

  function handleBlur() {
    setIsFocused(false);
    // delay hiding to allow click on history items
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
    freezeTimerRef.current = setTimeout(() => {
      // history UI disabled
      try {
        document.documentElement.classList.remove("has-input-focus");
      } catch (e) {}
      try {
        if (wrapperRef.current) wrapperRef.current.style.width = "";
      } catch (e) {}
      freezeTimerRef.current = null;
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
    };
  }, []);

  function handleSelectHistory(item) {
    // history UI disabled; this should not be reachable but keep implementation simple
    setValue(item);
    if (onSearch && typeof onSearch === "function") onSearch(item);
  }

  return (
  <form className="map-search" ref={wrapperRef} onSubmit={handleSubmit} role="search" autoComplete="off">
      <div className="map-search__field">
        <input
          className="map-search__input"
          type="text"
          placeholder={placeholder}
          aria-label="Buscar en el mapa"
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="map-search__btn" type="submit" aria-label="Buscar">
          <svg className="map-search__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* history UI disabled per user request */}
    </form>
  );
}
