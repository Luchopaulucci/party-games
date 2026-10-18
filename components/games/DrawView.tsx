"use client";

import { useState } from "react";
import { DrawPad } from "@/components/DrawPad";
import type { DrawPrivateView, DrawPublicView } from "@/shared/games/draw/logic";

export function DrawView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
}: {
  publicView: DrawPublicView;
  privateView: DrawPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [guess, setGuess] = useState("");
  const you = players.find((p) => p.id === youId);
  const drawer = players.find((p) => p.id === publicView.drawerId)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="lead">Era {publicView.word}.</p>
        <DrawPad strokes={publicView.strokes} color="#1e1446" disabled onStroke={() => undefined} />
        <p className="lead">
          {publicView.winnerId
            ? `La pescó ${players.find((p) => p.id === publicView.winnerId)?.name}.`
            : "Nadie la vio. El arte contemporáneo gana otra vez."}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">Dibuja {drawer}.</p>
      {privateView.isDrawer ? <div className="secret"><div className="prompt">{privateView.word}</div></div> : null}
      <DrawPad
        strokes={publicView.strokes}
        color={you?.color || "#C42B54"}
        disabled={!privateView.isDrawer}
        onStroke={(stroke) => onAction("stroke", { stroke })}
      />
      {privateView.isDrawer && publicView.phase === "draw" ? (
        <button className="btn btn-primary" type="button" onClick={() => onAction("open-guess")}>
          Listo, que adivinen este desastre
        </button>
      ) : null}
      {!privateView.isDrawer && publicView.phase === "guess" ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            onAction("guess", { text: guess });
            setGuess("");
          }}
        >
          <label>
            ¿Qué es?
            <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="un mate, messi, el 60…" />
          </label>
          <button className="btn btn-gold" type="submit">
            Adivinar
          </button>
        </form>
      ) : (
        <p className="lead">Intentos: {publicView.guessCount}</p>
      )}
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("give-up")}>
          Rendirse
        </button>
      ) : null}
    </div>
  );
}
