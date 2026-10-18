"use client";

import { useState } from "react";
import type { LiePrivateView, LiePublicView } from "@/shared/games/lie/logic";

export function LieView({
  publicView,
  privateView,
  isHost,
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
    return (
      <div className="stack">
        <p className="lead">La mentira de {nameOf(publicView.storytellerId)} era:</p>
        {(publicView.statements ?? []).map((s, i) => (
          <div className="player" key={s}>
            <div className="meta" style={{ flex: 1 }}>
              <strong>{s}</strong>
              <small>{publicView.lieIndex === i ? "MENTIRA" : "verdad"}</small>
            </div>
            <div className="score">{publicView.totals?.find((t) => t.id === String(i))?.count ?? 0}</div>
          </div>
        ))}
      </div>
    );
  }

  if (publicView.phase === "vote") {
    return (
      <div className="stack">
        <p className="lead">¿Cuál es el verso de {nameOf(publicView.storytellerId)}?</p>
        {(publicView.statements ?? []).map((s, i) => (
          <button key={s} className="btn btn-ghost" type="button" onClick={() => onAction("vote", { index: i })}>
            {s}
            {privateView.myVote === String(i) ? " · tu voto" : ""}
          </button>
        ))}
        {isHost ? (
          <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
            Revelar
          </button>
        ) : null}
      </div>
    );
  }

  if (!privateView.isStoryteller) {
    return <p className="lead">Esperá que {nameOf(publicView.storytellerId)} arme las tres boludeces. Una es chamuyo.</p>;
  }

  return (
    <div className="stack">
      <p className="lead">Tres datos. Uno es mentira. Si te creen, sumás.</p>
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
        Listo, que adivinen
      </button>
    </div>
  );
}
