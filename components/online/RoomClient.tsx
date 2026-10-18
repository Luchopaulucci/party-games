"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CategoryFilters } from "@/components/CategoryFilters";
import { GamePicker } from "@/components/GamePicker";
import { RoomOptions } from "@/components/RoomOptions";
import { PlayerList } from "@/components/PlayerList";
import { QrCard } from "@/components/QrCard";
import { ActiveGame } from "@/components/games/ActiveGame";
import { HowToPlay } from "@/components/HowToPlay";
import { PodiumScreen } from "@/components/PodiumScreen";
import { ReactionsBar } from "@/components/ReactionsBar";
import { FxToggle } from "@/components/FxToggle";
import { playFx } from "@/lib/fx";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { getGameMeta } from "@/shared/games/registry";
import type { ClientRoomState, GameId, GameOptions } from "@/shared/types";
import { socketUrl, writeSession } from "@/lib/session";

export function RoomClient({
  code,
  name,
  token,
}: {
  code?: string;
  name: string;
  token?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ClientRoomState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [picante, setPicante] = useState(false);
  const [options, setOptions] = useState<GameOptions>({ timerSec: 0, rounds: 1, mode: "no-pasarse" });

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
          window.history.replaceState(null, "", `/online/sala/${res.code}`);
        }
      });
    });

    return () => {
      s.disconnect();
    };
  }, [code, name, token]);

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
            <>
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
              <FxToggle />
            </div>
            <h2>Elegí el juego</h2>
            <GamePicker
              playerCount={state.players.filter((p) => p.connected).length}
              onPick={(id: GameId) => send("startGame", { gameId: id, categories, picante, options })}
            />
            </>
          ) : (
            <p className="lead">Esperá que el anfitrión deje de hablar y apriete un botón.</p>
          )}
        </>
      ) : (
        <>
          <div className="card stack">
            <p className="pill">{meta?.emoji} {meta?.name}</p>
            {meta?.howTo ? <HowToPlay text={meta.howTo} /> : null}
            {state.status === "finished" ? (
              <PodiumScreen
                players={state.players}
                youId={state.you.id}
                nightLabel={state.night ? `Noche · juego ${state.night.index + 1}/${state.night.queue.length}` : null}
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
              <button className="btn btn-ghost" type="button" onClick={() => send("toLobby")}>
                Al living
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
