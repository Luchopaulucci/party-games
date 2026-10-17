"use client";

import { useState } from "react";
import type { EmojiPrivateView, EmojiPublicView } from "@/shared/games/emoji/logic";

export function EmojiView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: EmojiPublicView;
  privateView: EmojiPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [text, setText] = useState("");

  if (publicView.phase === "reveal") {
    const winner = players.find((p) => p.id === publicView.winnerId)?.name;
    return (
      <div className="stack">
        <p className="prompt" style={{ fontSize: "2.4rem" }}>{publicView.puzzle}</p>
        <p className="lead">Era {publicView.answer}.{winner ? ` La clavó ${winner}.` : " Nadie la vio."}</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt" style={{ fontSize: "2.4rem" }}>{publicView.puzzle}</p>
      {publicView.hint ? <p className="lead">Pista: {publicView.hint}</p> : null}
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          onAction("guess", { text });
          setText("");
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="¿Qué es?" />
        <button className="btn btn-primary" type="submit">
          Adivinar
        </button>
      </form>
      {privateView.myGuesses.length ? <p className="lead">Ya tiraste: {privateView.myGuesses.join(", ")}</p> : null}
      <p className="lead">Intentos: {publicView.guessCount}</p>
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Rendirse
        </button>
      ) : null}
    </div>
  );
}
