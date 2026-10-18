"use client";

import { PLAYER_COLORS } from "@/shared/ui/colors";

export function ColorDots({
  value,
  onChange,
  name,
}: {
  value: string;
  onChange: (color: string) => void;
  name?: string;
}) {
  return (
    <div className="color-dots">
      {PLAYER_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={`color-dot ${value === c ? "on" : ""}`}
          style={{ background: c }}
          aria-label={name ? `Color de ${name}: ${c}` : `Color ${c}`}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
