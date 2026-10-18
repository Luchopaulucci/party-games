"use client";

import { RoundReveal } from "@/components/play/RoundReveal";
import type { EmojiPrivateView, EmojiPublicView } from "@/shared/games/emoji/logic";

export function EmojiView({
  publicView,
  privateView,
  players,
  local,
  onAction,
}: {
  publicView: EmojiPublicView;
  privateView: EmojiPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  local?: boolean;
  onAction: (type: string, payload?: unknown) => void;
}) {
  if (publicView.phase === "reveal") {
    return (
      <RoundReveal
        title="Era"
        headline={publicView.answer ?? "se fue al pasto"}
        lines={[publicView.puzzle]}
      />
    );
  }

  return (
    <div className="stack">
      <p className="prompt" style={{ fontSize: "2.8rem", lineHeight: 1.2 }}>
        {publicView.puzzle}
      </p>
      <p className="lead">Adivinen en voz alta. La respuesta sale al final de la ronda.</p>
      {privateView.seen ? (
        <div className="notice">Ya la viste. Pasá el celu.</div>
      ) : (
        <button className="btn btn-primary" type="button" onClick={() => onAction("pass")}>
          {local ? "Listo, pasá el celu" : "Listo"}
        </button>
      )}
      <p className="lead">
        Vieron: {publicView.seenIds.length}/{players.length}
      </p>
    </div>
  );
}
