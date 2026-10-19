"use client";

import Link from "next/link";
import { GameCatalog } from "@/components/GameCatalog";
import { HomeStickers } from "@/components/HomeStickers";
import { Shell } from "@/components/Shell";
import { deviceCopy, useDeviceKind } from "@/lib/device";

export default function HomePage() {
  const copy = deviceCopy(useDeviceKind());

  return (
    <Shell>
      <section className="home-hero">
        <HomeStickers />
        <p className="kicker">{copy.kicker}</p>
        <h1 className="home-wordmark">
          <span>LA</span>
          <span>PREVIA</span>
        </h1>
        <p className="lead">
          Juegos de previa para la juntada. Elegí uno, después decís si lo juegan pasándose el {copy.deviceWord} o
          cada uno desde el suyo.
        </p>
        <Link className="tile tile-hero" href="/online" data-testid="home-code-tile">
          <b>Tengo un código</b>
          <p>Si te mandaron un link o un código de 4 letras, entrá acá.</p>
        </Link>
      </section>
      <h2 className="home-games-title">Los juegos</h2>
      <GameCatalog />
      <p className="footer-note">Hecho para juntadas argentinas. Si gana tu cuñado, es problema tuyo.</p>
    </Shell>
  );
}
