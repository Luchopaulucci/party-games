import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/shared/rng";
import { clockLabel, nextClockSecond } from "@/shared/play/clock";
import { pickRandomReader } from "@/shared/play/reader";
import { defaultGuess, formatGuess, nudgeGuess, snapGuess } from "@/shared/play/slider";

describe("piezas de play", () => {
  it("el slider nace al medio y el swipe suma de a un step", () => {
    expect(defaultGuess(0, 100)).toBe(50);
    expect(nudgeGuess(50, 1, 0, 100, 1)).toBe(51);
    expect(nudgeGuess(50, -1, 0, 100, 5)).toBe(45);
    expect(snapGuess(103, 0, 100, 1)).toBe(100);
    expect(formatGuess(25000)).toContain("25");
  });

  it("el reloj baja hasta cero y el preset 0 es sin reloj", () => {
    expect(nextClockSecond(3)).toBe(2);
    expect(nextClockSecond(0)).toBe(0);
    expect(clockLabel(0)).toBe("Sin reloj");
    expect(clockLabel(45)).toBe("45s");
  });

  it("el lector al azar elige uno de la mesa y no inventa", () => {
    const players = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const picked = pickRandomReader(players, mulberry32(7));
    expect(players.map((p) => p.id)).toContain(picked?.id);
    expect(pickRandomReader([], () => 0.2)).toBeNull();
  });
});
