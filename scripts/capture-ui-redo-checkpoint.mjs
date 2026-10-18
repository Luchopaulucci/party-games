import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const arg = process.argv[2] ?? "antes";
const outDir =
  arg === "checkpoint2"
    ? "/opt/cursor/artifacts/ui-redo/checkpoint2"
    : `/opt/cursor/artifacts/ui-redo/checkpoint/${arg === "despues" ? "despues" : "antes"}`;
const base = process.env.CAPTURE_URL ?? "http://127.0.0.1:3010";

const roster = [
  { id: "p1", name: "Lucho", color: "#C42B54" },
  { id: "p2", name: "Meli", color: "#1D4ED8" },
  { id: "p3", name: "Coco", color: "#A16207" },
  { id: "p4", name: "Wanda", color: "#0F766E" },
];

async function shot(page, name) {
  await page.screenshot({
    path: `${outDir}/${name}.png`,
    fullPage: false,
    animations: "disabled",
  });
  console.log(`${arg}/${name}.png`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.addInitScript((players) => {
  localStorage.setItem("previa:local:roster:v1", JSON.stringify(players));
}, roster);
await mkdir(outDir, { recursive: true });

await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.getByRole("heading").first().waitFor();
await shot(page, "01_home");

await page.goto(`${base}/juego/impostor`, { waitUntil: "networkidle" });
await page.getByTestId("home-modes").waitFor();
await shot(page, "02_elegir_modo_impostor");

await page.goto(`${base}/juego/impostor/local`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Lobby" }).waitFor();
await shot(page, "03_lobby_local_impostor");

await page.getByRole("button", { name: /Empezar/ }).click();
const handoff = page.getByTestId("handoff-screen");
if (await handoff.isVisible().catch(() => false)) {
  await page.getByTestId("handoff-continue").click();
}
await page.getByRole("button", { name: "Listo, pasá el celu" }).waitFor();
await shot(page, "04_partida_impostor");

await browser.close();
