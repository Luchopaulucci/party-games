"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryFilters } from "@/components/CategoryFilters";
import { ColorDots } from "@/components/ColorDots";
import { FxToggle } from "@/components/FxToggle";
import { GamePicker } from "@/components/GamePicker";
import { HandoffScreen } from "@/components/HandoffScreen";
import { HowToPlay } from "@/components/HowToPlay";
import { PlayerList } from "@/components/PlayerList";
import { PodiumScreen } from "@/components/PodiumScreen";
import { RoomOptions, gameUsesCategories } from "@/components/RoomOptions";
import { ActiveGame } from "@/components/games/ActiveGame";
import { nextLocalRound } from "@/lib/local-match";
import { playFx } from "@/lib/fx";
import { deviceCopy, useDeviceKind } from "@/lib/device";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { getGameMeta } from "@/shared/games/registry";
import type { GameId, GameOptions } from "@/shared/types";
import { MAX_LOCAL_PLAYERS, PLAYER_COLORS, nextPlayerColor } from "@/shared/ui/colors";
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
const MIN_PLAYERS = 2;

type DraftPlayer = { id: string; name: string; color: string };
type Step = "pick" | "lobby";

const DEFAULT_PLAYERS: DraftPlayer[] = [
  { id: "d1", name: "Luciano", color: PLAYER_COLORS[0]! },
  { id: "d2", name: "Meli", color: PLAYER_COLORS[1]! },
  { id: "d3", name: "Coco", color: PLAYER_COLORS[2]! },
  { id: "d4", name: "Wanda", color: PLAYER_COLORS[3]! },
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
  const copy = deviceCopy(useDeviceKind());
  const [step, setStep] = useState<Step>("pick");
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [players, setPlayers] = useState<DraftPlayer[]>(DEFAULT_PLAYERS);
  const [draft, setDraft] = useState("");
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [picante, setPicante] = useState(false);
  const [options, setOptions] = useState<GameOptions>({ timerSec: 0, rounds: 1 });
  const [match, setMatch] = useState<LocalMatch | null>(null);
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMatch(loadMatch());
    setHydrated(true);
  }, []);

  const meta = selectedGame ? getGameMeta(selectedGame) : null;
  const readyPlayers = players.filter((p) => p.name.trim().length >= 2);
  const minNeeded = Math.max(MIN_PLAYERS, meta?.minPlayers ?? MIN_PLAYERS);
  const canStart =
    Boolean(selectedGame) &&
    readyPlayers.length >= minNeeded &&
    readyPlayers.length <= MAX_LOCAL_PLAYERS &&
    (!gameUsesCategories(selectedGame) || categories.length > 0);

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
    if (players.length >= MAX_LOCAL_PLAYERS) return;
    if (players.some((p) => p.name.toLowerCase() === clean.toLowerCase())) return;
    setPlayers([
      ...players,
      { id: newLocalId(), name: clean, color: nextPlayerColor(players.map((p) => p.color)) },
    ]);
    setDraft("");
  }

  function setPlayerColor(id: string, color: string) {
    const taken = players.filter((p) => p.id !== id).map((p) => p.color);
    if (taken.includes(color)) return;
    setPlayers(players.map((p) => (p.id === id ? { ...p, color } : p)));
  }

  function begin() {
    if (!selectedGame || !canStart) return;
    const created = createLocalMatch(readyPlayers);
    const started = startLocalGame(created, selectedGame, {
      categories: gameUsesCategories(selectedGame) ? categories : [],
      picante: gameUsesCategories(selectedGame) ? picante : false,
      options,
    });
    if (typeof started === "string") return;
    setUnlocked(null);
    persist(started);
  }

  function resetToPick() {
    save(null);
    setMatch(null);
    setUnlocked(null);
    setSelectedGame(null);
    setStep("pick");
  }

  if (!hydrated) {
    return <p className="lead">Acomodando la mesa…</p>;
  }

  if (!match) {
    if (step === "pick" || !selectedGame || !meta) {
      return (
        <div className="stack">
          <p className="kicker">{copy.kicker}</p>
          <h1>Compartiendo el dispositivo</h1>
          <p className="lead">Elegí el juego. Después armás el lobby.</p>
          <h2>Juegos</h2>
          <GamePicker
            implementedOnly
            onPick={(id) => {
              setSelectedGame(id);
              setStep("lobby");
            }}
          />
        </div>
      );
    }

    return (
      <div className="stack">
        <button className="btn btn-ghost" type="button" onClick={() => setStep("pick")}>
          ← Cambiar juego
        </button>
        <p className="pill">
          {meta.emoji} {meta.name}
        </p>
        <h1>Lobby</h1>
        <p className="lead">
          Mínimo {minNeeded} jugadores, máximo {MAX_LOCAL_PLAYERS}. El color se asigna solo.
        </p>

        <div className="card stack">
          <p className="kicker">
            Jugadores ({players.length}/{MAX_LOCAL_PLAYERS})
          </p>
          {players.map((p) => {
            const taken = players.filter((x) => x.id !== p.id).map((x) => x.color);
            return (
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
                    taken={taken}
                    onChange={(color) => setPlayerColor(p.id, color)}
                  />
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ width: "auto", padding: "6px 10px", minHeight: 40 }}
                  type="button"
                  disabled={players.length <= MIN_PLAYERS}
                  onClick={() => setPlayers(players.filter((x) => x.id !== p.id))}
                >
                  fuiste
                </button>
              </div>
            );
          })}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              addPlayer();
            }}
          >
            <label style={{ flex: 1 }}>
              Sumá a alguien
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Nombre, apodo, trauma"
                disabled={players.length >= MAX_LOCAL_PLAYERS}
              />
            </label>
            <button
              className="btn btn-gold"
              type="submit"
              style={{ alignSelf: "end", width: "auto" }}
              disabled={players.length >= MAX_LOCAL_PLAYERS}
            >
              Agregar
            </button>
          </form>
          {readyPlayers.length < minNeeded ? (
            <p className="category-hint">Faltan jugadores para arrancar ({readyPlayers.length}/{minNeeded}).</p>
          ) : null}
        </div>

        {gameUsesCategories(selectedGame) ? (
          <div className="card stack">
            <CategoryFilters
              selected={categories}
              picante={picante}
              onToggle={(id: Category) =>
                setCategories((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]))
              }
              onPicante={() => setPicante((v) => !v)}
            />
          </div>
        ) : null}

        <div className="card stack">
          <RoomOptions value={options} onChange={setOptions} gameId={selectedGame} />
          <FxToggle />
        </div>

        <button className="btn btn-primary" type="button" disabled={!canStart} onClick={begin}>
          Empezar {meta.name}
        </button>
      </div>
    );
  }

  const playingMeta = match.gameId ? getGameMeta(match.gameId) : null;
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
        {playingMeta?.emoji} {playingMeta?.name} · pass-and-play
      </p>

      <div className="card stack">
        {playingMeta?.howTo ? <HowToPlay text={playingMeta.howTo} /> : null}
        {match.status === "finished" ? (
          <PodiumScreen
            players={match.players}
            youId={viewer.id}
            nightLabel={match.options.night ? "Noche de juegos" : null}
          />
        ) : null}
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
            if (applied.status === "finished" && match.status !== "finished") playFx("reveal");
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
              const next = nextLocalRound({ ...match, passIndex: 0 });
              if (typeof next === "string") return;
              setUnlocked(null);
              persist(next);
            }}
          >
            {match.options.night ? "Siguiente de la noche" : "Otra ronda"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={resetToPick}>
            Nueva previa
          </button>
        </div>
      ) : (
        <button className="btn btn-ghost" type="button" onClick={resetToPick}>
          Cortar y volver
        </button>
      )}
    </div>
  );
}
