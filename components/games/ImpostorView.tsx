"use client";

import { PlayClock } from "@/components/play/PlayClock";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { ClockPreset } from "@/shared/play/clock";
import type { ImpostorPrivateView, ImpostorPublicView } from "@/shared/games/impostor/logic";

export function ImpostorView({
  publicView,
  privateView,
  isHost,
  youId,
  players,
  local,
  onAction,
}: {
  publicView: ImpostorPublicView;
  privateView: ImpostorPrivateView;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  local?: boolean;
  onAction: (type: string, payload?: unknown) => void;
}) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "reveal") {
    const impostors = (publicView.impostorIds ?? []).map(nameOf);
    const accused = publicView.accusedId ? nameOf(publicView.accusedId) : null;
    const caught = publicView.accusedId
      ? (publicView.impostorIds ?? []).includes(publicView.accusedId)
      : false;
    return (
      <RoundReveal
        title="Se reveló"
        headline={`La palabra era ${publicView.word}`}
        lines={[
          `Impostor${impostors.length > 1 ? "es" : ""}: ${impostors.join(", ")}`,
          accused ? `Acusaron a ${accused}. ${caught ? "Era." : "No era."}` : "Nadie acusó con nombre. Quedó en el aire.",
        ]}
      />
    );
  }

  if (publicView.phase === "role") {
    return (
      <div className="stack">
        <p className="lead">
          Categoría: {publicView.category}. Hay {publicView.impostorCount} impostor
          {publicView.impostorCount === 1 ? "" : "es"}. Mirá solo tu rol.
        </p>
        <div className="secret">
          {privateView.isImpostor ? (
            <>
              <div className="prompt">Sos impostor</div>
              <p>No sabés la palabra. Chamuyá y sobreviví. El resto no ve esto.</p>
            </>
          ) : (
            <>
              <div className="prompt">No sos impostor</div>
              <p className="lead" style={{ margin: 0 }}>
                La palabra: <b>{privateView.word}</b>
              </p>
              <p>Charlá sin soltarla. El resto no ve tu rol.</p>
            </>
          )}
        </div>
        {isHost ? (
          <PlayClock
            seconds={publicView.discussSec}
            onChange={(next: ClockPreset) => onAction("set-clock", { seconds: next })}
          />
        ) : (
          <p className="lead">
            Reloj al final: {publicView.discussSec ? `${publicView.discussSec}s` : "sin reloj"}.
          </p>
        )}
        {privateView.ready ? (
          <div className="notice">Ya diste OK. Esperá al resto.</div>
        ) : (
          <button className="btn btn-primary" type="button" onClick={() => onAction("ready")}>
            OK, ya vi
          </button>
        )}
        <p className="lead">
          Listos: {publicView.readyIds.length}/{players.length}
        </p>
      </div>
    );
  }

  if (publicView.phase === "discuss") {
    return (
      <div className="stack">
        <p className="lead">Hablen. Cuando corte el reloj, {local ? "señalen y toquen a quién acusan." : "votan en el celu."}</p>
        <PlayClock
          seconds={publicView.discussSec}
          running
          onTimeout={() => onAction(local ? "reveal" : "timeout")}
        />
        {local ? (
          <>
            <p className="lead">¿A quién señalaron?</p>
            {players
              .filter((p) => p.id !== youId)
              .map((p) => (
                <button
                  key={p.id}
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => onAction("accuse", { targetId: p.id })}
                >
                  {p.name}
                </button>
              ))}
          </>
        ) : isHost ? (
          <button className="btn btn-primary" type="button" onClick={() => onAction("open-vote")}>
            Basta de verso, a votar
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">¿Quién es el chamuyero?</p>
      {players
        .filter((p) => p.id !== youId)
        .map((p) => (
          <button key={p.id} className="btn btn-ghost" type="button" onClick={() => onAction("vote", { targetId: p.id })}>
            {p.name}
          </button>
        ))}
      <p className="lead">
        Votos: {publicView.votedIds.length}/{players.length}
        {publicView.votedIds.includes(youId) ? " · ya votaste" : ""}
      </p>
      {isHost ? (
        <button className="btn btn-gold" type="button" onClick={() => onAction("reveal")}>
          Cerrar urna
        </button>
      ) : null}
    </div>
  );
}
