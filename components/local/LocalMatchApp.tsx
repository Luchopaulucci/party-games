"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryFilters } from "@/components/CategoryFilters";
import { ColorDots } from "@/components/ColorDots";
import { FxToggle } from "@/components/FxToggle";
import { HowToPlay } from "@/components/HowToPlay";
import { PlayerList } from "@/components/PlayerList";
import { PodiumScreen } from "@/components/PodiumScreen";
import { RoomOptions, gameUsesCategories } from "@/components/RoomOptions";
import { ActiveGame } from "@/components/games/ActiveGame";
import { PassPhone } from "@/components/play/PassPhone";
import { playFx } from "@/lib/fx";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { getGameMeta } from "@/shared/games/registry";
import type { GameId, GameOptions } from "@/shared/types";
import { MAX_LOCAL_PLAYERS, nextPlayerColor } from "@/shared/ui/colors";
import {
  advancePass,
  createLocalMatch,
  hydrateMatch,
  localAction,
  localStorageKey,
  localView,
  newLocalId,
  nextLocalRound,
  resetLocalToLobby,
  startLocalGame,
  type LocalMatch,
} from "@/lib/local-match";
import { loadRoster, saveRoster, type RosterPlayer } from "@/lib/local-roster";

const MIN_PLAYERS = 2;

type DraftPlayer = RosterPlayer;

function loadMatch(gameId: GameId): LocalMatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(localStorageKey(gameId));
    if (!raw) return null;
    const match = hydrateMatch(JSON.parse(raw) as LocalMatch);
    if (match.gameId && match.gameId !== gameId) return null;
    return match;
  } catch {
    return null;
  }
}

function save(gameId: GameId, match: LocalMatch | null) {
  if (!match) {
    localStorage.removeItem(localStorageKey(gameId));
    return;
  }
  localStorage.setItem(localStorageKey(gameId), JSON.stringify(match));
}

export function LocalMatchApp({ gameId }: { gameId: GameId }) {
  const meta = getGameMeta(gameId);
  const [players, setPlayers] = useState<DraftPlayer[]>([]);
  const [draft, setDraft] = useState("");
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [picante, setPicante] = useState(false);
  const [options, setOptions] = useState<GameOptions>({ timerSec: 0, rounds: 1 });
  const [match, setMatch] = useState<LocalMatch | null>(null);
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMatch(loadMatch(gameId));
    setPlayers(loadRoster(window.localStorage));
    setHydrated(true);
  }, [gameId]);

  useEffect(() => {
    if (!hydrated) return;
    saveRoster(players, window.localStorage);
  }, [hydrated, players]);

  useEffect(() => {
    const onExit = () => {
      save(gameId, null);
      setMatch(null);
      setUnlocked(null);
    };
    window.addEventListener("previa:local-exit", onExit);
    return () => window.removeEventListener("previa:local-exit", onExit);
  }, [gameId]);

  const readyPlayers = players.filter((p) => p.name.trim().length >= 2);
  const minNeeded = Math.max(MIN_PLAYERS, meta?.minPlayers ?? MIN_PLAYERS);
  const canStart =
    Boolean(meta) &&
    readyPlayers.length >= minNeeded &&
    readyPlayers.length <= MAX_LOCAL_PLAYERS &&
    (!gameUsesCategories(gameId) || categories.length > 0);

  const currentPlayer = useMemo(() => {
    if (!match || match.revealQueue.length === 0) return null;
    const id = match.revealQueue[match.passIndex] ?? null;
    return match.players.find((p) => p.id === id) ?? null;
  }, [match]);

  function persist(next: LocalMatch) {
    setMatch(next);
    save(gameId, next);
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
    if (!canStart) return;
    const created = createLocalMatch(readyPlayers);
    const started = startLocalGame(created, gameId, {
      categories: gameUsesCategories(gameId) ? categories : [],
      picante: gameUsesCategories(gameId) ? picante : false,
      options,
    });
    if (typeof started === "string") return;
    setUnlocked(null);
    persist(started);
  }

  function exitToLobby() {
    const next = resetLocalToLobby(readyPlayers);
    save(gameId, null);
    setMatch(null);
    setUnlocked(null);
    return next;
  }

  if (!hydrated || !meta) {
    return <p className="lead">Acomodando la mesa…</p>;
  }

  if (!match) {
    return (
      <div className="stack">
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
            <p className="category-hint">
              Faltan jugadores para arrancar ({readyPlayers.length}/{minNeeded}).
            </p>
          ) : null}
        </div>

        {gameUsesCategories(gameId) ? (
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
          <RoomOptions value={options} onChange={setOptions} gameId={gameId} />
          <FxToggle />
        </div>

        <button className="btn btn-primary" type="button" disabled={!canStart} onClick={begin}>
          Empezar {meta.name}
        </button>
      </div>
    );
  }

  const playingMeta = match.gameId ? getGameMeta(match.gameId) : meta;
  const viewer = currentPlayer ?? match.players[0]!;
  const view = localView(match, viewer.id);
  const needsGate = match.status === "playing" && match.revealQueue.length > 0 && unlocked !== viewer.id;

  if (needsGate && currentPlayer) {
    return <PassPhone name={currentPlayer.name} color={currentPlayer.color} onReady={() => setUnlocked(currentPlayer.id)} />;
  }

  return (
    <div className="stack">
      <p className="pill">
        {playingMeta?.emoji} {playingMeta?.name} · pass-and-play
      </p>

      <div className="card stack">
        {playingMeta?.howTo ? <HowToPlay text={playingMeta.howTo} /> : null}
        {match.status === "finished" ? (
          <>
            <PodiumScreen
              players={match.players}
              youId={viewer.id}
              nightLabel={match.options.night ? "Noche de juegos" : null}
            />
            <div className="card stack">
              <h3>Tabla</h3>
              <PlayerList players={match.players} youId={viewer.id} showScores />
            </div>
          </>
        ) : null}
        {match.status !== "finished" ? (
          <ActiveGame
            gameId={match.gameId!}
            publicView={view.public}
            privateView={view.private}
            isHost
            youId={viewer.id}
            players={match.players}
            timerSec={match.options.timerSec}
            local
            onAction={(type, payload) => {
              const applied = localAction(match, viewer.id, { type, payload });
              if (applied.status === "finished" && match.status !== "finished") playFx("reveal");
              const next = advancePass(match, applied, type);
              if (next.passIndex !== match.passIndex) setUnlocked(null);
              persist(next);
            }}
          />
        ) : null}
        {match.status === "playing" && match.revealQueue.length > 1 && match.gameId !== "mentira" ? (
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
          <button className="btn btn-ghost" type="button" onClick={exitToLobby}>
            Al lobby
          </button>
        </div>
      ) : null}
    </div>
  );
}
