"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/components/motion/register";
import { prefersReducedMotion } from "@/lib/motion";
import { formatReveal, formatRevealUnit } from "@/shared/ui/format";

export function CountUp({
  from = 0,
  to,
  unit,
}: {
  from?: number;
  to: number;
  unit?: string;
}) {
  const [shown, setShown] = useState(from);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setShown(to);
        return;
      }
      const proxy = { n: from };
      gsap.to(proxy, {
        n: to,
        duration: 0.32,
        ease: "power2.out",
        onUpdate: () => setShown(proxy.n),
        onComplete: () => setShown(to),
      });
      if (root.current) {
        gsap.fromTo(root.current, { scale: 0.96 }, { scale: 1, duration: 0.2, ease: "power2.out" });
      }
    },
    { scope: root, dependencies: [from, to] },
  );

  return (
    <div className="big" data-testid="reveal-value" ref={root}>
      {formatReveal(shown, to, unit)}
      {formatRevealUnit(to, unit) ? ` ${formatRevealUnit(to, unit)}` : ""}
    </div>
  );
}
