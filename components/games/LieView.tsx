"use client";

import { useState } from "react";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { LiePrivateView, LiePublicView } from "@/shared/games/lie/logic";

export function LieView({
  publicView,
  privateView,
  players,
  onAction,
}: {
  publicView: LiePublicView;
  privateView: LiePrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [statements, setStatements] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState(0);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    const lie = (publicView.statements ?? [])[publicView.lieIndex ?? 0] ?? "";
    return (
      <RoundReveal
        title={`La mentira de ${nameOf(publicView.storytellerId)}`}
        headline={lie || "se la llevó el viento"}
        lines={(publicView.statements ?? []).map((s, i) =>
          `${publicView.lieIndex === i ? "MENTIRA" : "verdad"}: ${s}`,
        )}
      />
    );
  }

  if (publicView.phase === "vote") {
    if (privateView.isStoryteller) {
      return <p className="lead">Ahora votan los demás. El último voto revela.</p>;
    }
    return (
      <div className="stack">
        <p className="lead">¿Cuál es el verso de {nameOf(publicView.storytellerId)}?</p>
        {(publicView.statements ?? []).map((s, i) => (
          <button
            key={`${i}-${s}`}
            className="btn btn-ghost"
            type="button"
            disabled={privateView.myVote != null}
            onClick={() => onAction("vote", { index: i })}
          >
            {s}
            {privateView.myVote === String(i) ? " · tu voto" : ""}
          </button>
        ))}
        <p className="lead">
          Votos: {publicView.votedIds.length}/{Math.max(0, players.length - 1)}. El último revela.
        </p>
      </div>
    );
  }

  if (!privateView.isStoryteller) {
    return (
      <p className="lead">
        Esperá que {nameOf(publicView.storytellerId)} arme las tres frases. Una es chamuyo.
      </p>
    );
  }

  return (
    <div className="stack">
      <p className="lead">Tres frases. Marcá la mentira. Después se pasa el teléfono y votan.</p>
      {statements.map((s, i) => (
        <label key={i}>
          {i + 1}
          <input
            value={s}
            onChange={(e) => setStatements(statements.map((x, idx) => (idx === i ? e.target.value : x)))}
          />
        </label>
      ))}
      <label>
        ¿Cuál es la mentira?
        <select value={lieIndex} onChange={(e) => setLieIndex(Number(e.target.value))}>
          <option value={0}>1</option>
          <option value={1}>2</option>
          <option value={2}>3</option>
        </select>
      </label>
      <button className="btn btn-primary" type="button" onClick={() => onAction("write", { statements, lieIndex })}>
        Listo, pasá el teléfono
      </button>
    </div>
  );
}
