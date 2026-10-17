"use client";

import { useState } from "react";
import type { WhoAmIPrivateView, WhoAmIPublicView } from "@/shared/games/whoami/logic";

export function WhoAmIView({
  publicView,
  privateView,
  players,
  onAction,
}: {
  publicView: WhoAmIPublicView;
  privateView: WhoAmIPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const [ask, setAsk] = useState("");
  const [guess, setGuess] = useState("");
  const target = players.find((p) => p.id === publicView.targetId)?.name ?? "el elegido";
  const open = publicView.questions.find((q) => q.answer === null);

  if (publicView.phase === "done") {
    return (
      <div className="stack">
        <h2>Era {publicView.character}</h2>
        <p className="lead">
          {publicView.winnerId
            ? `${target} la pegó. Un poco de respeto, por favor.`
            : `${target} no la vio ni en replay.`}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="lead">El personaje está pegado en la frente de {target}.</p>
      {privateView.isTarget ? (
        <div className="secret">
          <b>Sos el que no sabe.</b>
          <p>Preguntá sí o no. Después tirate un nombre y rezá.</p>
        </div>
      ) : (
        <div className="secret">
          <div className="prompt">{privateView.character}</div>
          <p className="lead">{privateView.hint}</p>
          <small>No se lo digas. Aunque te pague un fernet.</small>
        </div>
      )}

      <div className="stack">
        {publicView.questions.map((q) => (
          <div className="card" key={q.id}>
            <b>{q.text}</b>
            <p className="lead" style={{ margin: 0 }}>
              {q.answer ? { si: "Sí", no: "No", nose: "Ni idea, che" }[q.answer] : "Todavía no contestan. Típico."}
            </p>
          </div>
        ))}
      </div>

      {privateView.isTarget ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (open) return;
            onAction("ask", { text: ask });
            setAsk("");
          }}
        >
          <label>
            Pregunta sí/no
            <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="¿Soy vivo…?" disabled={Boolean(open)} />
          </label>
          <button className="btn btn-ghost" type="submit" disabled={Boolean(open)}>
            Preguntar
          </button>
        </form>
      ) : open ? (
        <div className="grid-2">
          <button className="btn btn-lime" type="button" onClick={() => onAction("answer", { questionId: open.id, value: "si" })}>
            Sí
          </button>
          <button className="btn btn-primary" type="button" onClick={() => onAction("answer", { questionId: open.id, value: "no" })}>
            No
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => onAction("answer", { questionId: open.id, value: "nose" })}>
            Ni idea
          </button>
        </div>
      ) : null}

      {privateView.isTarget ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            onAction("guess", { text: guess });
            setGuess("");
          }}
        >
          <label>
            Me juego a que soy… ({publicView.guesses.length}/{publicView.maxGuesses})
            <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Messi, Moria, el Coco…" />
          </label>
          <button className="btn btn-gold" type="submit">
            Adivinar
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => onAction("give-up")}>
            Me rindo, era obvio
          </button>
        </form>
      ) : null}
    </div>
  );
}
