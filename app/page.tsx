"use client";

import Link from "next/link";
import { GameCatalog } from "@/components/GameCatalog";
import { Shell } from "@/components/Shell";
import { deviceCopy, useDeviceKind } from "@/lib/device";

export default function HomePage() {
  const copy = deviceCopy(useDeviceKind());

  return (
    <Shell>
      <p className="kicker">{copy.kicker}</p>
      <h1>{copy.headline}</h1>
      <p className="lead">
        Juegos de previa para la juntada. Elegí uno, después decís si lo juegan pasándose el {copy.deviceWord} o
        cada uno desde el suyo.
      </p>
      <Link className="tile tile-hero" href="/online">
        <b>Tengo un código</b>
        <p>Si te mandaron un link o un código de 4 letras, entrá acá.</p>
      </Link>
      <h2 className="home-games-title">Los juegos</h2>
      <p className="lead">Scrolléá. Tocá el que les pinte. Son 15, no te hagas el difícil.</p>
      <GameCatalog />
      <p className="footer-note">Hecho para juntadas argentinas. Si gana tu cuñado, es problema tuyo.</p>
    </Shell>
  );
}
