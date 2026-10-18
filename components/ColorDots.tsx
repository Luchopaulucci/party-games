"use client";

import { useEffect, useState } from "react";
import { PLAYER_COLORS } from "@/shared/ui/colors";

export function ColorDots({
  value,
  onChange,
  name,
  taken = [],
}: {
  value: string;
  onChange: (color: string) => void;
  name?: string;
  taken?: string[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="color-picker">
      <button
        type="button"
        className="color-picker-trigger"
        style={{ background: value }}
        aria-label={name ? `Color de ${name}` : "Elegir color"}
        aria-expanded={open}
        data-testid="color-picker-trigger"
        onClick={() => setOpen((v) => !v)}
      />
      {open ? (
        <>
          <button
            type="button"
            className="color-sheet-backdrop"
            aria-label="Cerrar colores"
            data-testid="color-picker-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="color-sheet" role="dialog" aria-label="Elegir color" data-testid="color-picker-sheet">
            <p className="kicker">{name ? `Color de ${name}` : "Elegir color"}</p>
            <div className="color-sheet-grid">
              {PLAYER_COLORS.map((c) => {
                const blocked = taken.includes(c) && c !== value;
                return (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${value === c ? "on" : ""} ${blocked ? "taken" : ""}`}
                    style={{ background: c }}
                    aria-label={name ? `Color de ${name}: ${c}` : `Color ${c}`}
                    aria-disabled={blocked}
                    disabled={blocked}
                    onClick={() => {
                      if (blocked) return;
                      onChange(c);
                      setOpen(false);
                    }}
                  />
                );
              })}
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>
              Listo
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
