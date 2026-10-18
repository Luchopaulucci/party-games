"use client";

import { contrastText } from "@/shared/ui/colors";

export function HandoffScreen({
  name,
  color,
  onReady,
}: {
  name: string;
  color: string;
  onReady: () => void;
}) {
  const ink = contrastText(color);
  return (
    <div className="handoff-screen" data-testid="handoff-screen" style={{ background: color, color: ink }}>
      <p className="kicker" style={{ color: ink, opacity: 0.8 }}>
        Sin mirar
      </p>
      <div className="stack" style={{ justifyItems: "center", textAlign: "center" }}>
        <p className="lead" style={{ color: ink, margin: 0, opacity: 0.85 }}>
          Pasá el celu a
        </p>
        <h1 style={{ color: ink, fontSize: "3.6rem" }}>{name}</h1>
        <p className="lead" style={{ color: ink, margin: 0, opacity: 0.8 }}>
          Cuando lo tengas en la mano, tocá. Nadie más mira.
        </p>
      </div>
      <button
        className="btn"
        type="button"
        data-testid="handoff-continue"
        onClick={onReady}
        style={{ background: "#fff", color: "#1e1446", maxWidth: 360 }}
      >
        Soy {name}
      </button>
    </div>
  );
}
