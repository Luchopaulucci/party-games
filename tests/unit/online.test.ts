import { describe, expect, it } from "vitest";
import {
  ONLINE_NO_SERVER_MESSAGE,
  ONLINE_OFFLINE_MESSAGE,
  configuredSocketUrl,
  resolveOnlineAccess,
} from "@/lib/online";
import { juegoStaticParams } from "@/lib/static-routes";
import { GAME_IDS } from "@/shared/types";

describe("acceso online", () => {
  it("en web sin SOCKET_URL sigue el origen actual", () => {
    expect(configuredSocketUrl("")).toBeUndefined();
    expect(configuredSocketUrl("  http://localhost:3001/  ")).toBe("http://localhost:3001");
    expect(resolveOnlineAccess({ native: false, online: true, socketUrl: undefined })).toEqual({ ok: true });
  });

  it("en la APK sin server o sin red muestra un mensaje y no tira el modo local", () => {
    expect(resolveOnlineAccess({ native: true, online: true, socketUrl: undefined })).toEqual({
      ok: false,
      message: ONLINE_NO_SERVER_MESSAGE,
    });
    expect(resolveOnlineAccess({ native: true, online: false, socketUrl: "https://server.example" })).toEqual({
      ok: false,
      message: ONLINE_OFFLINE_MESSAGE,
    });
    expect(resolveOnlineAccess({ native: true, online: true, socketUrl: "https://server.example" })).toEqual({
      ok: true,
    });
  });
});

describe("export estático", () => {
  it("pregenera los 15 juegos para la APK", () => {
    expect(juegoStaticParams()).toEqual(GAME_IDS.map((id) => ({ id })));
  });
});
