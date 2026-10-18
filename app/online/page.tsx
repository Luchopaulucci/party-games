"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OnlineUnavailable } from "@/components/online/OnlineUnavailable";
import { Shell } from "@/components/Shell";
import { useOnlineAccess } from "@/lib/online-access";
import { roomPagePath } from "@/lib/room-url";
import { readSession } from "@/lib/session";

function JoinForm() {
  const params = useSearchParams();
  const router = useRouter();
  const access = useOnlineAccess();
  const preset = (params.get("code") ?? "").toUpperCase();
  const [name, setName] = useState("");
  const [code, setCode] = useState(preset);

  useEffect(() => {
    if (!preset) return;
    setCode(preset);
    const existing = readSession(preset);
    if (existing?.name) setName(existing.name);
  }, [preset]);

  function goJoin() {
    const clean = name.trim();
    if (clean.length < 2) return;
    if (code.trim().length < 4) return;
    const room = code.trim().toUpperCase();
    const session = readSession(room);
    router.push(roomPagePath({ code: room, name: clean, resume: Boolean(session) }));
  }

  return (
    <div className="stack">
      <h1>Entrá a la sala</h1>
      <p className="lead">Nombre + código. El juego ya lo eligió el anfitrión.</p>
      {access.ok ? null : <OnlineUnavailable message={access.message} />}
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
          disabled={!access.ok || name.trim().length < 2 || code.trim().length < 4}
        >
          Entrá a la sala
        </button>
      </div>
    </div>
  );
}

export default function OnlinePage() {
  return (
    <Shell backHref="/" kicker="en línea">
      <Suspense fallback={<p className="lead">Cargando el living…</p>}>
        <JoinForm />
      </Suspense>
    </Shell>
  );
}
