import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test.describe("prefers-reduced-motion", () => {
  test("no corre GSAP ni animaciones CSS", async ({ page }) => {
    const cdn: string[] = [];
    page.on("request", (req) => {
      if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(req.url())) cdn.push(req.url());
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "previa:local:roster:v1",
        JSON.stringify([
          { id: "p1", name: "Lucho", color: "#C42B54" },
          { id: "p2", name: "Meli", color: "#1D4ED8" },
          { id: "p3", name: "Coco", color: "#A16207" },
        ]),
      );
    });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForTimeout(400);

    const motion = await page.evaluate(() => {
      const css = (document.getAnimations?.() ?? []).filter((a) => a.playState === "running").length;
      const gsapRef = (window as Window & { gsap?: { globalTimeline: { getChildren: (a?: boolean, b?: boolean, c?: boolean) => { isActive: () => boolean }[] } } }).gsap;
      const kids = gsapRef?.globalTimeline.getChildren(true, true, true) ?? [];
      const gsapActive = kids.filter((t) => t.isActive()).length;
      const word = document.querySelector(".wordmark-previa");
      const opacity = word ? Number(getComputedStyle(word).opacity) : 1;
      return { css, gsapActive, opacity };
    });

    expect(cdn, cdn.join(" ")).toEqual([]);
    expect(motion.css, "animaciones CSS corriendo").toBe(0);
    expect(motion.gsapActive, "tweens GSAP activos").toBe(0);
    expect(motion.opacity).toBeGreaterThan(0.99);

    await page.goto("/juego/closest/local");
    await page.getByRole("button", { name: /Empezar/ }).click();
    const handoff = page.getByTestId("handoff-screen");
    if (await handoff.isVisible().catch(() => false)) {
      await page.getByTestId("handoff-continue").click();
    }
    await page.waitForTimeout(400);
    const playMotion = await page.evaluate(() => {
      const css = (document.getAnimations?.() ?? []).filter((a) => a.playState === "running").length;
      const gsapRef = (window as Window & { gsap?: { globalTimeline: { getChildren: (a?: boolean, b?: boolean, c?: boolean) => { isActive: () => boolean }[] } } }).gsap;
      const kids = gsapRef?.globalTimeline.getChildren(true, true, true) ?? [];
      return { css, gsapActive: kids.filter((t) => t.isActive()).length };
    });
    expect(playMotion.css).toBe(0);
    expect(playMotion.gsapActive).toBe(0);
  });
});
