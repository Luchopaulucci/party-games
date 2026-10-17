"use client";

import { useState } from "react";
import type { WavePrivateView, WavePublicView } from "@/shared/games/wave/logic";

export function WaveView({
  publicView,
  privateView,
  isHost,
  players,
  onAction,
}: {
  publicView: WavePublicView;
  privateView: WavePrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [clue, setClue] = useState("");
  const [guess, setGuess] = useState(50);
  const psychic = players.find((p) => p.id === publicView.psychicId)?.name ?? "el psíquico";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <p className="kicker">{publicView.left} → {publicView.right}</p>
        <p className="lead">La pista era “{publicView.clue}”.</p>
        <div className="big">{publicView.target}</div>
        {Object.entries(publicView.guesses ?? {}).map(([id, value]) => (
          <div className="player" key={id}>
            <strong>{players.find((p) => p.id === id)?.name}</strong>
            <div className="score">{value}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="kicker">{publicView.left} → {publicView.right}</p>
      <p className="lead">Psíquico: {psychic}. Estilo Wavelength: una pista, el resto adivina el 0–100.</p>
      {privateView.isPsychic && publicView.phase === "clue" ? (
        <>
          <div className="secret">
            <div className="prompt">{privateView.target}</div>
            <small>Solo vos ves el número. No lo grites.</small>
          </div>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              onAction("clue", { text: clue });
            }}
          >
            <label>
              Tu pista
              <input value={clue} onChange={(e) => setClue(e.target.value)} placeholder="Una palabra, no un ensayo" />
            </label>
            <button className="btn btn-primary" type="submit">
              Mandar pista
            </button>
          </form>
        </>
      ) : null}
      {!privateView.isPsychic && publicView.phase === "clue" ? (
        <p className="lead">{psychic} está pensando la pista. No mires su celu.</p>
      ) : null}
      {publicView.phase === "guess" ? (
        <>
          <p className="prompt">“{publicView.clue}”</p>
          {privateView.isPsychic ? (
            <p className="lead">Esperá que adivinen. No hagas caras.</p>
          ) : privateView.myGuess == null ? (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                onAction("guess", { value: guess });
              }}
            >
              <label>
                ¿Dónde cae? {guess}
                <input type="range" min={0} max={100} value={guess} onChange={(e) => setGuess(Number(e.target.value))} />
              </label>
              <button className="btn btn-gold" type="submit">
                Fijar
              </button>
            </form>
          ) : (
            <div className="notice">Mandaste {privateView.myGuess}.</div>
          )}
        </>
      ) : null}
      {isHost && publicView.phase !== "clue" ? (
        <button className="btn btn-ghost" type="button" onClick={() => onAction("reveal")}>
          Revelar
        </button>
      ) : null}
    </div>
  );
}
