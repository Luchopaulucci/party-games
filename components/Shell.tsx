"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmExit } from "@/components/ConfirmExit";

export function Shell({
  children,
  backHref = "/",
  kicker,
  onExit,
  exitBody,
}: {
  children: React.ReactNode;
  backHref?: string;
  kicker?: string;
  onExit?: () => void;
  exitBody?: string;
}) {
  const [ask, setAsk] = useState(false);
  return (
    <div className="shell">
      <div className="topbar">
        <Link href={backHref} className="brand">
          <b>La Previa</b>
          {kicker ? <span>{kicker}</span> : null}
        </Link>
        {onExit ? (
          <button className="btn btn-ghost btn-exit" type="button" data-testid="exit-button" onClick={() => setAsk(true)}>
            Salir
          </button>
        ) : null}
      </div>
      {children}
      <ConfirmExit
        open={ask}
        body={exitBody}
        onCancel={() => setAsk(false)}
        onConfirm={() => {
          setAsk(false);
          onExit?.();
        }}
      />
    </div>
  );
}
