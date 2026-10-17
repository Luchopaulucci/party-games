"use client";

import type { DarePrivateView, DarePublicView } from "@/shared/games/dare/logic";

export function DareView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
}: {
  publicView: DarePublicView;
  privateView: DarePrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const chooser = players.find((p) => p.id === publicView.chooserId)?.name ?? "Alguien";

  if (publicView.phase === "pick") {
    return (
      <div className="stack">
        <p className="prompt">Verdad o reto, {chooser}.</p>
        {privateView.isChooser ? (
          <div className="row">
            <button className="btn btn-primary" type="button" onClick={() => onAction("pick", { choice: "verdad" })}>
              Verdad
            </button>
            <button className="btn btn-gold" type="button" onClick={() => onAction("pick", { choice: "reto" })}>
              Reto
            </button>
          </div>
        ) : (
          <p className="lead">Esperá que elija. No lo apures, ya está nervioso.</p>
        )}
      </div>
    );
  }

  if (publicView.phase === "reveal") {
    const t = publicView.totals ?? { cumplio: 0, chanto: 0 };
    return (
      <div className="stack">
        <p className="prompt">{publicView.card?.text}</p>
        <p className="lead">
          La mesa votó {t.cumplio} cumplió / {t.chanto} chantó.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="pill">{publicView.choice === "reto" ? "Reto" : "Verdad"}</p>
      <p className="prompt">{publicView.card?.text}</p>
      {youId === publicView.chooserId ? (
        <p className="lead">Hacelo. La mesa es juez y no tiene piedad.</p>
      ) : (
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={() => onAction("vote", { value: "cumplio" })}>
            Cumplió {privateView.myVote === "cumplio" ? "✓" : ""}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => onAction("vote", { value: "chanto" })}>
            Chantó {privateView.myVote === "chanto" ? "✓" : ""}
          </button>
        </div>
      )}
      <p className="lead">
        Votos: {publicView.votedIds.length}/{Math.max(0, players.length - 1)}
      </p>
      {isHost ? (
        <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
          Cerrar juicio
        </button>
      ) : null}
    </div>
  );
}
