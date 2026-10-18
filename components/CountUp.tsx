"use client";

import { useEffect, useState } from "react";
import { formatReveal } from "@/shared/ui/format";

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

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(to);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (stamp: number) => {
      const t = Math.min(1, (stamp - start) / 900);
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (to - from) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
      else setShown(to);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [from, to]);

  return (
    <div className="big" data-testid="reveal-value">
      {formatReveal(shown, to, unit)}
      {unit ? ` ${unit}` : ""}
    </div>
  );
}
