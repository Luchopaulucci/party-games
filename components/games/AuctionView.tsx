"use client";

import { useState } from "react";
import { playerColor } from "@/components/PlayerList";
import type { AuctionPrivateView, AuctionPublicView } from "@/shared/games/auction/logic";

export function AuctionView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: AuctionPublicView;
  privateView: AuctionPrivateView;
  isHost: boolean;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [value, setValue] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="kicker">El valor real</p>
        <p className="lead">{publicView.prompt}</p>
        <div className="big">
          {publicView.target}
          {publicView.unit ? ` ${publicView.unit}` : ""}
        </div>
        <div className="players">
          {(publicView.ranking ?? []).map((row, i) => (
            <div className="player" key={row.playerId}>
              <span className="swatch" style={{ background: playerColor(players.find((p) => p.id === row.playerId) ?? { id: row.playerId }, i) }} />
              <div className="meta" style={{ flex: 1 }}>
                <strong>{nameOf(row.playerId)}</strong>
                <small>
                  puja {row.bid}
                  {row.over ? " · se pasó" : ""}
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
      <p className="kicker">{publicView.mode === "cerca" ? "Más cerca" : "Sin pasarse"}</p>
      <p className="prompt">{publicView.prompt}</p>
      {privateView.bid == null ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(value.replace(",", "."));
            if (!Number.isFinite(n)) return;
            onAction("bid", { value: n });
          }}
        >
          <label>
            Tu puja (nadie la ve)
            <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ofertá" />
          </label>
          <button className="btn btn-primary" type="submit">
            Pujar
          </button>
        </form>
      ) : (
        <div className="notice">Ya pujaste {privateView.bid}. Esperá que cierren las ofertas.</div>
      )}
      <p className="lead">Pujaron: {publicView.submittedIds.map(nameOf).join(", ") || "nadie todavía"}</p>
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Cerrar subasta
        </button>
      ) : null}
    </div>
  );
}
