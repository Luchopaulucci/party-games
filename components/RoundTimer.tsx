"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/components/motion/register";
import { prefersReducedMotion } from "@/lib/motion";

export function RoundTimer({
  seconds,
  onTimeout,
  active = true,
}: {
  seconds?: number;
  onTimeout: () => void;
  active?: boolean;
}) {
  const total = seconds ?? 0;
  const [left, setLeft] = useState(total);
  const fired = useRef(false);
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setLeft(total);
    fired.current = false;
  }, [total]);

  useEffect(() => {
    if (!active || total <= 0 || fired.current) return;
    if (left <= 0) {
      fired.current = true;
      onTimeout();
      return;
    }
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [active, left, onTimeout, total]);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      gsap.fromTo(root.current, { scale: 1.04 }, { scale: 1, duration: 0.14, ease: "power1.out" });
    },
    { scope: root, dependencies: [left] },
  );

  if (!active || total <= 0) return null;
  return (
    <p className="pill" data-testid="round-timer" ref={root}>
      ⏱ {left}s
    </p>
  );
}
