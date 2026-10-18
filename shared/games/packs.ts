import { CLASSIC_CATEGORIES, FIESTA_CATEGORIES, type Category } from "./closest/premise-types";
import type { GameContext } from "../types";

export type ContentPack = "clasico" | "fiesta" | "picante";

export function packAllowed(pack: ContentPack, ctx: GameContext): boolean {
  if (pack === "picante") return Boolean(ctx.picante);
  const cats = ctx.categories ?? [];
  if (cats.length === 0) return true;
  if (pack === "fiesta") return cats.some((c) => FIESTA_CATEGORIES.includes(c as Category));
  return cats.some((c) => CLASSIC_CATEGORIES.includes(c as Category));
}

export function filterByPack<T extends { pack: ContentPack; id: string }>(list: T[], ctx: GameContext): T[] {
  const pool = list.filter((item) => packAllowed(item.pack, ctx));
  return pool.length ? pool : list.filter((item) => item.pack !== "picante");
}
