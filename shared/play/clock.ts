export const CLOCK_PRESETS = [0, 30, 45, 60, 90] as const;
export type ClockPreset = (typeof CLOCK_PRESETS)[number];

export function isClockPreset(value: unknown): value is ClockPreset {
  return typeof value === "number" && (CLOCK_PRESETS as readonly number[]).includes(value);
}

export function nextClockSecond(left: number): number {
  return Math.max(0, left - 1);
}

export function clockLabel(seconds: number): string {
  if (seconds <= 0) return "Sin reloj";
  return `${seconds}s`;
}
