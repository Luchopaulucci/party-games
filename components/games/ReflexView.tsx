"use client";

import type { ReflexPrivateView, ReflexPublicView } from "@/shared/games/reflex/logic";

export function ReflexView({
  publicView,
  privateView,
  players,
  onAction,
}: {
  publicView: ReflexPublicView;
  privateView: ReflexPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "done") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">
          La buena era “{publicView.options[publicView.correct ?? 0]}”.{" "}
          {publicView.winnerId ? `Ganó ${nameOf(publicView.winnerId)}.` : "Nadie la tocó a tiempo."}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="kicker">El más lento paga el fernet</p>
      <p className="prompt">{publicView.prompt}</p>
      {publicView.options.map((opt, i) => (
        <button
          key={opt}
          className="btn btn-ghost"
          type="button"
          disabled={privateView.myTap !== null}
          onClick={() => onAction("tap", { index: i })}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
