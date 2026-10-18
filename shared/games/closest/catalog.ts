import { PREMISES as CLASICAS } from "./premises-clasicas";
import { PREMISES_FIESTA } from "./premises-fiesta";
import type { Category, Premise } from "./premise-types";
import type { ClosestQuestion } from "./questions";

export const PREMISES: Premise[] = [...CLASICAS, ...PREMISES_FIESTA];

export function premisesToQuestions(list: Premise[] = PREMISES): ClosestQuestion[] {
  return list.map((p) => ({
    id: p.id,
    prompt: p.question,
    answer: p.value,
    unit: p.unit,
    blurb: p.unitLabel,
    category: p.category,
    picante: Boolean(p.picante),
    min: p.min,
    max: p.max,
  }));
}

export function filterPremises(opts: { categories?: string[]; picante?: boolean }): Premise[] {
  let pool = PREMISES;
  if (opts.categories?.length) {
    const set = new Set(opts.categories);
    pool = pool.filter((p) => set.has(p.category));
  }
  if (!opts.picante) {
    pool = pool.filter((p) => !p.picante);
  }
  return pool;
}

export function isCategory(value: string): value is Category {
  return PREMISES.some((p) => p.category === value);
}
