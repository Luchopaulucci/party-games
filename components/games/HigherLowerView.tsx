"use client";

import { useState } from "react";
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
  const [value, setValue] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "done") {
    return (
      <div className="stack">
        <p className="lead">{publicView.prompt}</p>
        <div className="big">{publicView.secret}</div>
        {publicView.blurb ? <p className="lead">{publicView.blurb}</p> : null}
        <p className="lead">
          {publicView.winnerId
            ? `La clavó ${nameOf(publicView.winnerId)}. Un poco de respeto.`
            : "Nadie la vio. El número se fue solo, como el último bondi."}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
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
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(value.replace(",", "."));
            if (!Number.isFinite(n)) return;
            onAction("guess", { value: n });
            setValue("");
          }}
        >
          <label>
            Tu palo
            <input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Un número adentro del rango" />
          </label>
          <button className="btn btn-primary" type="submit">
            Tirar
          </button>
        </form>
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
