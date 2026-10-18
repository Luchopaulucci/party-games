"use client";

import { useRef, useState } from "react";
import { RoundReveal } from "@/components/play/RoundReveal";
import type { ReflexPrivateView, ReflexPublicView } from "@/shared/games/reflex/logic";

export function ReflexView({
  publicView,
  privateView,
  players,
  onAction,
}: {
  publicView: ReflexPublicView;
  privateView: ReflexPrivateView;
  isHost: boolean;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  const startedAt = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "alguien";

  if (publicView.phase === "done") {
    const winner = publicView.winnerId ? nameOf(publicView.winnerId) : "nadie";
    return (
      <RoundReveal
        title="El objetivo"
        headline={`${publicView.target.toFixed(2)}s`}
        lines={[
          `Más cerca: ${winner}`,
          ...(publicView.results ?? []).map(
            (row) => `${nameOf(row.playerId)}: ${row.elapsed.toFixed(2)}s (a ${row.distance.toFixed(2)})`,
          ),
        ]}
      />
    );
  }

  function press() {
    if (privateView.myElapsed != null) return;
    if (!privateView.started && !running) {
      startedAt.current = performance.now();
      setRunning(true);
      onAction("start");
      return;
    }
    const start = startedAt.current ?? performance.now();
    const elapsed = (performance.now() - start) / 1000;
    setRunning(false);
    onAction("stop", { elapsed });
  }

  return (
    <div className="stack" style={{ minHeight: "52vh" }}>
      <p className="kicker kicker-single" data-testid="reflex-hint">
        Frená lo más cerca posible
      </p>
      <p className="big" data-testid="reflex-target">
        {publicView.target.toFixed(2)}s
      </p>
      <p className="lead">
        {privateView.myElapsed != null
          ? `Frenaste en ${privateView.myElapsed.toFixed(2)}s. Esperá al resto.`
          : running
            ? "Cuando te late, frená."
            : "Apretá abajo para arrancar. Apretá de nuevo para frenar."}
      </p>
      <button
        className="btn btn-primary"
        type="button"
        data-testid="reflex-button"
        disabled={privateView.myElapsed != null}
        onClick={press}
        style={{ marginTop: "auto", position: "sticky", bottom: 16 }}
      >
        {privateView.myElapsed != null ? "Listo" : running || privateView.started ? "Frená" : "Arrancá"}
      </button>
    </div>
  );
}
