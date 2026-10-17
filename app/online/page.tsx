"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Shell } from "@/components/Shell";
import { readSession } from "@/lib/session";

function OnlineForm() {
  const params = useSearchParams();
  const router = useRouter();
  const preset = (params.get("code") ?? "").toUpperCase();
  const existing = preset ? readSession(preset) : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [code, setCode] = useState(preset);

  function go(intent: "create" | "join") {
    const clean = name.trim();
    if (clean.length < 2) return;
    const q = new URLSearchParams({ name: clean });
    if (intent === "join") {
      if (code.trim().length < 4) return;
      q.set("code", code.trim().toUpperCase());
    }
    const session = readSession((q.get("code") ?? "").toUpperCase());
    if (session) q.set("resume", "1");
    router.push(`/online/sala/${q.get("code") ?? "nueva"}?${q.toString()}`);
  }

  return (
    <div className="stack">
      <h1>Sala en línea</h1>
      <p className="lead">
        Creá un living digital o metete con el código. Si recargás, te devolvemos el asiento y los
        puntos. No te hagas el misterioso.
      </p>
      <div className="card stack">
        <label>
          ¿Cómo te llamás?
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre de previa" maxLength={18} />
        </label>
        <button className="btn btn-primary" type="button" onClick={() => go("create")}>
          Creá una sala
        </button>
        <label>
          O entrá con código
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX"
            maxLength={6}
          />
        </label>
        <button className="btn btn-gold" type="button" onClick={() => go("join")}>
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
        <OnlineForm />
      </Suspense>
    </Shell>
  );
}
