"use client";

import type { GameOptions } from "@/shared/types";

const TIMERS = [0, 30, 45, 60, 90];
const ROUNDS = [1, 3, 5, 8];

export function RoomOptions({
  value,
  onChange,
}: {
  value: GameOptions;
  onChange: (next: GameOptions) => void;
}) {
  return (
    <div className="stack">
      <p className="kicker">Extras de sala</p>
      <p className="lead" style={{ margin: 0 }}>
        Luciano después saca lo que no le cierre. Por default, sin timer y una ronda.
      </p>
      <label>
        Timer de ronda
        <select
          value={value.timerSec ?? 0}
          onChange={(e) => onChange({ ...value, timerSec: Number(e.target.value) })}
        >
          {TIMERS.map((n) => (
            <option key={n} value={n}>
              {n === 0 ? "Sin timer (el host cierra)" : `${n} segundos`}
            </option>
          ))}
        </select>
      </label>
      <label>
        Rondas sugeridas
        <select
          value={value.rounds ?? 1}
          onChange={(e) => onChange({ ...value, rounds: Number(e.target.value) })}
        >
          {ROUNDS.map((n) => (
            <option key={n} value={n}>
              {n === 1 ? "Una (el host pide otra)" : `${n} rondas`}
            </option>
          ))}
        </select>
      </label>
      <label>
        Impostores (si aplica)
        <select
          value={value.impostorCount ?? 0}
          onChange={(e) => onChange({ ...value, impostorCount: Number(e.target.value) })}
        >
          <option value={0}>Automático</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </label>
      <label>
        Espías (si aplica)
        <select
          value={value.spyCount ?? 0}
          onChange={(e) => onChange({ ...value, spyCount: Number(e.target.value) })}
        >
          <option value={0}>Automático</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </label>
      <label className="player" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>
          <strong>Noche de juegos</strong>
          <small>Encadena varios juegos y acumula puntos. El podio sale al final.</small>
        </span>
        <input
          type="checkbox"
          checked={Boolean(value.night)}
          onChange={(e) => onChange({ ...value, night: e.target.checked })}
          style={{ width: 22, height: 22, accentColor: "#ff8fab" }}
        />
      </label>
    </div>
  );
}
