import { describe, expect, it } from "vitest";
import { PLAYER_COLORS, contrastText, nextPlayerColor } from "@/shared/ui/colors";
import { formatReveal, formatRevealUnit, winnerHeadline } from "@/shared/ui/format";
import { formatGuess } from "@/shared/play/slider";

describe("tokens de ¿Cuánto es?", () => {
  it("reparte la paleta de jugadores sin repetir", () => {
    const used: string[] = [];
    const assigned = PLAYER_COLORS.map(() => {
      const color = nextPlayerColor(used);
      used.push(color);
      return color;
    });
    expect(assigned).toEqual([...PLAYER_COLORS]);
    expect(nextPlayerColor(used)).toBe(PLAYER_COLORS[0]);
  });

  it("elige tinta clara u oscura según el color", () => {
    expect(contrastText("#C42B54")).toBe("#fff8f0");
    expect(contrastText("#f5d56a")).toBe("#1a1233");
  });

  it("arma el titular del reveal", () => {
    expect(winnerHeadline(["Meli"])).toBe("¡Meli se quedó más cerca!");
    expect(winnerHeadline(["Meli", "Coco"])).toContain("Empate");
  });

  it("muestra años de calendario sin separador de miles ni unidad colgada", () => {
    expect(formatReveal(2000, 2000, "año")).toBe("2000");
    expect(formatRevealUnit(2000, "año")).toBeUndefined();
    expect(formatGuess(2000, "año")).toBe("2000");
    expect(formatReveal(1810, 1810, "años")).toBe("1810");
    expect(formatReveal(25000, 25000)).toBe("25.000");
  });

  it("pluraliza cantidades de años que no son un año calendario", () => {
    expect(formatReveal(13, 13, "año")).toBe("13");
    expect(formatRevealUnit(13, "año")).toBe("años");
    expect(formatRevealUnit(1, "años")).toBe("año");
    expect(formatReveal(9_460_730_472_580.8, 9_460_730_472_580.8, "km")).toContain(".");
  });
});
