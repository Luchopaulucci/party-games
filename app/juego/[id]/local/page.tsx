"use client";

import { useParams, useRouter } from "next/navigation";
import { LocalMatchApp } from "@/components/local/LocalMatchApp";
import { Shell } from "@/components/Shell";
import { parseGameId, supportsMode } from "@/shared/games/browse";
import { getGameMeta } from "@/shared/games/registry";

export default function LocalGamePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const gameId = parseGameId(params.id);
  const meta = gameId ? getGameMeta(gameId) : undefined;

  if (!gameId || !meta || !supportsMode(gameId, "local")) {
    return (
      <Shell backHref="/">
        <h1>Este no se juega así</h1>
        <p className="lead">Volvé y elegí el modo que le cabe.</p>
      </Shell>
    );
  }

  return (
    <Shell
      backHref={`/juego/${gameId}`}
      kicker="Pasando el celu"
      exitBody="Volvés al lobby de este juego. La partida anterior se borra."
      onExit={() => {
        window.dispatchEvent(new Event("previa:local-exit"));
        router.replace(`/juego/${gameId}/local`);
      }}
    >
      <LocalMatchApp gameId={gameId} />
    </Shell>
  );
}
