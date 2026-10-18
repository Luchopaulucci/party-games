import { expect, test, type Page } from "@playwright/test";
import { supportsMode } from "../../shared/games/browse";
import { GAME_IDS, type GameId } from "../../shared/types";
import { assertSingleLocalPassButton, dismissHandoff } from "./play-guards";

const ROSTER_3 = [
  { id: "p1", name: "Lucho", color: "#C42B54" },
  { id: "p2", name: "Meli", color: "#1D4ED8" },
  { id: "p3", name: "Coco", color: "#A16207" },
];

const ROSTER_4 = [
  ...ROSTER_3,
  { id: "p4", name: "Wanda", color: "#0F766E" },
];

const localGames = GAME_IDS.filter((id) => supportsMode(id, "local"));

async function seedRoster(page: Page, players: typeof ROSTER_4) {
  await page.addInitScript((roster) => {
    localStorage.setItem("previa:local:roster:v1", JSON.stringify(roster));
  }, players);
}

async function startLocal(page: Page, gameId: GameId) {
  await page.goto(`/juego/${gameId}/local`);
  await expect(page.getByRole("heading", { name: "Lobby" })).toBeVisible();
  await page.getByRole("button", { name: /Empezar/ }).click();
  await dismissHandoff(page);
}

async function otraRonda(page: Page) {
  await expect(page.getByRole("button", { name: "Otra ronda" })).toBeVisible({ timeout: 20_000 });
}

async function playPhraseRound(page: Page, players: number) {
  for (let i = 0; i < players; i++) {
    await dismissHandoff(page);
    await assertSingleLocalPassButton(page);
    await page.getByPlaceholder("El cierre más sucio que se te ocurra").fill(`cierre ${i + 1} fernet`);
    await page.getByRole("button", { name: "Mandar y pasar" }).click();
  }

  await dismissHandoff(page);
  for (let i = 0; i < players; i++) {
    const last = i === players - 1;
    await page.getByRole("button", { name: last ? "A votar la mejor" : "Siguiente" }).click();
  }

  for (let i = 0; i < players; i++) {
    await dismissHandoff(page);
    await assertSingleLocalPassButton(page);
    await expect(page.getByText("tu frase")).toBeVisible();
    const own = page.locator('[data-testid="phrase-answer"][data-own="1"]');
    await expect(own).toBeDisabled();
    await page.locator('[data-testid="phrase-answer"][data-own="0"]').first().click();
    await page.getByTestId("phrase-cast-vote").click();
  }

  await otraRonda(page);
}

async function playFullRound(page: Page, gameId: GameId, players: number) {
  switch (gameId) {
    case "completa-frase":
      await playPhraseRound(page, players);
      return;
    case "closest":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByRole("button", { name: "Mandale" }).click();
      }
      break;
    case "whoami":
      await dismissHandoff(page);
      await page.getByRole("button", { name: "Me rindo, era obvio" }).click();
      break;
    case "impostor":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByRole("button", { name: "Listo, pasá el celu" }).click();
      }
      await dismissHandoff(page);
      await page.getByRole("button", { name: /^(Lucho|Meli|Coco|Wanda)$/ }).first().click();
      break;
    case "mas-o-menos":
      await dismissHandoff(page);
      await page.getByRole("button", { name: "Revelar y cortar" }).click();
      break;
    case "espia":
      await dismissHandoff(page);
      await page.getByRole("button", { name: "Basta, a votar" }).click();
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByRole("button", { name: /^(Lucho|Meli|Coco|Wanda)$/ }).first().click();
      }
      await page.getByRole("button", { name: "Cerrar urna" }).click();
      break;
    case "votacion":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByRole("button", { name: /Lucho/ }).click();
      }
      break;
    case "mentira":
      await dismissHandoff(page);
      const inputs = page.locator("input");
      await inputs.nth(0).fill("fui a la cancha");
      await inputs.nth(1).fill("cociné un asado");
      await inputs.nth(2).fill("gané la lotería");
      await page.getByRole("button", { name: "Listo, pasá el celu" }).click();
      for (let i = 0; i < players - 1; i++) {
        await dismissHandoff(page);
        await page.getByRole("button", { name: "fui a la cancha" }).click();
      }
      break;
    case "reflejos":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByTestId("reflex-button").click();
        await page.getByTestId("reflex-button").click();
      }
      break;
    case "yo-nunca":
      for (let i = 0; i < 12; i++) {
        await page.getByRole("button", { name: "Siguiente carta" }).click();
      }
      break;
    case "trivia":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.locator("button.btn-ghost").first().click();
      }
      break;
    case "cadena":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByPlaceholder("Una o dos palabras").fill(`mate${i}`);
        await page.getByRole("button", { name: "Mandar" }).click();
      }
      break;
    case "emoji":
      for (let i = 0; i < players; i++) {
        await dismissHandoff(page);
        await page.getByRole("button", { name: "Listo, pasá el celu" }).click();
      }
      break;
    default:
      throw new Error(`juego local sin flujo e2e: ${gameId}`);
  }
  await otraRonda(page);
}

test.describe("Completá la frase local hasta Otra ronda", () => {
  test("3 jugadores votan por turno y llegan al podio", async ({ page }) => {
    test.setTimeout(90_000);
    await seedRoster(page, ROSTER_3);
    await startLocal(page, "completa-frase");
    await playPhraseRound(page, 3);
  });

  test("4 jugadores votan por turno y llegan al podio", async ({ page }) => {
    test.setTimeout(90_000);
    await seedRoster(page, ROSTER_4);
    await startLocal(page, "completa-frase");
    await playPhraseRound(page, 4);
  });
});

test.describe("ronda local completa de cada juego", () => {
  test("los 13 locales llegan a Otra ronda", async ({ page }) => {
    test.setTimeout(300_000);
    await seedRoster(page, ROSTER_4);

    for (const id of localGames) {
      await startLocal(page, id);
      await playFullRound(page, id, 4);
      await expect(page.getByRole("button", { name: "Otra ronda" }), id).toBeVisible();
    }
  });
});
