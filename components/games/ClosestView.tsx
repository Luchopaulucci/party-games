"use client";

import { useState } from "react";
import type { ClosestPrivateView, ClosestPublicView } from "@/shared/games/closest/logic";

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
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [value, setValue] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="lead">{publicView.prompt}</p>
        <div className="big">{publicView.trueAnswer}{publicView.unit ? ` ${publicView.unit}` : ""}</div>
        {publicView.blurb ? <p className="lead">{publicView.blurb}</p> : null}
        <div className="players">
          {(publicView.ranking ?? []).map((row) => (
            <div className="player" key={row.playerId}>
              <div className="meta">
                <strong>{nameOf(row.playerId)}</strong>
                <small>
                  palo {row.guess} · a {row.distance} de distancia
                </small>
              </div>
              <div className="score">+{row.points}</div>
            </div>
          ))}
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
