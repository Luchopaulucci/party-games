import { expect, test, type Page } from "@playwright/test";
import { supportsMode } from "../../shared/games/browse";
import { GAME_IDS } from "../../shared/types";

const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
] as const;

const ROSTER = [
  { id: "p1", name: "Lucho", color: "#C42B54" },
  { id: "p2", name: "Meli", color: "#1D4ED8" },
  { id: "p3", name: "Coco", color: "#A16207" },
];

const localGames = GAME_IDS.filter((id) => supportsMode(id, "local"));

async function assertLayout(page: Page) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowX = doc.scrollWidth > doc.clientWidth + 1;
    const modal = document.querySelector<HTMLElement>("[data-testid='confirm-exit'][aria-modal='true']");
    const sel = 'a[href], button, input, select, textarea, [role="button"]';
    const nodes = [...document.querySelectorAll<HTMLElement>(sel)].filter((el) => {
      if (modal && !modal.contains(el) && !el.closest(".topbar")) return false;
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return (
        r.width >= 8 &&
        r.height >= 8 &&
        st.visibility !== "hidden" &&
        st.display !== "none" &&
        st.pointerEvents !== "none" &&
        Number(st.opacity) > 0
      );
    });
    const overlaps: string[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const left = nodes[i]!;
        const right = nodes[j]!;
        if (left.contains(right) || right.contains(left)) continue;
        const a = left.getBoundingClientRect();
        const b = right.getBoundingClientRect();
        const hit =
          !(a.right <= b.left + 1 || a.left >= b.right - 1 || a.bottom <= b.top + 1 || a.top >= b.bottom - 1);
        if (!hit) continue;
        const aInB = a.left >= b.left && a.right <= b.right && a.top >= b.top && a.bottom <= b.bottom;
        const bInA = b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom;
        if (aInB || bInA) continue;
        const label = (el: HTMLElement) =>
          (el.getAttribute("aria-label") || el.innerText || el.tagName).replace(/\s+/g, " ").trim().slice(0, 28);
        overlaps.push(`${label(left)} × ${label(right)}`);
      }
    }
    return { overflowX, overlaps };
  });
  expect(result.overflowX, "overflow horizontal").toBe(false);
  expect(result.overlaps, result.overlaps.join(" | ")).toEqual([]);
}

