"use client";

import { useState } from "react";
import type { ChainPrivateView, ChainPublicView } from "@/shared/games/chain/logic";

export function ChainView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: ChainPublicView;
  privateView: ChainPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [text, setText] = useState("");
  const current = players.find((p) => p.id === publicView.currentId)?.name ?? "Alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="prompt">La cadena quedó así</p>
        {(publicView.chain ?? []).map((row, i) => (
          <p key={`${row.playerId}-${i}`} className="lead" style={{ margin: 0 }}>
            {i === 0 ? "Mesa" : players.find((p) => p.id === row.playerId)?.name}: <b>{row.text}</b>
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">Última: {publicView.lastWord}</p>
      <p className="lead">
        {privateView.isTurn ? "Tu turno. Tirà una palabra que pegue." : `Espera ${current}.`}
      </p>
      {privateView.isTurn ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            onAction("word", { text });
            setText("");
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Asociación, no copia" maxLength={32} />
          <button className="btn btn-primary" type="submit">
            Mandar
          </button>
        </form>
      ) : null}
      <p className="lead">Palabras: {publicView.count}</p>
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Cortar cadena
        </button>
      ) : null}
    </div>
  );
}
