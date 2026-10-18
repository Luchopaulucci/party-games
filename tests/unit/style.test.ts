import { describe, expect, it } from "vitest";
import { PLAYER_COLORS, contrastText, nextPlayerColor } from "@/shared/ui/colors";
import { winnerHeadline } from "@/shared/ui/format";

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
});