test.describe("layout márgenes", () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.width}x${vp.height} home, modos, lobbies y Impostor`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize(vp);
      await page.addInitScript((players) => {
        localStorage.setItem("previa:local:roster:v1", JSON.stringify(players));
      }, ROSTER);

      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      const homeGap = await page.evaluate(() => {
        const tile = document.querySelector("[data-testid='home-code-tile']");
        const title = document.querySelector(".home-games-title");
        if (!tile || !title) return 0;
        return title.getBoundingClientRect().top - tile.getBoundingClientRect().bottom;
      });
      expect(Math.round(homeGap), "gap Tengo un código → Los juegos").toBeGreaterThanOrEqual(12);
      const stickerPe = await page.locator("[data-testid='home-stickers']").evaluate((el) => getComputedStyle(el).pointerEvents);
      expect(stickerPe).toBe("none");
      const whiteOnBright = await page.evaluate(() => {
        const parse = (c: string) => {
          const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
        };
        const isWhite = (rgb: number[]) => rgb[0]! > 240 && rgb[1]! > 240 && rgb[2]! > 240;
        const brights = [
          [251, 73, 3],
          [77, 162, 255],
          [85, 219, 156],
          [233, 204, 255],
          [255, 215, 49],
        ];
        return [...document.querySelectorAll<HTMLElement>(".game-tile")]
          .filter((el) => {
            const bg = parse(getComputedStyle(el).backgroundColor);
            const fg = parse(getComputedStyle(el).color);
            return (
              isWhite(fg) &&
              brights.some(
                ([r, g, b]) => Math.abs(r - bg[0]!) < 10 && Math.abs(g - bg[1]!) < 10 && Math.abs(b - bg[2]!) < 10,
              )
            );
          })
          .map((el) => el.innerText.replace(/\s+/g, " ").trim());
      });
      expect(whiteOnBright, "blanco sobre naranja/celeste/verde/lavanda/amarillo").toEqual([]);
      await assertLayout(page);

      await page.goto("/online");
      await expect(page.locator("h1")).toBeVisible();
      await assertLayout(page);

      for (const id of GAME_IDS) {
        await page.goto(`/juego/${id}`);
        await expect(page.locator("h1")).toBeVisible();
        const modeGap = await page.evaluate(() => {
          const how = document.querySelector("[aria-expanded]")?.closest("div");
          const modes = document.querySelector("[data-testid='home-modes']");
          if (!how || !modes) return 0;
          return modes.getBoundingClientRect().top - how.getBoundingClientRect().bottom;
        });
        expect(Math.round(modeGap), `gap HowToPlay → modos en ${id}`).toBeGreaterThanOrEqual(12);
        if (id === "closest") {
          const metrics = await page.locator("h1").evaluate((el) => {
            const cs = getComputedStyle(el);
            return {
              fontSize: parseFloat(cs.fontSize),
              lineHeight: parseFloat(cs.lineHeight),
              height: el.getBoundingClientRect().height,
            };
          });
          expect(metrics.lineHeight / metrics.fontSize).toBeGreaterThanOrEqual(0.9);
          if (metrics.height / metrics.lineHeight > 1.4) {
            expect(metrics.height).toBeGreaterThanOrEqual(metrics.fontSize * 1.7);
          }
        }
        const btnHeights = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>(".btn")].map((el) => el.getBoundingClientRect().height),
        );
        expect(Math.min(...btnHeights)).toBeGreaterThanOrEqual(44);
        await assertLayout(page);
      }

      for (const id of localGames) {
        await page.goto(`/juego/${id}/local`);
        await expect(page.getByRole("heading", { name: "Lobby" })).toBeVisible();
        await expect(page.getByText("pass-and-play", { exact: false })).toHaveCount(0);
        await assertLayout(page);
      }

      for (const id of ["closest", "votacion", "impostor"] as const) {
        await page.goto(`/juego/${id}/local`);
        if (id === "impostor") await expect(page.getByText("Timer de ronda")).toBeVisible();
        await page.getByRole("button", { name: /Empezar/ }).click();
        const handoff = page.getByTestId("handoff-screen");
        if (await handoff.isVisible()) {
          await assertLayout(page);
          await page.getByTestId("handoff-continue").click();
        }
        await expect(page.getByText("pass-and-play", { exact: false })).toHaveCount(0);
        await expect(page.locator(".pill-mode")).toHaveText("Pasando el celu");
        const pillWraps = await page.locator(".pill").first().evaluate((el) => el.scrollHeight > el.clientHeight + 2);
        expect(pillWraps, `pill partida ${id}`).toBe(false);
        if (id === "impostor") {
          await expect(page.getByText(/Sos impostor|No sos impostor/)).toBeVisible();
          const secretInk = await page.locator(".secret").evaluate((el) => {
            const cs = getComputedStyle(el);
            return { color: cs.color.replace(/\s/g, ""), bg: cs.backgroundColor.replace(/\s/g, "") };
          });
          expect(secretInk.color).toMatch(/rgb\(0,0,0\)/);
          expect(secretInk.bg).toMatch(/rgb\(251,73,3\)/);
          await expect(page.getByRole("button", { name: "Listo, pasá el celu" })).toBeVisible();
          await expect(page.getByText(/Listos:/)).toHaveCount(0);
          await expect(page.getByTestId("clock-preset-30")).toHaveCount(0);
        }
        await assertLayout(page);
      }

      await page.goto("/juego/reflejos/local");
      await page.getByRole("button", { name: /Empezar/ }).click();
      const reflexHandoff = page.getByTestId("handoff-screen");
      if (await reflexHandoff.isVisible()) {
        await page.getByTestId("handoff-continue").click();
      }
      const hint = page.getByTestId("reflex-hint");
      await expect(hint).toBeVisible();
      const wraps = await hint.evaluate((el) => el.scrollHeight > el.clientHeight + 2);
      expect(wraps, "Frená lo más cerca posible se parte").toBe(false);
      await assertLayout(page);

      await page.getByTestId("exit-button").click();
      await expect(page.getByTestId("confirm-exit")).toBeVisible();
      await assertLayout(page);
    });
  }
});
