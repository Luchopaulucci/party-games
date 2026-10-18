"use client";

import { useState } from "react";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { ChainPrivateView, ChainPublicView } from "@/shared/games/chain/logic";

export function ChainView({
  publicView,
  privateView,
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
      <RoundReveal
        title="La frase quedó"
        headline={publicView.phrase ?? ""}
        lines={(publicView.chain ?? []).map((row, i) =>
          `${i === 0 ? "Mesa" : players.find((p) => p.id === row.playerId)?.name}: ${row.text}`,
        )}
      />
    );
  }

  return (
    <div className="stack">
      <p className="lead">
        {privateView.isTurn
          ? "Tu turno. Una o dos palabras, no más."
          : `Se lo mandamos a ${current}. Esperá.`}
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
          <p className="prompt">Anterior: {privateView.lastWord}</p>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Una o dos palabras"
            maxLength={48}
          />
          <button className="btn btn-primary" type="submit">
            Mandar
          </button>
        </form>
      ) : (
        <div className="notice">Cuando sea tu turno te llega la última palabra. No mires el celu ajeno.</div>
      )}
      <p className="lead">
        Palabras: {publicView.count} · una vuelta
      </p>
    </div>
  );
}
