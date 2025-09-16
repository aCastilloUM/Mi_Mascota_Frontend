import React from "react";

export default function NextButton({ label, onClick, accent, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        maxWidth: 420,
        marginTop: 8,
        background: accent,
        color: "#08263a",
        border: "none",
        borderRadius: 999,
        padding: "12px 18px",
        fontSize: 18,
        fontWeight: 700,
        cursor: "pointer",
        ...style,
      }}
    >
      {label}
    </button>
  );
}
