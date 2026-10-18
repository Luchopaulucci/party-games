"use client";

import { useState } from "react";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { StopPrivateView, StopPublicView } from "@/shared/games/stop/logic";

export function StopView({
  publicView,
  privateView,
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
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <RoundReveal
        title={`Letra ${publicView.letter}`}
        headline="Puntos después del voto"
        lines={players.map((p) => `${p.name}: ${publicView.points?.[p.id] ?? 0}`)}
      />
    );
  }

  if (publicView.phase === "review" && publicView.review) {
    const item = publicView.review;
    return (
      <div className="stack">
        <p className="kicker">
          Ortografía {item.index + 1}/{item.total}
        </p>
        <p className="lead">
          {nameOf(item.playerId)} · {item.category}
        </p>
        <p className="prompt">{item.text}</p>
        <p className="lead">¿La aceptan? Voten. Después se dan los puntos.</p>
        <div className="grid-2">
          <button
            className="btn btn-primary"
            type="button"
            disabled={privateView.myReviewVote != null}
            onClick={() => onAction("review", { value: "ok" })}
          >
            Aceptar
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            disabled={privateView.myReviewVote != null}
            onClick={() => onAction("review", { value: "no" })}
          >
            Rechazar
          </button>
        </div>
        <p className="lead">
          Votos: {item.votedIds.length}/{players.length}
          {privateView.myReviewVote ? ` · tu voto: ${privateView.myReviewVote === "ok" ? "ok" : "afuera"}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="kicker">Tutti frutti</p>
      <div className="big">{publicView.letter}</div>
      <p className="lead">Termina cuando se acaba el tiempo o cuando alguien completa todo.</p>
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
        <div className="notice">Ya mandaste. Si alguien completa todo o corta el reloj, pasan a votar ortografía.</div>
      ) : (
        <button className="btn btn-primary" type="button" onClick={() => onAction("write", { answers })}>
          Mandar
        </button>
      )}
    </div>
  );
}
