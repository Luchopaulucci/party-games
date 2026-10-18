"use client";

import { playerColor } from "@/components/PlayerList";
import type { VotePrivateView, VotePublicView } from "@/shared/games/vote/logic";

export function VoteView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
}: {
  publicView: VotePublicView;
  privateView: VotePrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">Solo los totales. El chusmerío de quién votó a quién se queda en el server.</p>
        <div className="players">
          {(publicView.totals ?? []).map((row, i) => {
            const player = players.find((p) => p.id === row.playerId);
            return (
              <div className="player" key={row.playerId}>
                <span className="swatch" style={{ background: playerColor(player ?? { id: row.playerId }, i) }} />
                <strong style={{ flex: 1 }}>{nameOf(row.playerId)}</strong>
                <div className="score">{row.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
      <p className="lead">Votá en secreto. El resto no ve tu palo.</p>
      <div className="stack">
        {players.map((p) => (
          <button
            key={p.id}
            className="btn btn-ghost"
            type="button"
            onClick={() => onAction("vote", { targetId: p.id })}
          >
            {p.name}
            {p.id === youId ? " (sí, podés votarte, narcisista)" : ""}
            {privateView.myVote === p.id ? " · tu voto" : ""}
          </button>
        ))}
      </div>
      <p className="lead">
        Mandaron voto: {publicView.votedIds.length}/{players.length}
      </p>
      {isHost ? (
        <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
          Revelar totales
        </button>
      ) : null}
    </div>
  );
}
