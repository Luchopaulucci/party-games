"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";
import { OnlineUnavailable } from "@/components/online/OnlineUnavailable";
import { RoomClient } from "@/components/online/RoomClient";
import { Shell } from "@/components/Shell";
import { useOnlineAccess } from "@/lib/online-access";
import { parseRoomCode } from "@/lib/room-url";
import { clearSession, readSession } from "@/lib/session";
import { parseGameId } from "@/shared/games/browse";

function RoomInner() {
  const search = useSearchParams();
  const router = useRouter();
  const leaveRef = useRef<null | (() => void)>(null);
  const access = useOnlineAccess();
  const rawCode = parseRoomCode(search.get("code"));
  const nameFromQuery = search.get("name")?.trim();
  const stored = rawCode ? readSession(rawCode) : null;
  const name = nameFromQuery || stored?.name || "Invitado";
  const token = stored?.token;
  const preferredGame = parseGameId(search.get("game"));

  return (
    <Shell
      backHref="/"
      kicker="sala"
      exitBody={
        rawCode
          ? "Si sos el anfitrión, se cae la sala para todos. Si no, salís vos nomas."
          : "Se corta la sala."
      }
      onExit={() => {
        if (rawCode) clearSession(rawCode);
        leaveRef.current?.();
        router.replace("/");
      }}
    >
      {access.ok ? (
        <RoomClient
          code={rawCode}
          name={name}
          token={token}
          preferredGame={preferredGame}
          registerLeave={(fn) => {
            leaveRef.current = fn;
          }}
          onRoomClosed={() => {
            if (rawCode) clearSession(rawCode);
            router.replace("/");
          }}
        />
      ) : (
        <OnlineUnavailable message={access.message} />
      )}
    </Shell>
  );
}

export default function SalaPage() {
  return (
    <Suspense fallback={<p className="lead">Acomodando las sillas…</p>}>
      <RoomInner />
    </Suspense>
  );
}
