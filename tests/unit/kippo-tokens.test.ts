import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");
const design = readFileSync("DESIGN.md", "utf8");

describe("sistema Kippo / La Previa", () => {
  it("expone los tokens de color y escala", () => {
    for (const token of [
      "--color-kippo-pink: #ee1f66",
      "--color-void-black: #000000",
      "--color-carbon: #29292a",
      "--color-ash: #333333",
      "--color-ghost-white: #ffffff",
      "--spacing-15: 15px",
      "--radius-card: 15px",
      "--radius-button: 10px",
      "--text-display: 42px",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("documenta las reglas de producto y los componentes que no aplican", () => {
    expect(design).toContain("LA PREVIA");
    expect(design).toContain("Listo, pasá el celu");
    expect(design).toContain("Nunca adentro de la partida");
    expect(design).toContain("no aplica / referencia");
    expect(design).toContain("Press Logo Strip");
    expect(design).toContain("Phone Mockup Frame");
  });
});
