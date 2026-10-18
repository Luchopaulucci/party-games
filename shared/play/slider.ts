import { formatNumberEs, isCalendarYear, isYearUnit } from "../ui/format";

export function clampGuess(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snapGuess(value: number, min: number, max: number, step: number): number {
  if (step <= 0) return clampGuess(value, min, max);
  const snapped = Math.round((value - min) / step) * step + min;
  const decimals = step >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log10(step)));
  return clampGuess(Number(snapped.toFixed(decimals)), min, max);
}

export function defaultGuess(min: number, max: number): number {
  return snapGuess((min + max) / 2, min, max, 1);
}

export function nudgeGuess(value: number, direction: 1 | -1, min: number, max: number, step: number): number {
  return snapGuess(value + direction * step, min, max, step);
}

export function formatGuess(value: number, unit?: string): string {
  const year = isYearUnit(unit) || isCalendarYear(Math.round(value), unit);
  const decimals = year || Number.isInteger(value) ? 0 : 2;
  const shown = decimals === 0 ? Math.round(value) : value;
  return formatNumberEs(shown, !year, decimals);
}
