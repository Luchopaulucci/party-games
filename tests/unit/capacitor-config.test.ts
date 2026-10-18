import { describe, expect, it } from "vitest";
import { createCapacitorConfig } from "../../capacitor.config";

describe("capacitor config", () => {
  it("en el build de la APK (sin CAP_DEV) no hay cleartext ni mixed content", () => {
    const config = createCapacitorConfig({} as NodeJS.ProcessEnv);
    expect(config.server?.cleartext).toBeUndefined();
    expect(config.android?.allowMixedContent).toBeUndefined();
  });

  it("CAP_DEV=1 deja cleartext para desarrollo local", () => {
    const config = createCapacitorConfig({ CAP_DEV: "1" } as NodeJS.ProcessEnv);
    expect(config.server?.cleartext).toBe(true);
    expect(config.android?.allowMixedContent).toBe(true);
  });
});
