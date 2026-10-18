"use client";

import { useState } from "react";
import { playerColor } from "@/components/PlayerList";
import { GuessSlider } from "@/components/play/GuessSlider";
import { RoundReveal } from "@/components/play/RoundReveal";
import { defaultGuess } from "@/shared/play/slider";
import type { ClosestPrivateView, ClosestPublicView } from "@/shared/games/closest/logic";
import { winnerHeadline } from "@/shared/ui/format";

export function ClosestView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: ClosestPublicView;
  privateView: ClosestPrivateView;
  isHost: boolean;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const min = publicView.sliderMin ?? 0;
  const max = publicView.sliderMax ?? 100;
  const [value, setValue] = useState(() => defaultGuess(min, max));
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    const ranking = publicView.ranking ?? [];
    const best = ranking[0]?.distance;
    const winnerNames = ranking.filter((row) => row.distance === best).map((row) => nameOf(row.playerId));
    return (
      <div className="stack">
        <RoundReveal
          title="El valor real"
          headline={publicView.prompt}
          value={publicView.trueAnswer}
          unit={publicView.unit}
          lines={[winnerHeadline(winnerNames), publicView.blurb ?? ""].filter(Boolean)}
        />
        <div className="players">
          {ranking.map((row, i) => {
            const player = players.find((p) => p.id === row.playerId);
            return (
              <div className="player" key={row.playerId}>
                <span className="swatch" style={{ background: playerColor(player ?? { id: row.playerId }, i) }} />
                <div className="meta" style={{ flex: 1 }}>
                  <strong>{nameOf(row.playerId)}</strong>
                  <small>
                    palo {row.guess} · a {row.distance} de distancia
                  </small>
                </div>
                <div className="score">+{row.points}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (privateView.guess != null) {
    return (
      <div className="stack">
        <div className="notice">Ya mandaste {privateView.guess}. Ahora a esperar como en el tráiler de la 9.</div>
        <p className="lead">
          Mandaron: {publicView.submittedIds.map(nameOf).join(", ") || "nadie todavía. Qué vergüenza."}
        </p>
        {isHost ? (
          <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
            Revelar ahora (los que no mandaron, se joden)
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack guess-screen">
      <GuessSlider
        question={publicView.prompt}
        min={min}
        max={max}
        unit={publicView.unit}
        value={value}
        onChange={setValue}
      />
      <button className="btn btn-primary" type="button" onClick={() => onAction("guess", { value })}>
        Mandale
      </button>
      <p className="lead">
        Mandaron: {publicView.submittedIds.map(nameOf).join(", ") || "nadie todavía. Qué vergüenza."}
      </p>
    </div>
  );
}
