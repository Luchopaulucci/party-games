import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("fuente empaquetada", () => {
  it("Bowlby One local e Inter entran por next/font, no por CDN", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain('from "next/font/local"');
    expect(layout).toContain("BowlbyOne-Regular.woff2");
    expect(layout).toContain("Inter");
    expect(layout).toContain('display: "swap"');
    expect(layout).toContain("preload: true");
    expect(layout).toContain("display.variable");
    expect(layout).toContain("display.className");
    const app = readFileSync("app/layout.tsx", "utf8") + readFileSync("app/globals.css", "utf8");
    expect(app).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
    expect(layout).not.toContain("Source_Code_Pro");
  });
});
