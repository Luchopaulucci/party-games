"use client";

import Link from "next/link";
import { Shell } from "@/components/Shell";
import { deviceCopy, useDeviceKind } from "@/lib/device";

export default function HomePage() {
  const copy = deviceCopy(useDeviceKind());

  return (
    <Shell>
      <p className="kicker">{copy.kicker}</p>
      <h1 style={{ marginTop: 10 }}>{copy.headline}</h1>
      <p className="lead">Online o compartiendo el dispositivo. Cortito y al pie.</p>
      <div className="stack home-modes">
        <Link className="tile tile-hero" href="/online">
          <b>En línea</b>
          <p>Creá una sala y jugá cada uno desde su teléfono.</p>
        </Link>
        <Link className="tile" href="/local">
          <b>Compartiendo el dispositivo</b>
          <p>Pasate el {copy.deviceWord}. Un solo aparato, sin internet.</p>
        </Link>
      </div>
      <p className="footer-note">Hecho para juntadas argentinas. Si gana tu cuñado, es problema tuyo.</p>
    </Shell>
  );
}
