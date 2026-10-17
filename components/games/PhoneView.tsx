"use client";

import { useState } from "react";
import type { PhonePrivateView, PhonePublicView } from "@/shared/games/phone/logic";

export function PhoneView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: PhonePublicView;
  privateView: PhonePrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [text, setText] = useState("");
  const current = players.find((p) => p.id === publicView.currentId)?.name ?? "Alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="prompt">Arrancó así</p>
        <p className="lead">{publicView.original}</p>
        {(publicView.chain ?? []).map((row, i) => (
          <p key={`${row.playerId}-${i}`} className="lead" style={{ margin: 0 }}>
            {players.find((p) => p.id === row.playerId)?.name}: <b>{row.text}</b>
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">Teléfono descompuesto</p>
      <p className="lead">
        {privateView.isWriter ? "Te toca. Reescribí lo que entendiste, no copies." : `Escribe ${current}. No mires.`}
      </p>
      {privateView.isWriter ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            onAction("write", { text });
            setText("");
          }}
        >
          <p className="card">{privateView.previous}</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={180} placeholder="Tu versión" />
          <button className="btn btn-primary" type="submit">
            Pasar al siguiente
          </button>
        </form>
      ) : null}
      <p className="lead">Ya escribieron {publicView.doneCount}</p>
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Mostrar la cadena
        </button>
      ) : null}
    </div>
  );
}
