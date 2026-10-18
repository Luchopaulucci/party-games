"use client";

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
  return (
    <div className="color-dots">
      {PLAYER_COLORS.map((c) => {
        const blocked = taken.includes(c) && c !== value;
        return (
          <button
            key={c}
            type="button"
            className={`color-dot ${value === c ? "on" : ""} ${blocked ? "taken" : ""}`}
            style={{ background: c }}
            aria-label={name ? `Color de ${name}: ${c}` : `Color ${c}`}
            aria-disabled={blocked}
            disabled={blocked}
            onClick={() => {
              if (blocked) return;
              onChange(c);
            }}
          />
        );
      })}
    </div>
  );
}
