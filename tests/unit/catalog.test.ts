import { describe, expect, it } from "vitest";
import { filterPremises, PREMISES } from "@/shared/games/closest/catalog";
import { CATEGORIES, FIESTA_CATEGORIES } from "@/shared/games/closest/premise-types";

describe("mazos cuanto-es", () => {
  it("trae premisas clásicas y de fiesta", () => {
    expect(PREMISES.length).toBeGreaterThan(80);
    expect(PREMISES.some((p) => p.category === "animales")).toBe(true);
    expect(PREMISES.some((p) => FIESTA_CATEGORIES.includes(p.category))).toBe(true);
  });

  it("filtra categorías y esconde picante salvo que lo pidas", () => {
    const animals = filterPremises({ categories: ["animales"] });
    expect(animals.length).toBeGreaterThan(0);
    expect(animals.every((p) => p.category === "animales")).toBe(true);
    expect(filterPremises({ picante: false }).every((p) => !p.picante)).toBe(true);
    const spicy = filterPremises({ picante: true });
    expect(spicy.some((p) => p.picante)).toBe(true);
    expect(CATEGORIES).toContain("argentinidad");
  });
});
