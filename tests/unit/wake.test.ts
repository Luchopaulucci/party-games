import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ORIGIN_FAIL_MESSAGE,
  WAKE_FAIL_MESSAGE,
  WAKE_MESSAGE,
  WAKE_WINDOW_MS,
  connectFailureStatus,
  isOriginConnectError,
  wakeStatus,
} from "@/lib/wake";

describe("despertar Render free", () => {
  it("durante ~60s muestra Despertando el servidor… y después falla", () => {
    expect(wakeStatus(0)).toEqual({ kind: "waking", message: WAKE_MESSAGE });
    expect(wakeStatus(WAKE_WINDOW_MS - 1)).toEqual({ kind: "waking", message: WAKE_MESSAGE });
    expect(wakeStatus(WAKE_WINDOW_MS)).toEqual({ kind: "failed", message: WAKE_FAIL_MESSAGE });
    expect(WAKE_MESSAGE).toBe("Despertando el servidor…");
    expect(WAKE_WINDOW_MS).toBe(60_000);
  });

  it("un CORS / origen rechazado no se disfraza de servidor dormido", () => {
    expect(isOriginConnectError({ message: "Origen no permitido" })).toBe(true);
    expect(isOriginConnectError({ message: "xhr poll error" })).toBe(false);
    expect(connectFailureStatus(1_000, { message: "Origen no permitido" })).toEqual({
      kind: "origin",
      message: ORIGIN_FAIL_MESSAGE,
    });
    expect(connectFailureStatus(1_000, { message: "timeout" })).toEqual({
      kind: "waking",
      message: WAKE_MESSAGE,
    });
    expect(connectFailureStatus(WAKE_WINDOW_MS, { message: "timeout" })).toEqual({
      kind: "failed",
      message: WAKE_FAIL_MESSAGE,
    });
    expect(ORIGIN_FAIL_MESSAGE).toMatch(/Reintentar/);
    expect(WAKE_FAIL_MESSAGE).toMatch(/Probá de nuevo/);
  });

  it("el cliente de sala corta CORS vs wake y muestra Reintentar", () => {
    const src = readFileSync(new URL("../../components/online/RoomClient.tsx", import.meta.url), "utf8");
    expect(src).toContain("connectFailureStatus");
    expect(src).toContain("ORIGIN_FAIL_MESSAGE");
    expect(src).toContain("Reintentar");
    expect(src).toContain("socket-retry");
    expect(src).toContain("reconnectionAttempts: 8");
  });
});
