"use client";

import { useState } from "react";
import { playerColor } from "@/components/PlayerList";
import type { SpyPrivateView, SpyPublicView } from "@/shared/games/spy/logic";

export function SpyView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  local,
  onAction,
}: {
  publicView: SpyPublicView;
  privateView: SpyPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string; color?: string }[];
  local?: boolean;
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
            {publicView.totals.map((row, i) => {
              const player = players.find((p) => p.id === row.playerId);
              return (
                <div className="player" key={row.playerId}>
                  <span className="swatch" style={{ background: playerColor(player ?? { id: row.playerId }, i) }} />
                  <strong style={{ flex: 1 }}>{nameOf(row.playerId)}</strong>
                  <div className="score">{row.votes}</div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">
        Hay un escenario secreto y {publicView.spyCount} espía{publicView.spyCount === 1 ? "" : "s"}. Cada civil tiene un
        rol y lo actúa con mímica. El espía no sabe el lugar: inventá y no te mandes al frente.
      </p>
      <div className="secret">
        {privateView.role === "espia" ? (
          <>
            <p className="kicker">Tu rol</p>
            <div className="prompt">Sos el espía</div>
            <p>No ves el escenario. Actuá un oficio con mímica y pescá el lugar. El resto no ve tu rol.</p>
          </>
        ) : (
          <>
            <p className="kicker">Escenario</p>
            <div className="prompt">{privateView.location}</div>
            <p className="kicker">Tu rol (se actúa con mímica)</p>
            <p className="prompt" style={{ fontSize: "1.7rem" }}>
              {privateView.job}
            </p>
            <p>Hacé mímica de ese rol. Pregunten para pescar al que no está en el lugar.</p>
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
          {local ? null : (
            <p className="lead">
              Votos: {publicView.votedIds.length}/{players.length}
            </p>
          )}
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
