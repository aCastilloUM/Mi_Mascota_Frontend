
import React from "react";

export default function LogoTitle({ logoSrc, logoStyle, titleStyle, containerStyle }) {
  return (
    <div style={{ textAlign: "center", ...containerStyle }}>
      <img
        src={logoSrc}
        alt="Mi Mascota"
        style={{ ...logoStyle, marginBottom: "8px" }}
        draggable={false}
      />
      <h1 style={titleStyle}>MI MASCOTA</h1>
    </div>
  );
}