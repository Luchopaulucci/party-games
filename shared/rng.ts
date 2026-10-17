export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRandom<T>(items: T[], rng: () => number, exclude: string[] = [], idOf?: (item: T) => string): T {
  const pool =
    exclude.length && idOf
      ? items.filter((item) => !exclude.includes(idOf(item)))
      : items;
  const source = pool.length > 0 ? pool : items;
  return source[Math.floor(rng() * source.length)]!;
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
