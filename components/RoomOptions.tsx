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
      <label>
        Modo Subasta
        <select
          value={value.mode ?? "no-pasarse"}
          onChange={(e) => onChange({ ...value, mode: e.target.value })}
        >
          <option value="no-pasarse">The Price is Right: sin pasarse</option>
          <option value="cerca">El más cercano (aunque se pase)</option>
        </select>
      </label>
    </div>
  );
}
