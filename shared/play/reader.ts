export function pickRandomReader<T extends { id: string }>(players: T[], rng: () => number): T | null {
  const live = players.filter((p) => p.id);
  if (live.length === 0) return null;
  const index = Math.min(live.length - 1, Math.floor(rng() * live.length));
  return live[index] ?? null;
}
