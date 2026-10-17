"use client";

import { useMemo, useState } from "react";
import { GamePicker } from "@/components/GamePicker";
import { PlayerList } from "@/components/PlayerList";
import { ActiveGame } from "@/components/games/ActiveGame";
import { getGameMeta } from "@/shared/games/registry";
import type { GameId } from "@/shared/types";
import {
  createLocalMatch,
  localAction,
  localView,
  startLocalGame,
  type LocalMatch,
} from "@/lib/local-match";

const STORAGE = "previa:local:v1";

function loadMatch(): LocalMatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as LocalMatch) : null;
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
  const [names, setNames] = useState(["Luciano", "Meli", "Coco"]);
  const [draft, setDraft] = useState("");
  const [match, setMatch] = useState<LocalMatch | null>(() => loadMatch());
  const [unlocked, setUnlocked] = useState<string | null>(null);

  const currentPlayer = useMemo(() => {
    if (!match || match.revealQueue.length === 0) return null;
    const id = match.revealQueue[match.passIndex] ?? null;
    return match.players.find((p) => p.id === id) ?? null;
  }, [match]);

  function persist(next: LocalMatch) {
    setMatch(next);
    save(next);
  }

  function addName() {
    const clean = draft.trim();
    if (clean.length < 2) return;
    if (names.some((n) => n.toLowerCase() === clean.toLowerCase())) return;
    setNames([...names, clean]);
    setDraft("");
  }

  function begin(gameId: GameId) {
    const created = createLocalMatch(names);
    const started = startLocalGame(created, gameId);
    if (typeof started === "string") return;
    setUnlocked(null);
    persist(started);
  }

  if (!match) {
    return (
      <div className="stack">
        <h1>Pasate el celu</h1>
        <p className="lead">
          Un solo teléfono, todos los egos. Agregá a la peña y elegí juego. Esto corre acá, sin
          server, incluso si se corta la luz del módem.
        </p>
        <div className="card stack">
          {names.map((n) => (
            <div className="player" key={n}>
              <strong>{n}</strong>
              <button
                className="btn btn-ghost"
                style={{ width: "auto", padding: "6px 10px" }}
                type="button"
                onClick={() => setNames(names.filter((x) => x !== n))}
              >
                fuiste
              </button>
            </div>
          ))}
          <label>
            Sumá a alguien
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nombre, apodo, trauma" />
          </label>
          <button className="btn btn-ghost" type="button" onClick={addName}>
            Sumar
          </button>
        </div>
        <h2>Juegos</h2>
        <GamePicker onPick={begin} playerCount={names.length} />
      </div>
    );
  }

  const meta = match.gameId ? getGameMeta(match.gameId) : null;
  const viewer = currentPlayer ?? match.players[0]!;
  const view = localView(match, viewer.id);
  const needsGate = match.status === "playing" && match.revealQueue.length > 0 && unlocked !== viewer.id;

  return (
    <div className="stack">
      <p className="pill">{meta?.emoji} {meta?.name} · pass-and-play</p>

      {needsGate && currentPlayer ? (
        <div className="card gate">
          <h2>Pasale el celu a {currentPlayer.name}</h2>
          <p className="lead">Los demás miren para otro lado. Sí, vos también, Mabel.</p>
          <button className="btn btn-primary" type="button" onClick={() => setUnlocked(currentPlayer.id)}>
            Soy {currentPlayer.name}
          </button>
        </div>
      ) : (
        <div className="card stack">
          <ActiveGame
            gameId={match.gameId!}
            publicView={view.public}
            privateView={view.private}
            isHost
            youId={viewer.id}
            players={match.players}
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
      )}

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
