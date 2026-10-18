import { describe, expect, it } from "vitest";
import { WAKE_FAIL_MESSAGE, WAKE_MESSAGE, WAKE_WINDOW_MS, wakeStatus } from "@/lib/wake";

describe("despertar Render free", () => {
  it("durante ~60s muestra Despertando el servidor… y después falla", () => {
    expect(wakeStatus(0)).toEqual({ kind: "waking", message: WAKE_MESSAGE });
    expect(wakeStatus(WAKE_WINDOW_MS - 1)).toEqual({ kind: "waking", message: WAKE_MESSAGE });
    expect(wakeStatus(WAKE_WINDOW_MS)).toEqual({ kind: "failed", message: WAKE_FAIL_MESSAGE });
    expect(WAKE_MESSAGE).toBe("Despertando el servidor…");
    expect(WAKE_WINDOW_MS).toBe(60_000);
  });
});
