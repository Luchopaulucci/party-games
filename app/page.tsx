"use client";

import Link from "next/link";
import { GameCatalog } from "@/components/GameCatalog";
import { HeadingPair } from "@/components/HeadingPair";
import { Shell } from "@/components/Shell";
import { deviceCopy, useDeviceKind } from "@/lib/device";

export default function HomePage() {
  const copy = deviceCopy(useDeviceKind());

  return (
    <Shell>
      <p className="kicker">{copy.kicker}</p>
      <div className="deco-sunset" aria-hidden />
      <HeadingPair left={copy.headline.split(" ")[0] ?? "Juegos"} right={copy.headline.split(" ").slice(1).join(" ")} />
      <p className="lead">
        Juegos de previa para la juntada. Elegí uno, después decís si lo juegan pasándose el {copy.deviceWord} o
        cada uno desde el suyo.
      </p>
      <div className="stack" data-testid="home-hero-stack">
        <Link className="tile tile-hero" href="/online" data-testid="home-code-tile">
          <b>Tengo un código</b>
          <p>Si te mandaron un link o un código de 4 letras, entrá acá.</p>
        </Link>
        <h2 className="home-games-title">Los juegos</h2>
        <p className="lead">Scrolléá. Tocá el que les pinte. Son 15, no te hagas el difícil.</p>
        <GameCatalog />
        <p className="footer-note">Hecho para juntadas argentinas. Si gana tu cuñado, es problema tuyo.</p>
      </div>
    </Shell>
  );
}
