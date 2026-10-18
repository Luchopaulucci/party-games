"use client";

import type { NeverPrivateView, NeverPublicView } from "@/shared/games/never/logic";

export function NeverView({
  publicView,
  privateView,
  isHost,
  onAction,
}: {
  publicView: NeverPublicView;
  privateView: NeverPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">Solo los totales. El chusmerío de quién levantó la mano se queda en el server.</p>
        <div className="big">{publicView.yesCount}</div>
        <p className="lead">{publicView.yesCount} dijeron “yo sí”. {publicView.noCount} se hicieron los santos.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
      {privateView.myChoice ? (
        <div className="notice">Ya mandaste. Esperá al resto.</div>
      ) : (
        <div className="grid-2">
          <button className="btn btn-primary" type="button" onClick={() => onAction("choose", { value: "si" })}>
            Yo sí
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => onAction("choose", { value: "no" })}>
            Yo nunca
          </button>
        </div>
      )}
      {isHost ? (
        <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
          Revelar totales
        </button>
      ) : null}
    </div>
  );
}
