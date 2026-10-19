import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");
const design = readFileSync("DESIGN.md", "utf8");

describe("sistema Slush / La Previa", () => {
  it("expone los tokens de color, radio y tinta", () => {
    for (const token of [
      "--color-carbon: #000000",
      "--color-paper: #ffffff",
      "--color-sky: #dceeff",
      "--color-blue: #4da2ff",
      "--color-mint: #55db9c",
      "--color-lavender: #e9ccff",
      "--color-ember: #fb4903",
      "--color-sun: #ffd731",
      "--color-violet: #5c4ade",
      "--radius-card: 20px",
      "--radius-button: 1600px",
      "min-height: 48px",
    ]) {
      expect(css).toContain(token);
    }
    expect(css).toContain("line-height: 0.95");
    expect(css).toContain("var(--font-display)");
    expect(css).not.toContain("#ee1f66");
  });

  it("documenta las reglas de producto y QA de tinta", () => {
    expect(design).toContain("LA PREVIA");
    expect(design).toContain("Listo, pasá el celu");
    expect(design).toContain("Nunca adentro de la partida");
    expect(design).toContain("#5c4ade");
    expect(design).toContain("#fb4903");
    expect(design).toContain("solo en la home");
    expect(design).toContain("0.95");
  });
});
