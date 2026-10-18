"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConfirmExit } from "@/components/ConfirmExit";
import { brandUsesConfirm, shouldGuardNavigation } from "@/lib/exit-guard";

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
  const leaving = useRef(false);
  const confirmExit = brandUsesConfirm(onExit);

  useEffect(() => {
    if (!shouldGuardNavigation(onExit)) return;

    const onPop = () => {
      if (leaving.current) return;
      history.pushState({ previaGuard: true }, "");
      setAsk(true);
    };
    history.pushState({ previaGuard: true }, "");
    window.addEventListener("popstate", onPop);

    const onBefore = (event: BeforeUnloadEvent) => {
      if (leaving.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBefore);

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onBefore);
    };
  }, [onExit]);

  function requestExit() {
    setAsk(true);
  }

  function confirm() {
    leaving.current = true;
    setAsk(false);
    onExit?.();
  }

  return (
    <div className="shell">
      <div className="topbar">
        {confirmExit ? (
          <button type="button" className="brand" data-testid="brand-exit" onClick={requestExit}>
            <b>La Previa</b>
            {kicker ? <span>{kicker}</span> : null}
          </button>
        ) : (
          <Link href={backHref} className="brand" data-testid="brand-link">
            <b>La Previa</b>
            {kicker ? <span>{kicker}</span> : null}
          </Link>
        )}
        {onExit ? (
          <button className="btn btn-ghost btn-exit" type="button" data-testid="exit-button" onClick={requestExit}>
            Salir
          </button>
        ) : null}
      </div>
      {children}
      <ConfirmExit
        open={ask}
        body={exitBody}
        onCancel={() => setAsk(false)}
        onConfirm={confirm}
      />
    </div>
  );
}
