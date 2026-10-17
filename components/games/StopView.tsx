"use client";

import { useState } from "react";
import type { StopPrivateView, StopPublicView } from "@/shared/games/stop/logic";

export function StopView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: StopPublicView;
  privateView: StopPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(privateView.myAnswers);

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="kicker">Letra {publicView.letter}</p>
        {players.map((p) => (
          <div className="card stack" key={p.id}>
            <strong>{p.name}</strong>
            {publicView.categories.map((c) => (
              <small key={c}>
                {c}: {publicView.answers?.[p.id]?.[c] || "—"}
              </small>
            ))}
            <div className="score">{publicView.points?.[p.id] ?? 0}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="kicker">Tutti frutti / Alto el lápiz</p>
      <div className="big">{publicView.letter}</div>
      {publicView.categories.map((c) => (
        <label key={c}>
          {c}
          <input
            value={answers[c] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [c]: e.target.value })}
          />
        </label>
      ))}
      {Object.keys(privateView.myAnswers).length ? (
        <div className="notice">Ya mandaste. A esperar el “¡Alto!”.</div>
      ) : (
        <button className="btn btn-primary" type="button" onClick={() => onAction("write", { answers })}>
          ¡Alto!
        </button>
      )}
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Cerrar ronda
        </button>
      ) : null}
    </div>
  );
}
