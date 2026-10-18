import { expect, type Page } from "@playwright/test";

const CONFIG_COPY = [
  "Timer de ronda",
  "Rondas sugeridas",
  "Extras de la sala",
  "Noche de juegos",
  "Filtros de ¿Quién soy?",
  "Modo picante",
  "Impostores (siempre",
  "Sin timer (el host cierra)",
];

export async function assertNoConfigInPlay(page: Page) {
  const hits = await page.evaluate((copies) => {
    const body = document.body.innerText;
    const found = copies.filter((text) => body.includes(text));
    if (document.querySelector("[data-testid^='clock-preset-']")) found.push("clock-preset");
    const labels = [...document.querySelectorAll("label")].map((el) => el.innerText.trim());
    if (labels.some((t) => t === "Espías" || t.startsWith("Espías\n"))) found.push("label Espías");
    return found;
  }, CONFIG_COPY);
  expect(hits, hits.join(" | ")).toEqual([]);
}

export async function assertSingleLocalPassButton(page: Page) {
  const pass = page.getByRole("button", {
    name: /listo, pasá el celu|pasar celu|pasar el teléfono|pasá el teléfono/i,
  });
  expect(await pass.count(), "botón de pasar duplicado").toBeLessThanOrEqual(1);
  await expect(page.getByRole("button", { name: "Pasar celu" })).toHaveCount(0);
}

export async function dismissHandoff(page: Page) {
  const handoff = page.getByTestId("handoff-screen");
  if (await handoff.isVisible().catch(() => false)) {
    await page.getByTestId("handoff-continue").click();
  }
}
