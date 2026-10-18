"use client";

import { RandomReader } from "@/components/play/RandomReader";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { WouldPrivateView, WouldPublicView } from "@/shared/games/would/logic";

export function WouldView({
  publicView,
  privateView,
  players,
  onAction,
}: {
  publicView: WouldPublicView;
  privateView: WouldPrivateView;
  isHost: boolean;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const reader = players.find((p) => p.id === publicView.readerId);

  if (publicView.phase === "reveal") {
    const t = publicView.totals ?? { left: 0, right: 0 };
    return (
      <RoundReveal
        title="La mesa eligió"
        headline="¿Qué preferís?"
        lines={[`${publicView.left}: ${t.left}`, `${publicView.right}: ${t.right}`, "Sin puntaje. Solo vergüenza."]}
      />
    );
  }

  return (
    <div className="stack">
      {reader ? <RandomReader name={reader.name} color={reader.color} prompt="Lee las dos opciones. El resto vota." /> : null}
      <p className="prompt">¿Qué preferís?</p>
      <button
        className="btn btn-primary"
        type="button"
        disabled={privateView.myVote != null}
        onClick={() => onAction("vote", { side: "left" })}
      >
        {publicView.left}
        {privateView.myVote === "left" ? " · tu voto" : ""}
      </button>
      <button
        className="btn btn-gold"
        type="button"
        disabled={privateView.myVote != null}
        onClick={() => onAction("vote", { side: "right" })}
      >
        {publicView.right}
        {privateView.myVote === "right" ? " · tu voto" : ""}
      </button>
      <p className="lead">
        Votos: {publicView.votedIds.length}/{players.length}. Sin puntaje.
      </p>
    </div>
  );
}
