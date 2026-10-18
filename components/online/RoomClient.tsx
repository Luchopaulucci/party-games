"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CategoryFilters } from "@/components/CategoryFilters";
import { FxToggle } from "@/components/FxToggle";
import { HowToPlay } from "@/components/HowToPlay";
import { PlayerList } from "@/components/PlayerList";
import { PodiumScreen } from "@/components/PodiumScreen";
import { QrCard } from "@/components/QrCard";
import { ReactionsBar } from "@/components/ReactionsBar";
import { RoomOptions, gameUsesCategories } from "@/components/RoomOptions";
import { ActiveGame } from "@/components/games/ActiveGame";
import { playFx } from "@/lib/fx";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { supportsMode } from "@/shared/games/browse";
import { getGameMeta } from "@/shared/games/registry";
import type { ClientRoomState, GameId, GameOptions } from "@/shared/types";
import { currentShareOrigin } from "@/lib/online-access";
import { roomPagePath, roomShareUrl } from "@/lib/room-url";
import { socketUrl, writeSession } from "@/lib/session";
import { WAKE_FAIL_MESSAGE, WAKE_MESSAGE, WAKE_WINDOW_MS, wakeStatus } from "@/lib/wake";

export function RoomClient({
  code,
  name,
  token,
  preferredGame = null,
  registerLeave,
  onRoomClosed,
}: {
  code?: string;
  name: string;
  token?: string;
  preferredGame?: GameId | null;
  registerLeave?: (fn: () => void) => void;
  onRoomClosed?: (text?: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [waking, setWaking] = useState(false);
  const [state, setState] = useState<ClientRoomState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [picante, setPicante] = useState(false);
  const [options, setOptions] = useState<GameOptions>({ timerSec: 0, rounds: 1 });
  const closedRef = useRef(onRoomClosed);
  closedRef.current = onRoomClosed;

  useEffect(() => {
    const startedAt = Date.now();
    const s = io(socketUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 4000,
      timeout: 10_000,
    });
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
    s.on("roomClosed", (payload: { text?: string }) => {
      closedRef.current?.(payload?.text);
    });
    s.on("connect_error", () => {
      const status = wakeStatus(Date.now() - startedAt);
      if (status.kind === "waking") {
        setWaking(true);
        setError(null);
        return;
      }
      setWaking(false);
      setError(status.message);
    });
    const failTimer = window.setTimeout(() => {
      if (s.connected) return;
      setWaking(false);
      setError(WAKE_FAIL_MESSAGE);
    }, WAKE_WINDOW_MS);
    s.on("connect", () => {
      setWaking(false);
      setError(null);
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
          window.history.replaceState(null, "", roomPagePath({ code: res.code, game: preferredGame }));
        }
      });
    });

    return () => {
      window.clearTimeout(failTimer);
      s.disconnect();
    };
  }, [code, name, token, preferredGame]);

  useEffect(() => {
    registerLeave?.(() => {
      socket?.emit("leaveRoom");
    });
  }, [registerLeave, socket]);

  const joinUrl = useMemo(() => {
    if (!state) return "";
    const origin = currentShareOrigin();
    return origin ? roomShareUrl(state.code, origin) : "";
  }, [state]);

  function send(type: "startGame" | "action" | "nextRound" | "toLobby" | "react" | "leaveRoom", payload?: unknown) {
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

  const selectedGame = state?.gameId ?? preferredGame;
  const selectedMeta = selectedGame ? getGameMeta(selectedGame) : null;

  function startSelected() {
    if (!selectedGame || (selectedGame && !supportsMode(selectedGame, "online"))) return;
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
        ) : waking ? (
          <p className="lead">
            {WAKE_MESSAGE} Render free se duerme. Aguantá un toque, tipo un minuto.
          </p>
        ) : (
          <p className="lead">Conectando… si tarda, no es el WiFi de tu casa. Juro.</p>
        )}
      </div>
    );
  }

  const meta = state.gameId ? getGameMeta(state.gameId) : selectedMeta;
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
          {joinUrl ? (
            <>
              <QrCard value={joinUrl} code={state.code} />
              <p className="lead" style={{ textAlign: "center", margin: 0 }}>
                Link: {joinUrl}
              </p>
            </>
          ) : (
            <div className="card stack">
              <div className="code">{state.code}</div>
              <p className="lead" style={{ margin: 0, textAlign: "center" }}>
                Mandales el código. Esta build no tiene web pública para armar el QR.
              </p>
            </div>
          )}
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
              </>
            ) : (
              <p className="lead">Este link no trae juego. Volvé al home y elegí uno.</p>
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
              <>
                <PodiumScreen
                  players={state.players}
                  youId={state.you.id}
                  nightLabel={
                    state.night ? `Noche · juego ${state.night.index + 1}/${state.night.queue.length}` : null
                  }
                />
                <div className="card stack">
                  <h3>Tabla</h3>
                  <PlayerList players={state.players} youId={state.you.id} showScores />
                </div>
              </>
            ) : null}
            {state.status !== "finished" ? (
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
            ) : null}
          </div>
          {state.status !== "finished" ? (
            <ReactionsBar reactions={state.reactions ?? []} onReact={(emoji) => send("react", { emoji })} />
          ) : (
            <ReactionsBar reactions={state.reactions ?? []} onReact={(emoji) => send("react", { emoji })} />
          )}
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
                onClick={() => send("toLobby")}
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
