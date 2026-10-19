import { expect, test, type Page } from "@playwright/test";
import { supportsMode } from "../../shared/games/browse";
import { getGameMeta } from "../../shared/games/registry";
import { GAME_IDS } from "../../shared/types";
import { assertNoConfigInPlay, assertSingleLocalPassButton, dismissHandoff } from "./play-guards";

const ROSTER = [
  { id: "p1", name: "Lucho", color: "#C42B54" },
  { id: "p2", name: "Meli", color: "#1D4ED8" },
  { id: "p3", name: "Coco", color: "#A16207" },
  { id: "p4", name: "Wanda", color: "#0F766E" },
];

const localGames = GAME_IDS.filter((id) => supportsMode(id, "local"));
const onlineGames = GAME_IDS.filter((id) => supportsMode(id, "online"));

async function seedRoster(page: Page) {
  await page.addInitScript((players) => {
    localStorage.setItem("previa:local:roster:v1", JSON.stringify(players));
  }, ROSTER);
}

test.describe("en la partida no se configura nada", () => {
  test("los 13 juegos locales: sin controles de setup ni botones de pasar duplicados", async ({ page }) => {
    test.setTimeout(180_000);
    await seedRoster(page);

    for (const id of localGames) {
      await page.goto(`/juego/${id}/local`);
      await expect(page.getByRole("heading", { name: "Lobby" })).toBeVisible();
      await page.getByRole("button", { name: /Empezar/ }).click();
      await dismissHandoff(page);
      if (id === "impostor") {
        await expect(page.locator(".pill-mode")).toHaveCount(0);
      } else {
        await expect(page.locator(".pill-mode")).toHaveText("Pasando el celu");
      }
      await assertNoConfigInPlay(page);
      await assertSingleLocalPassButton(page);
      if (id === "impostor") {
        await expect(page.getByRole("button", { name: "Listo, pasá el celu" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Pasar celu" })).toHaveCount(0);
        await expect(page.getByText(/Listos:/)).toHaveCount(0);
        await expect(page.getByRole("button", { name: "OK, ya vi" })).toHaveCount(0);
      }
    }
  });

  test("los 14 juegos online: sin controles de setup en la partida", async ({ browser }) => {
    test.setTimeout(240_000);
    const host = await browser.newPage();
    const guests: Page[] = [];
    try {
      for (const id of onlineGames) {
        const min = getGameMeta(id)?.minPlayers ?? 2;
        await host.goto(`/juego/${id}`);
        await host.getByPlaceholder("Tu nombre de previa").fill("Lucho");
        await host.getByRole("button", { name: "Crear sala" }).click();
        await expect(host.locator(".code")).toBeVisible({ timeout: 20_000 });
        const code = (await host.locator(".code").innerText()).trim();
        expect(code.length).toBe(4);

        const needed = Math.max(0, min - 1);
        const names = ["Meli", "Coco", "Wanda"];
        while (guests.length < needed) {
          guests.push(await browser.newPage());
        }
        for (let i = 0; i < needed; i++) {
          await guests[i]!.goto(`/online/sala?code=${code}&name=${names[i]}`);
          await expect(guests[i]!.getByText(names[i]!)).toBeVisible({ timeout: 15_000 });
        }

        await host.getByRole("button", { name: new RegExp(`Empezar`) }).click();
        await expect(host.getByText("Extras de la sala")).toHaveCount(0, { timeout: 15_000 });
        await assertNoConfigInPlay(host);
        for (let i = 0; i < needed; i++) {
          await assertNoConfigInPlay(guests[i]!);
        }

        await host.getByTestId("exit-button").click();
        await host.getByTestId("confirm-exit-yes").click();
        await expect(host).toHaveURL(/\/$/);
      }
    } finally {
      await Promise.all(guests.map((p) => p.close()));
      await host.close();
    }
  });
});
