"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryFilters } from "@/components/CategoryFilters";
import { RoomOptions } from "@/components/RoomOptions";
import { ColorDots } from "@/components/ColorDots";
import { GamePicker } from "@/components/GamePicker";
import { HandoffScreen } from "@/components/HandoffScreen";
import { PlayerList } from "@/components/PlayerList";
import { ActiveGame } from "@/components/games/ActiveGame";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { getGameMeta } from "@/shared/games/registry";
import type { GameId, GameOptions } from "@/shared/types";
import { PLAYER_COLORS, nextPlayerColor } from "@/shared/ui/colors";
import {
  createLocalMatch,
  hydrateMatch,
  localAction,
  localView,
  newLocalId,
  startLocalGame,
  type LocalMatch,
} from "@/lib/local-match";

const STORAGE = "previa:local:v1";

type DraftPlayer = { id: string; name: string; color: string };

const DEFAULT_PLAYERS: DraftPlayer[] = [
  { id: "d1", name: "Luciano", color: PLAYER_COLORS[0] },
  { id: "d2", name: "Meli", color: PLAYER_COLORS[1] },
  { id: "d3", name: "Coco", color: PLAYER_COLORS[2] },
  { id: "d4", name: "Wanda", color: PLAYER_COLORS[3] },
];

function loadMatch(): LocalMatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? hydrateMatch(JSON.parse(raw) as LocalMatch) : null;
  } catch {
    return null;
  }
}

function save(match: LocalMatch | null) {
  if (!match) {
    localStorage.removeItem(STORAGE);
    return;
  }
  localStorage.setItem(STORAGE, JSON.stringify(match));
}

export function LocalMatchApp() {
  const [players, setPlayers] = useState<DraftPlayer[]>(DEFAULT_PLAYERS);
  const [draft, setDraft] = useState("");
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [picante, setPicante] = useState(false);
  const [options, setOptions] = useState<GameOptions>({ timerSec: 0, rounds: 1, mode: "no-pasarse" });
  const [match, setMatch] = useState<LocalMatch | null>(null);
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMatch(loadMatch());
    setHydrated(true);
  }, []);

  const currentPlayer = useMemo(() => {
    if (!match || match.revealQueue.length === 0) return null;
    const id = match.revealQueue[match.passIndex] ?? null;
    return match.players.find((p) => p.id === id) ?? null;
  }, [match]);

  function persist(next: LocalMatch) {
    setMatch(next);
    save(next);
  }

  function addPlayer() {
    const clean = draft.trim();
    if (clean.length < 2) return;
    if (players.some((p) => p.name.toLowerCase() === clean.toLowerCase())) return;
    setPlayers([
      ...players,
      { id: newLocalId(), name: clean, color: nextPlayerColor(players.map((p) => p.color)) },
    ]);
    setDraft("");
  }

  function begin(gameId: GameId) {
    const created = createLocalMatch(players.filter((p) => p.name.trim().length >= 2));
    const started = startLocalGame(created, gameId, { categories, picante, options });
    if (typeof started === "string") return;
    setUnlocked(null);
    persist(started);
  }

  if (!hydrated) {
    return <p className="lead">Acomodando la mesa…</p>;
  }

  if (!match) {
    return (
      <div className="stack">
        <p className="kicker">Un celu. Toda la mesa.</p>
        <h1>Pasate el celu</h1>
        <p className="lead">
          Adiviná pavadas, votá sin filtro y pasá el teléfono. Nadie mira el número del otro. Si se
          corta el WiFi de la quinta, seguimos igual.
        </p>
        <div className="card stack">
          <p className="kicker">Jugadores ({players.length})</p>
          {players.map((p) => (
            <div className="player" key={p.id} style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <span className="swatch" style={{ background: p.color, marginTop: 8 }} />
              <div className="meta" style={{ flex: 1, gap: 8 }}>
                <input
                  value={p.name}
                  onChange={(e) =>
                    setPlayers(players.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))
                  }
                  aria-label={`Nombre de ${p.name}`}
                  style={{ minHeight: 40, background: "transparent", padding: "4px 0" }}
                />
                <ColorDots
                  value={p.color}
                  name={p.name}
                  onChange={(color) => setPlayers(players.map((x) => (x.id === p.id ? { ...x, color } : x)))}
                />
              </div>
              <button
                className="btn btn-ghost"
                style={{ width: "auto", padding: "6px 10px", minHeight: 40 }}
                type="button"
                onClick={() => setPlayers(players.filter((x) => x.id !== p.id))}
              >
                fuiste
              </button>
            </div>
          ))}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              addPlayer();
            }}
          >
            <label style={{ flex: 1 }}>
              Sumá a alguien
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nombre, apodo, trauma" />
            </label>
            <button className="btn btn-gold" type="submit" style={{ alignSelf: "end", width: "auto" }}>
              Agregar
            </button>
          </form>
        </div>
        <div className="card stack">
          <CategoryFilters
            selected={categories}
            picante={picante}
            onToggle={(id: Category) =>
              setCategories((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]))
            }
            onPicante={() => setPicante((v) => !v)}
          />
          <RoomOptions value={options} onChange={setOptions} />
        </div>
        <h2>Juegos</h2>
        <GamePicker onPick={begin} playerCount={players.length} />
      </div>
    );
  }

  const meta = match.gameId ? getGameMeta(match.gameId) : null;
  const viewer = currentPlayer ?? match.players[0]!;
  const view = localView(match, viewer.id);
  const needsGate = match.status === "playing" && match.revealQueue.length > 0 && unlocked !== viewer.id;

  if (needsGate && currentPlayer) {
    return (
      <HandoffScreen
        name={currentPlayer.name}
        color={currentPlayer.color}
        onReady={() => setUnlocked(currentPlayer.id)}
      />
    );
  }

  return (
    <div className="stack">
      <p className="pill">
        {meta?.emoji} {meta?.name} · pass-and-play
      </p>

      <div className="card stack">
          <ActiveGame
            gameId={match.gameId!}
            publicView={view.public}
            privateView={view.private}
            isHost
            youId={viewer.id}
            players={match.players}
            timerSec={match.options.timerSec}
            onAction={(type, payload) => {
            const applied = localAction(match, viewer.id, { type, payload });
            const shouldPass = match.gameId === "closest" && type === "guess";
            const nextIndex = match.passIndex + 1;
            if (shouldPass && nextIndex < match.revealQueue.length && applied.status === "playing") {
              setUnlocked(null);
              persist({ ...applied, passIndex: nextIndex });
              return;
            }
            persist(applied);
          }}
        />
        {match.status === "playing" && match.revealQueue.length > 1 ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              const next = (match.passIndex + 1) % match.revealQueue.length;
              setUnlocked(null);
              persist({ ...match, passIndex: next });
            }}
          >
            Pasar celu
          </button>
        ) : null}
      </div>

      <div className="card stack">
        <h3>Tabla</h3>
        <PlayerList players={match.players} youId={viewer.id} />
      </div>

      {match.status === "finished" ? (
        <div className="row">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              if (!match.gameId) return;
              const next = startLocalGame({ ...match, passIndex: 0 }, match.gameId);
              if (typeof next === "string") return;
              setUnlocked(null);
              persist(next);
            }}
          >
            Otra ronda
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              save(null);
              setMatch(null);
              setUnlocked(null);
            }}
          >
            Nueva previa
          </button>
        </div>
      ) : (
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            save(null);
            setMatch(null);
            setUnlocked(null);
          }}
        >
          Cortar y volver
        </button>
      )}
    </div>
  );
}
