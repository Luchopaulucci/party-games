"use client";

import { RandomReader } from "@/components/play/RandomReader";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { VotePrivateView, VotePublicView } from "@/shared/games/vote/logic";

export function VoteView({
  publicView,
  privateView,
  youId,
  players,
  local,
  onAction,
}: {
  publicView: VotePublicView;
  privateView: VotePrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string; color?: string }[];
  local?: boolean;
  onAction: (type: string, payload?: unknown) => void;
}) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";
  const reader = players.find((p) => p.id === publicView.readerId);

  if (publicView.phase === "reveal") {
    const top = publicView.totals?.[0];
    return (
      <RoundReveal
        title="Los totales"
        headline={publicView.prompt}
        lines={[
          top ? `Más probable: ${nameOf(top.playerId)}` : "",
          ...(publicView.totals ?? []).map((row) => `${nameOf(row.playerId)}: ${row.count}`),
        ].filter(Boolean)}
      />
    );
  }

  return (
    <div className="stack">
      {!local && reader ? (
        <RandomReader name={reader.name} color={reader.color} prompt="Lee la pregunta. El resto vota." />
      ) : (
        <p className="lead">Pasá el celu. Cada uno vota en secreto y se lo da al siguiente.</p>
      )}
      <p className="prompt">{publicView.prompt}</p>
      <div className="stack">
        {players.map((p) => (
          <button
            key={p.id}
            className="btn btn-ghost"
            type="button"
            disabled={privateView.myVote != null}
            onClick={() => onAction("vote", { targetId: p.id })}
          >
            {p.name}
            {p.id === youId ? " (sí, podés votarte)" : ""}
            {privateView.myVote === p.id ? " · tu voto" : ""}
          </button>
        ))}
      </div>
      <p className="lead">
        Mandaron voto: {publicView.votedIds.length}/{players.length}
      </p>
    </div>
  );
}
