import { test, expect } from "@playwright/test";
import { supportsMode } from "../../shared/games/browse";
import { GAME_IDS } from "../../shared/types";

const HYDRATION = /hydrat|Minified React error #418|#418|#423|#425/i;

const onlineGames = GAME_IDS.filter((id) => supportsMode(id, "online"));

test.describe("hydration /juego", () => {
  for (const id of onlineGames) {
    test(`/juego/${id} no tira React #418`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto(`/juego/${id}`);
      await expect(page.locator("h1")).toBeVisible();
      const hydration = errors.filter((text) => HYDRATION.test(text));
      expect(hydration, errors.join("\n")).toEqual([]);
    });
  }
});
