"use client";

import { useState } from "react";
import type { TabooPrivateView, TabooPublicView } from "@/shared/games/taboo/logic";

export function TabooView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: TabooPublicView;
  privateView: TabooPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [guess, setGuess] = useState("");
  const speaker = players.find((p) => p.id === publicView.speakerId)?.name ?? "alguien";

  if (publicView.phase === "done") {
    return (
      <div className="stack">
        <p className="lead">
          Era {publicView.word}. Prohibidas: {(publicView.forbidden ?? []).join(", ")}.
        </p>
        <p className="lead">
          {publicView.buzzed
            ? `${players.find((p) => p.id === publicView.winnerId)?.name} pescó una prohibida.`
            : publicView.winnerId
              ? `La clavó ${players.find((p) => p.id === publicView.winnerId)?.name}.`
              : "Se venció el tiempo. Qué silencio raro."}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">{speaker} describe sin decir las {publicView.forbiddenCount} palabras prohibidas.</p>
      {privateView.isSpeaker ? (
        <div className="secret">
          <div className="prompt">{privateView.word}</div>
          <p>No digas: {(privateView.forbidden ?? []).join(", ")}</p>
        </div>
      ) : (
        <>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              onAction("guess", { text: guess });
              setGuess("");
            }}
          >
            <label>
              Adiviná
              <input value={guess} onChange={(e) => setGuess(e.target.value)} />
            </label>
            <button className="btn btn-gold" type="submit">
              Esa es
            </button>
          </form>
          <button className="btn btn-primary" type="button" onClick={() => onAction("buzz")}>
            Dijo una prohibida
          </button>
        </>
      )}
      {isHost ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("give-up")}>
          Se acabó
        </button>
      ) : null}
    </div>
  );
}
