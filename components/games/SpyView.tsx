"use client";

import { useState } from "react";
import type { SpyPrivateView, SpyPublicView } from "@/shared/games/spy/logic";

export function SpyView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
}: {
  publicView: SpyPublicView;
  privateView: SpyPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [guess, setGuess] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    return (
      <div className="stack">
        <h2>El lugar era {publicView.location}</h2>
        <p className="lead">
          Espía{publicView.spyIds && publicView.spyIds.length > 1 ? "s" : ""}:{" "}
          {(publicView.spyIds ?? []).map(nameOf).join(", ")}
        </p>
        {publicView.locationGuess ? (
          <p className="lead">
            {nameOf(publicView.locationGuess.by)} tiró “{publicView.locationGuess.text}” y{" "}
            {publicView.locationGuess.correct ? "la pescó." : "erró feo."}
          </p>
        ) : null}
        {publicView.totals?.length ? (
          <div className="players">
            {publicView.totals.map((row) => (
              <div className="player" key={row.playerId}>
                <strong>{nameOf(row.playerId)}</strong>
                <div className="score">{row.votes}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">Hay {publicView.spyCount} espía(s). Pregunten como si fuera una cena incómoda.</p>
      <div className="secret">
        {privateView.role === "espia" ? (
          <>
            <div className="prompt">Sos el espía</div>
            <p>No sabés el lugar. Chamuyá y sobreviví. Si lo pescás, tiralo.</p>
          </>
        ) : (
          <>
            <div className="prompt">{privateView.location}</div>
            <p>Tu oficio: {privateView.job}. No se lo des al aire.</p>
          </>
        )}
      </div>

      {publicView.phase === "discuss" ? (
        <>
          {privateView.role === "espia" ? (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                onAction("guess-location", { text: guess });
                setGuess("");
              }}
            >
              <label>
                ¿Cachaste el lugar?
                <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="asado, subte, kiosco…" />
              </label>
              <button className="btn btn-ghost" type="submit">
                Adivinar el lugar
              </button>
            </form>
          ) : null}
          {isHost ? (
            <button className="btn btn-primary" type="button" onClick={() => onAction("open-vote")}>
              Basta, a votar
            </button>
          ) : null}
        </>
      ) : (
        <>
          <p className="lead">¿Quién es el espía?</p>
          <div className="stack">
            {players
              .filter((p) => p.id !== youId)
              .map((p) => (
                <button key={p.id} className="btn btn-ghost" type="button" onClick={() => onAction("vote", { targetId: p.id })}>
                  {p.name}
                </button>
              ))}
          </div>
          <p className="lead">
            Votos: {publicView.votedIds.length}/{players.length}
          </p>
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
