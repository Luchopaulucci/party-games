"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { HowToPlay } from "@/components/HowToPlay";
import { OnlineUnavailable } from "@/components/online/OnlineUnavailable";
import { Shell } from "@/components/Shell";
import { useOnlineAccess } from "@/lib/online-access";
import { roomPagePath } from "@/lib/room-url";
import { parseGameId, supportsMode } from "@/shared/games/browse";
import { getGameMeta } from "@/shared/games/registry";
import { titleClass } from "@/shared/ui/stickers";

export default function JuegoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const gameId = parseGameId(params.id);
  const meta = gameId ? getGameMeta(gameId) : undefined;
  const [name, setName] = useState("");
  const access = useOnlineAccess();

  if (!gameId || !meta) {
    return (
      <Shell backHref="/">
        <h1>Ese juego no está</h1>
        <p className="lead">Volvé al living y elegí uno de la lista.</p>
      </Shell>
    );
  }

  const local = supportsMode(gameId, "local");
  const online = supportsMode(gameId, "online");

  function goOnline() {
    const clean = name.trim();
    if (clean.length < 2) return;
    router.push(roomPagePath({ name: clean, game: gameId }));
  }

  return (
    <Shell backHref="/" kicker={meta.name} gameId={gameId}>
      <p className="pill">
        {meta.emoji} {meta.name}
      </p>
      <h1 className={titleClass(meta.name)}>{meta.name}</h1>
      <p className="lead">{meta.tagline}</p>
      <div className="stack">
      <HowToPlay text={meta.howTo} />
      <div className="stack home-modes" data-testid="home-modes">
        {local ? (
          <Link className="tile tile-hero" href={`/juego/${gameId}/local`}>
            <b>Pasando el celu</b>
            <p>Un solo aparato. Armás los jugadores y los extras de este juego.</p>
          </Link>
        ) : (
          <div className="tile soon">
            <b>Pasando el celu</b>
            <p>Este se juega solo en red. Cada uno en su teléfono.</p>
          </div>
        )}
        {online ? (
          <div className="tile tile-hero" style={{ display: "grid", gap: 10 }}>
            <b>En red</b>
            {access.ok ? (
              <>
                <p>Primero se crea la sala (código, link y QR). Después los ajustes y arranca.</p>
                <label>
                  ¿Cómo te llamás?
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre de previa"
                    maxLength={18}
                  />
                </label>
                <button className="btn btn-primary" type="button" disabled={name.trim().length < 2} onClick={goOnline}>
                  Crear sala
                </button>
              </>
            ) : (
              <OnlineUnavailable message={access.message} />
            )}
          </div>
        ) : (
          <div className="tile soon">
            <b>En red</b>
            <p>Este se juega solo pasándose el celu.</p>
          </div>
        )}
      </div>
      </div>
    </Shell>
  );
}
