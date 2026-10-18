"use client";

import { useEffect, useState } from "react";
import { GuessSlider } from "@/components/play/GuessSlider";
import { RoundReveal } from "@/components/play/RoundReveal";
import { defaultGuess } from "@/shared/play/slider";
import type { HigherLowerPrivateView, HigherLowerPublicView } from "@/shared/games/higherlower/logic";

const RESULT_COPY = {
  mas: "es MÁS que eso",
  menos: "es MENOS que eso",
  justo: "justo. Un genio.",
  pasado: "te pasaste del rango, crack",
} as const;

export function HigherLowerView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: HigherLowerPublicView;
  privateView: HigherLowerPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const lo = publicView.min + 1;
  const hi = Math.max(lo, publicView.max - 1);
  const [value, setValue] = useState(() => defaultGuess(lo, hi));
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  useEffect(() => {
    setValue(defaultGuess(publicView.min + 1, Math.max(publicView.min + 1, publicView.max - 1)));
  }, [publicView.min, publicView.max, publicView.currentPlayerId]);

  if (publicView.phase === "done") {
    return (
      <RoundReveal
        title="El número"
        headline={publicView.prompt}
        value={publicView.secret}
        lines={[
          publicView.winnerId
            ? `La clavó ${nameOf(publicView.winnerId)}. Un poco de respeto.`
            : "Nadie la vio. El número se fue solo, como el último bondi.",
          publicView.blurb ?? "",
        ].filter(Boolean)}
      />
    );
  }

  return (
    <div className="stack guess-screen">
      <p className="lead">
        Está entre {publicView.min} y {publicView.max}, sin contar los bordes. Turno de{" "}
        {nameOf(publicView.currentPlayerId)}.
      </p>
      {publicView.guesses.map((g, i) => (
        <div className="player" key={`${g.playerId}-${i}`}>
          <div className="meta">
            <strong>{nameOf(g.playerId)}</strong>
            <small>{g.value}</small>
          </div>
          <small>{RESULT_COPY[g.result]}</small>
        </div>
      ))}
      {privateView.isYourTurn ? (
        <>
          <GuessSlider question={publicView.prompt} min={lo} max={hi} value={value} onChange={setValue} />
          <button className="btn btn-primary" type="button" onClick={() => onAction("guess", { value })}>
            Tirar
          </button>
        </>
      ) : (
        <div className="notice">No es tu turno. Disfrutá el chamuyo ajeno.</div>
      )}
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Revelar y cortar
        </button>
      ) : null}
    </div>
  );
}
