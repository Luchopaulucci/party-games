"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { readSession } from "@/lib/session";

function JoinForm() {
  const params = useSearchParams();
  const router = useRouter();
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
    const q = new URLSearchParams({ name: clean, code: room });
    const session = readSession(room);
    if (session) q.set("resume", "1");
    router.push(`/online/sala/${room}?${q.toString()}`);
  }

  return (
    <div className="stack">
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

export default function OnlinePage() {
  return (
    <Shell backHref="/" kicker="en línea">
      <Suspense fallback={<p className="lead">Cargando el living…</p>}>
        <JoinForm />
      </Suspense>
    </Shell>
  );
}
