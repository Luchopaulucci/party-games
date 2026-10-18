"use client";

import type { GameId, GameOptions } from "@/shared/types";
import { WHOAMI_PACKS } from "@/shared/games/whoami/characters";

const TIMERS = [0, 30, 45, 60, 90];
const ROUNDS = [1, 3, 5, 8];

export function RoomOptions({
  value,
  onChange,
  gameId,
  allowNight = false,
}: {
  value: GameOptions;
  onChange: (next: GameOptions) => void;
  gameId?: GameId | null;
  allowNight?: boolean;
}) {
  const showImpostors = !gameId || gameId === "impostor";
  const showSpies = !gameId || gameId === "espia";

  return (
    <div className="stack">
      <p className="kicker">Extras de la sala</p>
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
      {showImpostors ? (
        <label>
          Impostores (siempre menos que el resto)
          <select
            value={value.impostorCount ?? 0}
            onChange={(e) => onChange({ ...value, impostorCount: Number(e.target.value) })}
          >
            <option value={0}>Automático</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
      ) : null}
      {gameId === "whoami" ? (
        <div className="stack">
          <p className="kicker">Filtros de ¿Quién soy?</p>
          <div className="chips">
            {WHOAMI_PACKS.map((pack) => {
              const selected = (value.packs?.length ? value.packs : WHOAMI_PACKS.map((p) => p.id)).includes(pack.id);
              return (
                <button
                  key={pack.id}
                  type="button"
                  className={`chip ${selected ? "on" : ""}`}
                  onClick={() => {
                    const current = value.packs?.length ? [...value.packs] : WHOAMI_PACKS.map((p) => p.id);
                    const next = current.includes(pack.id)
                      ? current.filter((id) => id !== pack.id)
                      : [...current, pack.id];
                    onChange({ ...value, packs: next.length ? next : [pack.id] });
                  }}
                >
                  {pack.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {showSpies ? (
        <label>
          Espías
          <select
            value={value.spyCount ?? 0}
            onChange={(e) => onChange({ ...value, spyCount: Number(e.target.value) })}
          >
            <option value={0}>Automático</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
      ) : null}
      {allowNight ? (
        <label className="player" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            <strong>Noche de juegos</strong>
            <small>Encadena varios juegos y acumula puntos. El podio sale al final.</small>
          </span>
          <input
            type="checkbox"
            checked={Boolean(value.night)}
            onChange={(e) => onChange({ ...value, night: e.target.checked })}
            style={{ width: 22, height: 22, accentColor: "var(--color-carbon)" }}
          />
        </label>
      ) : null}
    </div>
  );
}

export function gameUsesCategories(gameId: GameId | null | undefined): boolean {
  return gameId === "closest";
}
