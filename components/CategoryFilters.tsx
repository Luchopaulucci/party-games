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
  const hasCategory = selected.length > 0;

  function toggle(id: Category) {
    const isOn = selected.includes(id);
    if (isOn && selected.length <= 1) return;
    onToggle(id);
  }

  return (
    <div className="stack category-filters">
      <div className="category-section">
        <div className="category-section-head">
          <p className="kicker">Clásicas</p>
          <small>Saberes de mesa. Tocá para prender o apagar.</small>
        </div>
        <div className="chips">
          {CLASSIC_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${selected.includes(c) ? "on" : ""}`}
              onClick={() => toggle(c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="category-section">
        <div className="category-section-head">
          <p className="kicker">Fiesta</p>
          <small>Más bizarro, más previa.</small>
        </div>
        <div className="chips">
          {FIESTA_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${selected.includes(c) ? "on" : ""}`}
              onClick={() => toggle(c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <p className="category-hint">Siempre tiene que haber al menos una categoría seleccionada.</p>

      <label className={`picante-toggle ${picante ? "on" : ""} ${hasCategory ? "" : "locked"}`}>
        <span>
          <strong>Modo picante</strong>
          <small>
            {hasCategory
              ? "Humor más sucio. Sin insultos a nadie ni nada con pibes."
              : "Elegí al menos una categoría para activarlo."}
          </small>
        </span>
        <input
          type="checkbox"
          checked={picante && hasCategory}
          disabled={!hasCategory}
          onChange={onPicante}
          style={{ width: 22, height: 22, accentColor: "var(--color-carbon)" }}
        />
      </label>
    </div>
  );
}
