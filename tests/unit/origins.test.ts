import { createServer } from "node:http";
import { io as clientIo } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import {
  CAPACITOR_ORIGINS,
  isOriginAllowed,
  resolveAllowedOrigins,
  socketIoCors,
} from "@/server/origins";
import { createRealtimeServer } from "@/server/realtime";

describe("CORS de Socket.IO", () => {
  it("en producción nunca es * y suma Capacitor + ALLOWED_ORIGINS + URL de Render", () => {
    const allowed = resolveAllowedOrigins({
      nodeEnv: "production",
      allowedOrigins: "https://previa.example/,https://otro.test",
      renderExternalUrl: "https://la-previa.onrender.com/",
    });
    expect(allowed).not.toBe(true);
    expect(allowed).toEqual(
      expect.arrayContaining([
        "https://previa.example",
        "https://otro.test",
        "https://la-previa.onrender.com",
        ...CAPACITOR_ORIGINS,
      ]),
    );
    expect(isOriginAllowed("https://evil.example", allowed)).toBe(false);
    expect(isOriginAllowed("capacitor://localhost", allowed)).toBe(true);
    expect(isOriginAllowed("https://localhost", allowed)).toBe(true);
    expect(isOriginAllowed("http://localhost", allowed)).toBe(true);
    expect(isOriginAllowed("https://la-previa.onrender.com", allowed)).toBe(true);
    expect(isOriginAllowed(undefined, allowed)).toBe(true);
  });

  it("en producción sin env solo deja Capacitor (nada de reflejar cualquier origen)", () => {
    const allowed = resolveAllowedOrigins({ nodeEnv: "production", allowedOrigins: "", renderExternalUrl: "" });
    expect(allowed).toEqual([...CAPACITOR_ORIGINS]);
    expect(isOriginAllowed("https://random.site", allowed)).toBe(false);
  });

  it("en desarrollo permite cualquier origen", () => {
    expect(resolveAllowedOrigins({ nodeEnv: "development" })).toBe(true);
    expect(isOriginAllowed("https://lo-que-sea.test", true)).toBe(true);
    const cors = socketIoCors(true);
    expect(cors).toEqual({ origin: true, credentials: true });
  });
});

describe("handshake CORS", () => {
  const cleanups: Array<() => Promise<void> | void> = [];

  afterEach(async () => {
    while (cleanups.length) await cleanups.pop()?.();
  });

  async function listen(allowed: string[] | true) {
    const httpServer = createServer();
    const { io } = createRealtimeServer(httpServer, { allowedOrigins: allowed, allowTestSeeds: true });
    await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const address = httpServer.address();
    if (!address || typeof address === "string") throw new Error("sin puerto");
    cleanups.push(() => {
      io.close();
      httpServer.close();
    });
    return `http://127.0.0.1:${address.port}`;
  }

  it("acepta un origen de la lista y rechaza uno de afuera", async () => {
    const url = await listen(["https://previa.example", "capacitor://localhost"]);

    const ok = clientIo(url, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      extraHeaders: { Origin: "capacitor://localhost" },
    });
    await new Promise<void>((resolve, reject) => {
      ok.on("connect", () => resolve());
      ok.on("connect_error", (err) => reject(err));
    });
    ok.close();

    const bad = clientIo(url, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      extraHeaders: { Origin: "https://evil.example" },
    });
    await new Promise<void>((resolve, reject) => {
      bad.on("connect", () => reject(new Error("el origen rechazado no debería conectar")));
      bad.on("connect_error", () => resolve());
    });
    bad.close();
  });
});
