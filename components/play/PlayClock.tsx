"use client";

import { useEffect, useRef, useState } from "react";
import { CLOCK_PRESETS, clockLabel, nextClockSecond, type ClockPreset } from "@/shared/play/clock";

export function PlayClock({
  seconds = 0,
  onChange,
  running = false,
  onTimeout,
}: {
  seconds?: number;
  onChange?: (next: ClockPreset) => void;
  running?: boolean;
  onTimeout?: () => void;
}) {
  const total = seconds;
  const [left, setLeft] = useState(total);
  const fired = useRef(false);

  useEffect(() => {
    setLeft(total);
    fired.current = false;
  }, [total, running]);

  useEffect(() => {
    if (!running || total <= 0 || fired.current) return;
    if (left <= 0) {
      fired.current = true;
      onTimeout?.();
      return;
    }
    const id = window.setTimeout(() => setLeft((n) => nextClockSecond(n)), 1000);
    return () => window.clearTimeout(id);
  }, [left, onTimeout, running, total]);

  return (
    <div className="stack" data-testid="play-clock">
      {!running && onChange ? (
        <>
          <p className="kicker">Reloj</p>
          <div className="chips">
            {CLOCK_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className={`chip ${total === n ? "on" : ""}`}
                data-testid={`clock-preset-${n}`}
                onClick={() => onChange?.(n)}
              >
                {clockLabel(n)}
              </button>
            ))}
          </div>
        </>
      ) : total > 0 ? (
        <p className="big" data-testid="clock-left">
          {left}s
        </p>
      ) : null}
    </div>
  );
}
