"use client";

import { useState } from "react";
import type { ImpostorPrivateView, ImpostorPublicView } from "@/shared/games/impostor/logic";

export function ImpostorView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
}: {
  publicView: ImpostorPublicView;
  privateView: ImpostorPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [word, setWord] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <h2>La palabra era {publicView.word}</h2>
        <p className="lead">
          Impostor{publicView.impostorIds && publicView.impostorIds.length > 1 ? "es" : ""}:{" "}
          {(publicView.impostorIds ?? []).map(nameOf).join(", ")}
        </p>
        {publicView.wordGuess ? (
          <p className="lead">
            {nameOf(publicView.wordGuess.by)} tiró “{publicView.wordGuess.text}” y{" "}
            {publicView.wordGuess.correct ? "la clavó." : "erró como penalty a lo alto."}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">Categoría: {publicView.category}. Hay {publicView.impostorCount} impostor(es).</p>
      <div className="secret">
        {privateView.role === "impostor" ? (
          <>
            <div className="prompt">Sos el impostor</div>
            <p>No sabés la palabra. Chamuyá, preguntá boludeces, sobreviví.</p>
          </>
        ) : (
          <>
            <div className="prompt">{privateView.word}</div>
            <p>Esta es la palabra. No se la des al aire como si fuera el DNI.</p>
          </>
        )}
      </div>

      {publicView.phase === "discuss" ? (
        <>
          <p className="lead">Hablen. El anfitrión manda a votar cuando se ponga denso.</p>
          {privateView.role === "impostor" ? (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                onAction("guess-word", { text: word });
                setWord("");
              }}
            >
              <label>
                ¿La pescaste? Tirala
                <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="asado, mate, quilombo…" />
              </label>
              <button className="btn btn-ghost" type="submit">
                Adivinar la palabra
              </button>
            </form>
          ) : null}
          {isHost ? (
            <button className="btn btn-primary" type="button" onClick={() => onAction("open-vote")}>
              Basta de verso, a votar
            </button>
          ) : null}
        </>
      ) : (
        <>
          <p className="lead">¿Quién es el chamuyero?</p>
          <div className="stack">
            {players
              .filter((p) => p.id !== youId)
              .map((p) => (
                <button key={p.id} className="btn btn-ghost" type="button" onClick={() => onAction("vote", { targetId: p.id })}>
                  {p.name}
                  {publicView.votedIds.includes(youId) ? " (ya votaste, podés cambiar)" : ""}
                </button>
              ))}
          </div>
          <p className="lead">Votos: {publicView.votedIds.length}/{players.length}</p>
          {isHost ? (
            <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
              Cerrar urna
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
