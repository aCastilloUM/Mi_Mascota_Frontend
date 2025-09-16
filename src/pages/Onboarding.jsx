import React, { useMemo, useState, useEffect } from "react";

import bg2 from "../assets/backgrounds/background_blue_2.png";
import logoTop from "../assets/logos/dog+cat.png";
import family from "../assets/logos/men+dog+cat.png";
import LogoTitle from "../components/logoTitle.jsx";
import NextButton from "../components/NextButton.jsx";

// Íconos step 3
import chats from "../assets/icons/chats.png";
import id from "../assets/icons/id.png";
import padlockHeart from "../assets/icons/padlock+heart.png";
import shieldFootprint from "../assets/icons/shield+footprint.png";
import star from "../assets/icons/star.png";

const defaultIcons = [
  { src: shieldFootprint, label: "Seguridad" },
  { src: id,              label: "Historial" },
  { src: star,            label: "Reseñas" },
  { src: padlockHeart,    label: "Pagos" },
  { src: chats,           label: "Privacidad" },
];

/**
 * Onboarding de 3 pasos (solo primera vez).
 */
export default function Onboarding({
  logoTopSrc    = logoTop,
  heroFamilySrc = family,
  bgSrc = bg2,
  step3Icons = defaultIcons,
  onDone,
  force = false,
  nextLabel = "Continuar",
  primary = "#1876c9",
  accent = "#a0ceebff",
}) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!force) {
      const seen = localStorage.getItem("onboardingSeen");
      if (seen === "1") setVisible(false);
    }
  }, [force]);

  const finish = () => {
    localStorage.setItem("onboardingSeen", "1");
    setVisible(false);
    onDone?.();
  };

  if (!visible) return null;

  const bgByStep = useMemo(() => [bgSrc, bgSrc, bgSrc], [bgSrc]);

  return (
    <div style={{
  ...styles.fullscreen(primary, bgSrc),
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      zIndex: 9999, 
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        width: 360,
        maxWidth: "100vw",
        height: "100vh",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "auto",
        paddingTop: 8,
        paddingBottom: 8,
        gap: 0,
        boxSizing: "border-box",
      }}>
        <LogoTitle
          logoSrc={logoTopSrc}
          logoStyle={{ width: 250, height: "auto", display: "block", margin: "0 auto 0px" }}
          titleStyle={styles.title}
          containerStyle={{ marginTop: 56}}
        />

        <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
          {step === 0 && <StepOne />}
          {step === 1 && <StepTwo />}
          {step === 2 && <StepThree icons={step3Icons} />}
        </div>

        {(step === 0 || step === 1) && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <img src={heroFamilySrc} alt="Familia" style={{ width: 210, height: "auto" }} draggable={false} />
          </div>
        )}

        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <Dots total={3} active={step} />
          <NextButton
            label={step < 2 ? nextLabel : "Empezar"}
            accent={accent}
            onClick={() => (step < 2 ? setStep(step + 1) : finish())}
            style={{ maxWidth: 260, marginTop: 12 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Pasos ---------- */

function StepOne() {
  return (
    <div style={{ ...styles.stepBlock, textAlign: "center" }}>
      <p style={styles.lead}>La plataforma de confianza para el bienestar de tu mascota.</p>
    </div>
  );
}

function StepTwo() {
  return (
    <div style={{ ...styles.stepBlock, textAlign: "center" }}>
      <p style={{ ...styles.lead, marginBottom: 8 }}>
        Accedé a reseñas reales para elegir con confianza<br />
        Encontrá paseadores y cuidadores en minutos<br />
        Tu mascota en manos de expertos certificados
      </p>
    </div>
  );
}

function StepThree({ icons = [] }) {
  const items = icons.slice(0, 5);
  const labels = [
    "Seguridad y confianza",
    "Historial y experiencia validados",
    "Reseñas reales de otros dueños",
    "Pagos seguros y protegidos",
    "Protección de datos y privacidad garantizada",
  ];

  return (
    <div style={styles.stepBlock}>
      <div style={styles.listWithIcons}>
        {labels.map((text, i) => (
          <div key={i} style={styles.itemRow}>
            {items[i]?.src ? (
              <img
                src={items[i].src}
                alt={items[i].label}
                style={{ width: 50, height: "auto", objectFit: "contain", objectPosition: "center" }}
                draggable={false}
              />
            ) : (
              <div style={styles.iconPlaceholder} />
            )}
            <span style={styles.itemText}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function Dots({ total, active }) {
  return (
    <div style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            margin: 4,
            opacity: i === active ? 1 : 0.4,
            background: "#fff",
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Estilos ---------- */

const styles = {
  fullscreen: (primary, bgImage) => ({
    position: "fixed",
    inset: 0,
    background: primary,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "auto",
  }),

  container: {
    width: "100%",
    maxWidth: 430,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: {
    fontSize: "clamp(22px, 5vw, 30px)",
    lineHeight: 1.15,
    fontWeight: 800,
    textAlign: "center",
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: 0.5,
  },

  lead: {
    fontSize: "clamp(18px, 4.1vw, 20px)",
    lineHeight: 1.4,
    textAlign: "center",
    margin: "4px 0 10px",
    fontFamily: 'Segoe UI Rounded, Arial Rounded MT Bold, Arial, sans-serif',
    fontWeight: 500,
  },

  stepBlock: {
    width: "100%",
    textAlign: "center",
  },

  heroMask: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    overflow: "visible",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 6,
  },

  listWithIcons: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 8,
  },

  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  iconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(255,255,255,0.35)",
  },

  itemText: {
    fontSize: "clamp(18px, 4.1vw, 20px)",
    lineHeight: 1.35,
    flex: 1,
    fontFamily: 'Segoe UI Rounded, Arial Rounded MT Bold, Arial, sans-serif',
    fontWeight: 500,
    borderRadius: 12,
  },

  dots: {
    display: "flex",
    justifyContent: "center",
    marginTop: 6,
  },
};
