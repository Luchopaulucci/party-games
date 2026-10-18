"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { GamePicker } from "@/components/GamePicker";
import { Shell } from "@/components/Shell";
import { readSession } from "@/lib/session";
import { getGameMeta } from "@/shared/games/registry";
import type { GameId } from "@/shared/types";

type Mode = "menu" | "create-game" | "create-name" | "join";

function OnlineForm() {
  const params = useSearchParams();
  const router = useRouter();
  const preset = (params.get("code") ?? "").toUpperCase();
  const [mode, setMode] = useState<Mode>(preset ? "join" : "menu");
  const [name, setName] = useState("");
  const [code, setCode] = useState(preset);
  const [gameId, setGameId] = useState<GameId | null>(null);

  useEffect(() => {
    if (!preset) return;
    setMode("join");
    setCode(preset);
    const existing = readSession(preset);
    if (existing?.name) setName(existing.name);
  }, [preset]);

  const meta = gameId ? getGameMeta(gameId) : null;

  function goCreate() {
    const clean = name.trim();
    if (clean.length < 2 || !gameId) return;
    const q = new URLSearchParams({ name: clean, game: gameId });
    router.push(`/online/sala/nueva?${q.toString()}`);
  }

  function goJoin() {
    const clean = name.trim();
    if (clean.length < 2) return;
    if (code.trim().length < 4) return;
    const room = code.trim().toUpperCase();
    const q = new URLSearchParams({ name: clean, code: room });
    const session = readSession(room);
    if (session) q.set("resume", "1");
    router.push(`/online/sala/${room}?${q.toString()}`);
  }

  if (mode === "create-game") {
    return (
      <div className="stack">
        <button className="btn btn-ghost" type="button" onClick={() => setMode("menu")}>
          ← Volver
        </button>
        <h1>Elegí el juego</h1>
        <p className="lead">Primero el juego. Después armás la sala con sus extras.</p>
        <GamePicker
          implementedOnly
          onPick={(id) => {
            setGameId(id);
            setMode("create-name");
          }}
        />
      </div>
    );
  }

  if (mode === "create-name" && meta && gameId) {
    return (
      <div className="stack">
        <button className="btn btn-ghost" type="button" onClick={() => setMode("create-game")}>
          ← Cambiar juego
        </button>
        <p className="pill">
          {meta.emoji} {meta.name}
        </p>
        <h1>Creá la sala</h1>
        <p className="lead">Poné tu nombre y listo. Los extras del juego se configuran adentro.</p>
        <div className="card stack">
          <label>
            ¿Cómo te llamás?
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre de previa"
              maxLength={18}
            />
          </label>
          <button className="btn btn-primary" type="button" onClick={goCreate} disabled={name.trim().length < 2}>
            Creá la sala
          </button>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="stack">
        {!preset ? (
          <button className="btn btn-ghost" type="button" onClick={() => setMode("menu")}>
            ← Volver
          </button>
        ) : null}
        <h1>Entrá a la sala</h1>
        <p className="lead">Nombre + código. El juego ya lo eligió el anfitrión.</p>
        <div className="card stack">
          <label>
            ¿Cómo te llamás?
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre de previa"
              maxLength={18}
            />
          </label>
          <label>
            Código
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX"
              maxLength={6}
            />
          </label>
          <button
            className="btn btn-gold"
            type="button"
            onClick={goJoin}
            disabled={name.trim().length < 2 || code.trim().length < 4}
          >
            Entrá a la sala
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Sala en línea</h1>
      <p className="lead">Creá una sala eligiendo el juego, o metete con el código.</p>
      <div className="stack home-modes">
        <button className="tile tile-hero" type="button" onClick={() => setMode("create-game")}>
          <b>Creá una sala</b>
          <p>Primero elegís el juego. Después compartís el código.</p>
        </button>
        <button className="tile" type="button" onClick={() => setMode("join")}>
          <b>Entrá a la sala</b>
          <p>Si te pasaron un código, entrá acá.</p>
        </button>
      </div>
    </div>
  );
}

export default function OnlinePage() {
  return (
    <Shell backHref="/" kicker="en línea">
      <Suspense fallback={<p className="lead">Cargando el living…</p>}>
        <OnlineForm />
      </Suspense>
    </Shell>
  );
}
