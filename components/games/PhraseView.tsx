"use client";

import { useState } from "react";
import type { PhrasePrivateView, PhrasePublicView } from "@/shared/games/phrase/logic";

export function PhraseView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: PhrasePublicView;
  privateView: PhrasePrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [text, setText] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        {(publicView.answers ?? []).map((a) => {
          const votes = publicView.totals?.find((t) => t.id === a.id)?.count ?? 0;
          return (
            <div className="player" key={a.id}>
              <div className="meta" style={{ flex: 1 }}>
                <strong>{a.text}</strong>
                <small>{a.playerId ? nameOf(a.playerId) : ""}</small>
              </div>
              <div className="score">{votes}</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (publicView.phase === "vote") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">Votá el más gracioso. No el más sano.</p>
        {(publicView.answers ?? []).map((a) => (
          <button
            key={a.id}
            className="btn btn-ghost"
            type="button"
            onClick={() => onAction("vote", { answerId: a.id })}
          >
            {a.text}
            {privateView.myVote === a.id ? " · tu voto" : ""}
          </button>
        ))}
        {isHost ? (
          <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
            Cerrar votos
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
      {privateView.myAnswer ? (
        <div className="notice">Mandaste “{privateView.myAnswer}”. A esperar el festival.</div>
      ) : (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            onAction("write", { text });
            setText("");
          }}
        >
          <label>
            Completá
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="El cierre más sucio que se te ocurra" />
          </label>
          <button className="btn btn-primary" type="submit">
            Mandar
          </button>
        </form>
      )}
    </div>
  );
}
