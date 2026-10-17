"use client";

import { useState } from "react";
import type { MimicPrivateView, MimicPublicView } from "@/shared/games/charades/logic";

export function MimicView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: MimicPublicView;
  privateView: MimicPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [guess, setGuess] = useState("");
  const actor = players.find((p) => p.id === publicView.actorId)?.name ?? "alguien";

  if (publicView.phase === "done") {
    return (
      <div className="stack">
        <p className="lead">Era “{publicView.word}”.</p>
        <p className="lead">
          {publicView.winnerId
            ? `La vio ${players.find((p) => p.id === publicView.winnerId)?.name}.`
            : "Nadie entendió la coreografía."}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">{actor} hace mímica. Estilo Heads Up / charadas: sin hablar.</p>
      {privateView.isActor ? (
        <div className="secret">
          <div className="prompt">{privateView.word}</div>
          <p>Actuá. Si hablás, te silban.</p>
        </div>
      ) : (
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
            <input value={guess} onChange={(e) => setGuess(e.target.value)} />
          </label>
          <button className="btn btn-gold" type="submit">
            Adivinar
          </button>
        </form>
      )}
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("skip")}>
          Saltar
        </button>
      ) : null}
    </div>
  );
}
