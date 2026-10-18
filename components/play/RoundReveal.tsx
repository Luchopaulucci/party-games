"use client";

import { CountUp } from "@/components/CountUp";

export function RoundReveal({
  title = "Se reveló",
  headline,
  value,
  unit,
  lines,
  onContinue,
  continueLabel = "Seguimos",
}: {
  title?: string;
  headline: string;
  value?: number;
  unit?: string;
  lines?: string[];
  onContinue?: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="stack" data-testid="round-reveal">
      <p className="kicker">{title}</p>
      <h2>{headline}</h2>
      {value !== undefined ? (
        <CountUp to={value} unit={unit} />
      ) : null}
      {unit && value === undefined ? <p className="lead">{unit}</p> : null}
      {lines?.map((line) => (
        <p key={line} className="lead" style={{ margin: 0 }}>
          {line}
        </p>
      ))}
      {onContinue ? (
        <button className="btn btn-primary" type="button" data-testid="reveal-next" onClick={onContinue}>
          {continueLabel}
        </button>
      ) : null}
    </div>
  );
}
