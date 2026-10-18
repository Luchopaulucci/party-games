import { describe, expect, it } from "vitest";
import { brandUsesConfirm, shouldGuardNavigation } from "@/lib/exit-guard";

describe("salida por logo y navegación", () => {
  it("con partida activa el logo pide ConfirmExit, no navega solo", () => {
    expect(brandUsesConfirm(undefined)).toBe(false);
    expect(brandUsesConfirm(() => undefined)).toBe(true);
    expect(shouldGuardNavigation(() => undefined)).toBe(true);
    expect(shouldGuardNavigation(null)).toBe(false);
  });
});
