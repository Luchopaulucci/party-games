import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/shared/ui/colors";
import { GAME_STICKER, STICKER_FILLS, gameSticker, stickerInk, titleClass } from "@/shared/ui/stickers";

describe("stickers e tinta Slush", () => {
  it("blanco solo sobre negro o violeta; negro sobre el resto", () => {
    expect(stickerInk("#000000")).toBe("#ffffff");
    expect(stickerInk(STICKER_FILLS.violet)).toBe("#ffffff");
    expect(stickerInk(STICKER_FILLS.ember)).toBe("#000000");
    expect(stickerInk(STICKER_FILLS.blue)).toBe("#000000");
    expect(stickerInk(STICKER_FILLS.mint)).toBe("#000000");
    expect(stickerInk(STICKER_FILLS.lavender)).toBe("#000000");
    expect(stickerInk(STICKER_FILLS.sun)).toBe("#000000");
  });

  it("el Impostor usa ember con tinta negra", () => {
    expect(GAME_STICKER.impostor).toBe("ember");
    expect(gameSticker("impostor")).toEqual({
      fill: "#fb4903",
      ink: "#000000",
      name: "ember",
    });
  });

  it("cumple AA: blanco en negro/violeta, negro en naranja y pasteles", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", "#5c4ade")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#000000", "#fb4903")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#000000", "#4da2ff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#000000", "#55db9c")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#000000", "#e9ccff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#000000", "#ffd731")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", "#fb4903")).toBeLessThan(4.5);
  });

  it("marca títulos largos para line-height 0.95", () => {
    expect(titleClass("¿Quién está más cerca?")).toBe("title-long");
    expect(titleClass("El impostor")).toBeUndefined();
  });
});
