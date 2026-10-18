"use client";

import { RoundReveal } from "@/components/play/RoundReveal";
import type { NeverPrivateView, NeverPublicView } from "@/shared/games/never/logic";

export function NeverView({
  publicView,
  onAction,
}: {
  publicView: NeverPublicView;
  privateView: NeverPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  if (publicView.phase === "done") {
    return (
      <RoundReveal
        title="Se acabó el mazo"
        headline="Yo nunca"
        lines={["Mismo mazo, un solo celu. Si alguien mintió, que invite."]}
      />
    );
  }

  return (
    <div className="stack">
      <p className="kicker">
        Carta {publicView.index + 1}/{publicView.total}
      </p>
      <div className="card stack" data-testid="never-card">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">Un solo teléfono. El que sí, levanta. Después, siguiente carta.</p>
      </div>
      <button className="btn btn-primary" type="button" onClick={() => onAction("next")}>
        Siguiente carta
      </button>
    </div>
  );
}
