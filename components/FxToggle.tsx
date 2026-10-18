"use client";

import { useEffect, useState } from "react";
import { fxEnabled, setFxEnabled } from "@/lib/fx";

export function FxToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(fxEnabled());
  }, []);
  return (
    <label className="player" style={{ display: "flex", justifyContent: "space-between" }}>
      <span>
        <strong>Sonido y vibración</strong>
        <small>Opcional. Se queda en este celu.</small>
      </span>
      <input
        type="checkbox"
        checked={on}
        onChange={() => {
          const next = !on;
          setOn(next);
          setFxEnabled(next);
        }}
        style={{ width: 22, height: 22, accentColor: "var(--color-kippo-pink)" }}
      />
    </label>
  );
}
