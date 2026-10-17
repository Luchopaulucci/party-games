"use client";

import { useState } from "react";
import { CountUp } from "@/components/CountUp";
import { playerColor } from "@/components/PlayerList";
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
  const [value, setValue] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    const ranking = publicView.ranking ?? [];
    const best = ranking[0]?.distance;
    const winnerNames = ranking.filter((row) => row.distance === best).map((row) => nameOf(row.playerId));
    return (
      <div className="stack">
        <p className="kicker">El valor real</p>
        <p className="lead">{publicView.prompt}</p>
        <CountUp from={publicView.min ?? 0} to={publicView.trueAnswer ?? 0} unit={publicView.unit} />
        {publicView.blurb ? <p className="lead">{publicView.blurb}</p> : null}
        <p className="prompt">{winnerHeadline(winnerNames)}</p>
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

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
      {publicView.unit ? <p className="lead">Unidad: {publicView.unit}</p> : null}
      {privateView.guess == null ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(value.replace(",", "."));
            if (!Number.isFinite(n)) return;
            onAction("guess", { value: n });
          }}
        >
          <label>
            Tu palo (nadie lo ve hasta el final)
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Tirale un número"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Mandale
          </button>
        </form>
      ) : (
        <div className="notice">Ya mandaste {privateView.guess}. Ahora a esperar como en el tráiler de la 9.</div>
      )}
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
