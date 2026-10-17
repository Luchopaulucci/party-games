"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CategoryFilters } from "@/components/CategoryFilters";
import { GamePicker } from "@/components/GamePicker";
import { PlayerList } from "@/components/PlayerList";
import { QrCard } from "@/components/QrCard";
import { ActiveGame } from "@/components/games/ActiveGame";
import { CATEGORIES, type Category } from "@/shared/games/closest/premise-types";
import { getGameMeta } from "@/shared/games/registry";
import type { ClientRoomState, GameId } from "@/shared/types";
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

  useEffect(() => {
    const s = io(socketUrl(), { transports: ["websocket", "polling"] });
    setSocket(s);

    const hello = {
      intent: code ? "join" : "create",
      name,
      code,
      token,
    } as const;

    s.on("state", (view: ClientRoomState) => setState(view));
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

  function send(type: "startGame" | "action" | "nextRound" | "toLobby", payload?: unknown) {
    if (!socket) return;
    const onAck = (res?: { ok?: boolean; error?: string }) => {
      if (res && res.ok === false && res.error) setError(res.error);
    };
    if (type === "action") {
      socket.emit("action", payload, onAck);
      return;
    }
    if (type === "startGame") {
      socket.emit("startGame", payload, onAck);
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
              </div>
              <h2>Elegí el juego</h2>
              <GamePicker
                playerCount={state.players.filter((p) => p.connected).length}
                onPick={(id: GameId) => send("startGame", { gameId: id, categories, picante })}
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
            <ActiveGame
              gameId={state.gameId!}
              publicView={state.public}
              privateView={state.private}
              isHost={state.canHost}
              youId={state.you.id}
              players={state.players}
              onAction={(type, payload) => send("action", { type, payload })}
            />
          </div>
          <div className="card stack">
            <h3>Puntaje acumulado</h3>
            <PlayerList players={state.players} youId={state.you.id} />
          </div>
          {state.canHost && state.status === "finished" ? (
            <div className="row">
              <button className="btn btn-primary" type="button" onClick={() => send("nextRound")}>
                Otra ronda
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
