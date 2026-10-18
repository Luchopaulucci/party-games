"use client";

import { useEffect } from "react";
import type { BombPrivateView, BombPublicView } from "@/shared/games/bomb/logic";

export function BombView({
  publicView,
  privateView,
  players,
  onAction,
}: {
  publicView: BombPublicView;
  privateView: BombPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const holder = players.find((p) => p.id === publicView.holderId)?.name ?? "alguien";

  useEffect(() => {
    if (publicView.phase !== "live") return;
    const id = window.setInterval(() => onAction("tick"), 400);
    return () => window.clearInterval(id);
  }, [onAction, publicView.phase]);

  if (publicView.phase === "boom") {
    return (
      <div className="stack">
        <div className="big">💥</div>
        <p className="prompt">Le explotó a {holder}.</p>
        <p className="lead">Paga el fernet. O por lo menos el hielo.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="kicker">Bombita</p>
      <p className="prompt">La tiene {holder}</p>
      <p className="lead">Pasala antes de que explote. El timer es secreto, como la cuenta del delivery.</p>
      {privateView.holding ? (
        <button className="btn btn-primary" type="button" onClick={() => onAction("pass")}>
          Pasar
        </button>
      ) : (
        <p className="lead">Gritale que la pase.</p>
      )}
    </div>
  );
}
