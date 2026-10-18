/** Paleta oscura, contrastada con texto claro (WCAG AA sobre #fff8f0). */
export const PLAYER_COLORS = [
  "#C42B54",
  "#1D4ED8",
  "#A16207",
  "#15803D",
  "#6D28D9",
  "#C2410C",
  "#0F766E",
  "#334155",
  "#BE185D",
  "#0369A1",
  "#B45309",
  "#166534",
  "#7C3AED",
  "#9A3412",
  "#0E7490",
  "#475569",
  "#9D174D",
  "#1E40AF",
  "#854D0E",
  "#115E59",
] as const;

export const MAX_LOCAL_PLAYERS = PLAYER_COLORS.length;

export function nextPlayerColor(used: string[]): string {
  const free = PLAYER_COLORS.find((c) => !used.includes(c));
  return free ?? PLAYER_COLORS[used.length % PLAYER_COLORS.length]!;
}

export function contrastText(hex: string): "#fff8f0" | "#1a1233" {
  const raw = hex.replace("#", "");
  if (raw.length < 6) return "#fff8f0";
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.62 ? "#1a1233" : "#fff8f0";
}

export function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
