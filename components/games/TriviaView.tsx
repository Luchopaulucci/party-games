"use client";

import type { TriviaPrivateView, TriviaPublicView } from "@/shared/games/trivia/logic";

export function TriviaView({
  publicView,
  privateView,
  isHost,
  onAction,
}: {
  publicView: TriviaPublicView;
  privateView: TriviaPrivateView;
  isHost: boolean;
  players: { id: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">La buena era: {publicView.options[publicView.correct ?? 0]}</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
      <p className="lead">Preguntados express. Pensá menos, tocá más.</p>
      {publicView.options.map((opt, i) => (
        <button
          key={opt}
          className="btn btn-ghost"
          type="button"
          disabled={privateView.myAnswer !== null}
          onClick={() => onAction("answer", { index: i })}
        >
          {opt}
          {privateView.myAnswer === i ? " · tu palo" : ""}
        </button>
      ))}
      <p className="lead">
        Ya contestaron {publicView.submittedIds.length}
      </p>
      {isHost ? (
        <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
          Revelar
        </button>
      ) : null}
    </div>
  );
}
