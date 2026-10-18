import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("fuente empaquetada", () => {
  it("Source Code Pro entra por next/font, no por CDN", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain('from "next/font/google"');
    expect(layout).toContain("Source_Code_Pro");
    expect(layout).toContain("preload: true");
    const app = readFileSync("app/layout.tsx", "utf8") + readFileSync("app/globals.css", "utf8");
    expect(app).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });
});
