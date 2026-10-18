"use client";

import { useState } from "react";
import { RandomReader } from "@/components/play/RandomReader";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { PhrasePrivateView, PhrasePublicView } from "@/shared/games/phrase/logic";

export function PhraseView({
  publicView,
  privateView,
  players,
  local,
  onAction,
}: {
  publicView: PhrasePublicView;
  privateView: PhrasePrivateView;
  isHost: boolean;
  players: { id: string; name: string; color?: string }[];
  local?: boolean;
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [text, setText] = useState("");
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";
  const reader = players.find((p) => p.id === publicView.readerId);

  if (publicView.phase === "reveal") {
    const best = [...(publicView.totals ?? [])].sort((a, b) => b.count - a.count)[0];
    const winner = publicView.answers?.find((a) => a.id === best?.id);
    return (
      <RoundReveal
        title="La mejor"
        headline={winner?.text ?? publicView.prompt}
        lines={[
          winner?.playerId ? `De ${nameOf(winner.playerId)}` : "",
          ...(publicView.answers ?? []).map((a) => {
            const votes = publicView.totals?.find((t) => t.id === a.id)?.count ?? 0;
            return `${a.text} — ${a.playerId ? nameOf(a.playerId) : "?"} (${votes})`;
          }),
        ].filter(Boolean)}
      />
    );
  }

  if (publicView.phase === "present") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        {!local && reader ? (
          <RandomReader name={reader.name} color={reader.color} prompt="Lee las respuestas en voz alta" />
        ) : (
          <p className="lead">Salen de a una. Cuando terminen, eligen la mejor entre todos.</p>
        )}
        <div className="card stack">
          <p className="kicker">
            Respuesta {(publicView.showIndex ?? 0) + 1}/{publicView.showTotal ?? 0}
          </p>
          <p className="prompt" style={{ fontSize: "1.8rem" }}>
            {publicView.currentAnswer?.text}
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => onAction("next")}>
          {(publicView.showIndex ?? 0) + 1 >= (publicView.showTotal ?? 0) ? "A votar la mejor" : "Siguiente"}
        </button>
      </div>
    );
  }

  if (publicView.phase === "vote") {
    return (
      <div className="stack">
        <p className="prompt">{publicView.prompt}</p>
        <p className="lead">Votá la más graciosa. El último voto revela.</p>
        {(publicView.answers ?? []).map((a) => (
          <button
            key={a.id}
            className="btn btn-ghost"
            type="button"
            disabled={privateView.myVote != null}
            onClick={() => onAction("vote", { answerId: a.id })}
          >
            {a.text}
            {privateView.myVote === a.id ? " · tu voto" : ""}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="prompt">{publicView.prompt}</p>
      {privateView.myAnswer ? (
        <div className="notice">Mandaste “{privateView.myAnswer}”. Pasá el celu o esperá al resto.</div>
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
            {local ? "Mandar y pasar" : "Mandar"}
          </button>
        </form>
      )}
      <p className="lead">
        Escribieron: {publicView.submittedIds.length}/{players.length}
      </p>
    </div>
  );
}
