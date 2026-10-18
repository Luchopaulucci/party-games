"use client";

import type { WouldPrivateView, WouldPublicView } from "@/shared/games/would/logic";

export function WouldView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: WouldPublicView;
  privateView: WouldPrivateView;
  isHost: boolean;
  players: { id: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  if (publicView.phase === "reveal") {
    const t = publicView.totals ?? { left: 0, right: 0 };
    return (
      <div className="stack">
        <p className="prompt">¿Qué eligió la mesa?</p>
        <p className="lead">
          {publicView.left}: {t.left} · {publicView.right}: {t.right}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">¿Qué preferís?</p>
      <button className="btn btn-primary" type="button" onClick={() => onAction("vote", { side: "left" })}>
        {publicView.left}
        {privateView.myVote === "left" ? " · tu voto" : ""}
      </button>
      <button className="btn btn-gold" type="button" onClick={() => onAction("vote", { side: "right" })}>
        {publicView.right}
        {privateView.myVote === "right" ? " · tu voto" : ""}
      </button>
      <p className="lead">
        Votos: {publicView.votedIds.length}/{players.length}
      </p>
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Revelar
        </button>
      ) : null}
    </div>
  );
}
