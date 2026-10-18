"use client";

import { useRef, useState } from "react";
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

  return (
    <div className="guess-slider" data-testid="guess-slider">
      <p className="guess-slider-value" data-testid="guess-value">
        {formatGuess(current)}
      </p>
      {unit ? <p className="guess-slider-unit">{unit}</p> : null}
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
