"use client";

import {
  CATEGORY_LABELS,
  CLASSIC_CATEGORIES,
  FIESTA_CATEGORIES,
  type Category,
} from "@/shared/games/closest/premise-types";

export function CategoryFilters({
  selected,
  picante,
  onToggle,
  onPicante,
}: {
  selected: string[];
  picante: boolean;
  onToggle: (id: Category) => void;
  onPicante: () => void;
}) {
  return (
    <div className="stack">
      <p className="kicker">Categorías clásicas</p>
      <div className="chips">
        {CLASSIC_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${selected.includes(c) ? "on" : ""}`}
            onClick={() => onToggle(c)}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <p className="kicker">Fiesta</p>
      <div className="chips">
        {FIESTA_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${selected.includes(c) ? "on" : ""}`}
            onClick={() => onToggle(c)}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <label className="player" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>
          <strong>Modo picante</strong>
          <small>Humor más sucio. Sin insultos a nadie ni nada con pibes.</small>
        </span>
        <input type="checkbox" checked={picante} onChange={onPicante} style={{ width: 22, height: 22, accentColor: "#ff8fab" }} />
      </label>
    </div>
  );
}
