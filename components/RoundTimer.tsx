"use client";

import { useEffect, useRef, useState } from "react";

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

  if (!active || total <= 0) return null;
  return (
    <p className="pill" data-testid="round-timer">
      ⏱ {left}s
    </p>
  );
}
