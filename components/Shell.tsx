"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConfirmExit } from "@/components/ConfirmExit";
import { ScreenMotion } from "@/components/motion/ScreenMotion";
import { gsap, useGSAP } from "@/components/motion/register";
import { brandUsesConfirm, shouldGuardNavigation } from "@/lib/exit-guard";
import { prefersReducedMotion } from "@/lib/motion";

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
  const brandRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mark = brandRef.current;
      if (!mark || prefersReducedMotion()) return;
      gsap.to(mark, {
        autoAlpha: 0.7,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: brandRef },
  );

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
            <span className="wordmark">
              <span className="wordmark-la">LA</span>
              <span className="wordmark-previa" ref={brandRef}>
                PREVIA
              </span>
            </span>
            {kicker ? <span className="brand-kicker">{kicker}</span> : null}
          </button>
        ) : (
          <Link href={backHref} className="brand" data-testid="brand-link">
            <span className="wordmark">
              <span className="wordmark-la">LA</span>
              <span className="wordmark-previa" ref={brandRef}>
                PREVIA
              </span>
            </span>
            {kicker ? <span className="brand-kicker">{kicker}</span> : null}
          </Link>
        )}
        {onExit ? (
          <button className="btn btn-ghost btn-exit" type="button" data-testid="exit-button" onClick={requestExit}>
            Salir
          </button>
        ) : null}
      </div>
      <ScreenMotion replay={kicker}>{children}</ScreenMotion>
      <ConfirmExit
        open={ask}
        body={exitBody}
        onCancel={() => setAsk(false)}
        onConfirm={confirm}
      />
    </div>
  );
}
