"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CategoryFilters } from "@/components/CategoryFilters";
import { FxToggle } from "@/components/FxToggle";
import { GamePicker } from "@/components/GamePicker";
import { HowToPlay } from "@/components/HowToPlay";
import { PlayerList } from "@/components/PlayerList";
import { PodiumScreen } from "@/components/PodiumScreen";
import { QrCard } from "@/components/QrCard";
import { ReactionsBar } from "@/components/ReactionsBar";
import { RoomOptions, gameUsesCategories } from "@/components/RoomOptions";
import { ActiveGame } from "@/components/games/ActiveGame";
import { playFx } from "@/lib/fx";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { getGameMeta } from "@/shared/games/registry";
import type { ClientRoomState, GameId, GameOptions } from "@/shared/types";
import { socketUrl, writeSession } from "@/lib/session";

export function RoomClient({
  code,
  name,
  token,
  preferredGame = null,
}: {
  code?: string;
  name: string;
  token?: string;
  preferredGame?: GameId | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ClientRoomState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(preferredGame);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [picante, setPicante] = useState(false);
  const [options, setOptions] = useState<GameOptions>({ timerSec: 0, rounds: 1 });

  useEffect(() => {
    setSelectedGame(preferredGame);
  }, [preferredGame]);

  useEffect(() => {
    const s = io(socketUrl(), { transports: ["websocket", "polling"] });
    setSocket(s);

    const hello = {
      intent: code ? "join" : "create",
      name,
      code,
      token,
    } as const;

    s.on("state", (view: ClientRoomState) => {
      setState((prev) => {
        if (prev && prev.status !== "finished" && view.status === "finished") playFx("reveal");
        return view;
      });
    });
    s.on("connect", () => {
      s.emit("hello", hello, (res: { ok: boolean; error?: string; code?: string; playerId?: string; token?: string }) => {
        if (!res.ok) {
          setError(res.error ?? "No se pudo entrar.");
          return;
        }
        writeSession({
          code: res.code!,
          playerId: res.playerId!,
          token: res.token!,
          name,
        });
        if (!code && res.code) {
          const q = preferredGame ? `?game=${preferredGame}` : "";
          window.history.replaceState(null, "", `/online/sala/${res.code}${q}`);
        }
      });
    });

    return () => {
      s.disconnect();
    };
  }, [code, name, token, preferredGame]);

  const joinUrl = useMemo(() => {
    if (!state) return "";
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/online?code=${state.code}`;
  }, [state]);

  function send(type: "startGame" | "action" | "nextRound" | "toLobby" | "react", payload?: unknown) {
    if (!socket) return;
    const onAck = (res?: { ok?: boolean; error?: string }) => {
      if (res && res.ok === false && res.error) setError(res.error);
    };
    if (type === "action") {
      socket.emit("action", payload, onAck);
      return;
    }
    if (type === "startGame" || type === "react") {
      socket.emit(type, payload, onAck);
      return;
    }
    socket.emit(type, onAck);
  }

  function startSelected() {
    if (!selectedGame) return;
    if (gameUsesCategories(selectedGame) && categories.length === 0) return;
    send("startGame", {
      gameId: selectedGame,
      categories: gameUsesCategories(selectedGame) ? categories : [],
      picante: gameUsesCategories(selectedGame) ? picante : false,
      options,
    });
  }

  if (!state) {
    return (
      <div className="stack">
        {error ? (
          <div className="card error">
            <b>Se pudrió</b>
            <p>{error}</p>
          </div>
        ) : (
          <p className="lead">Conectando… si tarda, no es el WiFi de tu casa. Juro.</p>
        )}
      </div>
    );
  }

  const meta = state.gameId ? getGameMeta(state.gameId) : null;
  const selectedMeta = selectedGame ? getGameMeta(selectedGame) : null;
  const connectedCount = state.players.filter((p) => p.connected).length;
  const canStartSelected =
    Boolean(selectedGame && selectedMeta) &&
    connectedCount >= (selectedMeta?.minPlayers ?? 2) &&
    (!gameUsesCategories(selectedGame) || categories.length > 0);

  return (
    <div className="stack">
      {error ? (
        <div className="card error">
          <b>Se pudrió</b>
          <p>{error}</p>
        </div>
      ) : null}
      {state.notice ? <div className="notice">{state.notice.text}</div> : null}

      {state.status === "lobby" ? (
        <>
          <QrCard value={joinUrl} code={state.code} />
          <div className="card stack">
            <h2>La barra</h2>
            <PlayerList players={state.players} youId={state.you.id} />
          </div>
          {state.canHost ? (
            selectedGame && selectedMeta ? (
              <>
                <div className="card stack">
                  <p className="pill">
                    {selectedMeta.emoji} {selectedMeta.name}
                  </p>
                  <p className="lead" style={{ margin: 0 }}>
                    Configurá este juego y dale play cuando esté la mesa.
                  </p>
                  {gameUsesCategories(selectedGame) ? (
                    <CategoryFilters
                      selected={categories}
                      picante={picante}
                      onToggle={(id: Category) =>
                        setCategories((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]))
                      }
                      onPicante={() => setPicante((v) => !v)}
                    />
                  ) : null}
                  <RoomOptions value={options} onChange={setOptions} gameId={selectedGame} />
                  <FxToggle />
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={!canStartSelected}
                  onClick={startSelected}
                >
                  Empezar {selectedMeta.name}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setSelectedGame(null)}>
                  Cambiar juego
                </button>
              </>
            ) : (
              <>
                <h2>Elegí el juego</h2>
                <p className="lead">Primero el juego. Después aparecen solo sus extras.</p>
                <div className="card stack">
                  <RoomOptions value={options} onChange={setOptions} allowNight />
                  <FxToggle />
                </div>
                <GamePicker
                  implementedOnly
                  playerCount={connectedCount}
                  onPick={(id: GameId) => setSelectedGame(id)}
                />
              </>
            )
          ) : (
            <p className="lead">Esperá que el anfitrión deje de hablar y apriete un botón.</p>
          )}
        </>
      ) : (
        <>
          <div className="card stack">
            <p className="pill">
              {meta?.emoji} {meta?.name}
            </p>
            {meta?.howTo ? <HowToPlay text={meta.howTo} /> : null}
            {state.status === "finished" ? (
              <PodiumScreen
                players={state.players}
                youId={state.you.id}
                nightLabel={
                  state.night ? `Noche · juego ${state.night.index + 1}/${state.night.queue.length}` : null
                }
              />
            ) : null}
            <ActiveGame
              gameId={state.gameId!}
              publicView={state.public}
              privateView={state.private}
              isHost={state.canHost}
              youId={state.you.id}
              players={state.players}
              timerSec={state.options?.timerSec ?? options.timerSec}
              onAction={(type, payload) => send("action", { type, payload })}
            />
          </div>
          <div className="card stack">
            <h3>Puntaje acumulado</h3>
            <PlayerList players={state.players} youId={state.you.id} />
            <ReactionsBar reactions={state.reactions ?? []} onReact={(emoji) => send("react", { emoji })} />
          </div>
          {state.canHost && state.status === "finished" ? (
            <div className="row">
              <button className="btn btn-primary" type="button" onClick={() => send("nextRound")}>
                {state.night && state.night.index + 1 < state.night.queue.length
                  ? "Siguiente juego de la noche"
                  : "Otra ronda"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setSelectedGame(preferredGame ?? null);
                  send("toLobby");
                }}
              >
                Al living
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
