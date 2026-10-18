"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/components/motion/register";
import { MOTION, prefersReducedMotion } from "@/lib/motion";
import { formatRevealUnit } from "@/shared/ui/format";
import { defaultGuess, formatGuess, nudgeGuess, snapGuess } from "@/shared/play/slider";

export function GuessSlider({
  question,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  unit,
}: {
  question: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (next: number) => void;
  unit?: string;
}) {
  const [inner, setInner] = useState(() => value ?? defaultGuess(min, max));
  const current = value ?? inner;
  const startY = useRef<number | null>(null);
  const startValue = useRef(current);
  const root = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const fillTo = useRef<((n: number) => void) | null>(null);
  const span = max - min || 1;
  const ratio = Math.min(1, Math.max(0, (current - min) / span));

  function setValue(next: number) {
    const snapped = snapGuess(next, min, max, step);
    if (value === undefined) setInner(snapped);
    onChange?.(snapped);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    startY.current = event.clientY;
    startValue.current = current;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (startY.current == null) return;
    const delta = startY.current - event.clientY;
    const ticks = Math.round(delta / 18);
    setValue(startValue.current + ticks * step);
  }

  function onPointerUp() {
    startY.current = null;
  }

  useGSAP(
    () => {
      const fill = fillRef.current;
      if (!fill) return;
      gsap.set(fill, { scaleX: ratio });
      if (prefersReducedMotion()) {
        fillTo.current = (n) => gsap.set(fill, { scaleX: n });
        return;
      }
      fillTo.current = gsap.quickTo(fill, "scaleX", { duration: 0.16, ease: MOTION.ease });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      fillTo.current?.(ratio);
      const node = valueRef.current;
      if (!node || prefersReducedMotion()) return;
      gsap.fromTo(node, { scale: 1.05 }, { scale: 1, duration: 0.16, ease: MOTION.ease });
    },
    { scope: root, dependencies: [current, ratio] },
  );

  return (
    <div className="guess-slider" data-testid="guess-slider" ref={root}>
      <p className="guess-slider-value" data-testid="guess-value" ref={valueRef}>
        {formatGuess(current, unit)}
      </p>
      {formatRevealUnit(current, unit) ? <p className="guess-slider-unit">{formatRevealUnit(current, unit)}</p> : null}
      <div className="guess-slider-track" aria-hidden>
        <span className="guess-slider-fill" ref={fillRef} />
      </div>
      <div
        className="guess-slider-pad"
        data-testid="guess-swipe"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="row" style={{ width: "100%", maxWidth: 280 }}>
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="slider-minus"
            aria-label="Bajar"
            onClick={() => setValue(nudgeGuess(current, -1, min, max, step))}
          >
            −
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="slider-plus"
            aria-label="Subir"
            onClick={() => setValue(nudgeGuess(current, 1, min, max, step))}
          >
            +
          </button>
        </div>
        <p className="guess-swipe-hint">^ SWIPE v</p>
      </div>
      <div className="guess-card" data-testid="guess-card">
        <p>{question}</p>
      </div>
    </div>
  );
}
