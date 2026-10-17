"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RoomClient } from "@/components/online/RoomClient";
import { Shell } from "@/components/Shell";
import { readSession } from "@/lib/session";

function RoomInner() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const rawCode = params.code === "nueva" ? undefined : params.code.toUpperCase();
  const name = search.get("name") ?? readSession(rawCode ?? "")?.name ?? "Invitado";
  const token = rawCode ? readSession(rawCode)?.token : undefined;

  return <RoomClient code={rawCode} name={name} token={token} />;
}

export default function SalaPage() {
  return (
    <Shell backHref="/online" kicker="sala">
      <Suspense fallback={<p className="lead">Acomodando las sillas…</p>}>
        <RoomInner />
      </Suspense>
    </Shell>
  );
}
