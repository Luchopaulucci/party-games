import { createServer } from "node:http";
import { io as clientIo, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CAPACITOR_ORIGINS,
  isLocalNetworkOrigin,
  isOriginAllowed,
  resolveAllowedOrigins,
  socketIoCors,
  type OriginPolicy,
} from "@/server/origins";
import { createRealtimeServer } from "@/server/realtime";

type Hello = { ok: boolean; error?: string; code?: string; playerId?: string; token?: string };

describe("CORS de Socket.IO", () => {
  it("en producción ALLOWED_ORIGINS solo suma, y el propio origen + Capacitor + Render siempre entran", () => {
    const allowed = resolveAllowedOrigins({
      nodeEnv: "production",
      allowedOrigins: "https://previa.example/,https://otro.test",
      renderExternalUrl: "https://la-previa.onrender.com/",
      port: 3000,
    });
    expect(allowed).not.toBe(true);
    if (allowed === true) return;
    expect(allowed.allowLocalNetwork).toBe(false);
    expect(allowed.list).toEqual(
      expect.arrayContaining([
        "https://previa.example",
        "https://otro.test",
        "https://la-previa.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        ...CAPACITOR_ORIGINS,
      ]),
    );
    expect(isOriginAllowed("https://evil.example", allowed)).toBe(false);
    expect(isOriginAllowed("capacitor://localhost", allowed)).toBe(true);
    expect(isOriginAllowed("https://localhost", allowed)).toBe(true);
    expect(isOriginAllowed("http://localhost", allowed)).toBe(true);
    expect(isOriginAllowed("http://localhost:3000", allowed)).toBe(true);
    expect(isOriginAllowed("https://la-previa.onrender.com", allowed)).toBe(true);
    expect(isOriginAllowed(undefined, allowed)).toBe(true);
  });

  it("en producción sin ALLOWED_ORIGINS acepta mismo origen, localhost/LAN cualquier puerto y Capacitor", () => {
    const allowed = resolveAllowedOrigins({
      nodeEnv: "production",
      allowedOrigins: "",
      renderExternalUrl: "",
      port: 3000,
    });
    expect(allowed).not.toBe(true);
    if (allowed === true) return;
    expect(allowed.allowLocalNetwork).toBe(true);
    expect(allowed.list).toEqual(expect.arrayContaining(["http://localhost:3000", "http://127.0.0.1:3000", ...CAPACITOR_ORIGINS]));
    expect(isOriginAllowed("http://localhost:3100", allowed)).toBe(true);
    expect(isOriginAllowed("http://127.0.0.1:9999", allowed)).toBe(true);
    expect(isOriginAllowed("http://192.168.1.20:8080", allowed)).toBe(true);
    expect(isOriginAllowed("http://10.0.0.4:3000", allowed)).toBe(true);
    expect(isOriginAllowed("https://random.site", allowed)).toBe(false);
    expect(isLocalNetworkOrigin("http://172.16.5.2:4000")).toBe(true);
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
    vi.restoreAllMocks();
  });

  async function listen(allowed: OriginPolicy | string[]) {
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

  function hello(socket: Socket, payload: Record<string, unknown>) {
    return new Promise<Hello>((resolve) => socket.emit("hello", payload, resolve));
  }

  it("acepta un origen de la lista y rechaza uno de afuera", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
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
    expect(warn.mock.calls.some((call) => String(call[0]).includes("origen rechazado") && String(call[0]).includes("evil.example"))).toBe(
      true,
    );
  });

  it("prod sin ALLOWED_ORIGINS crea y entra sala desde localhost:3100", async () => {
    const policy = resolveAllowedOrigins({
      nodeEnv: "production",
      allowedOrigins: "",
      renderExternalUrl: "",
      port: 3000,
    });
    const url = await listen(policy);

    const host = clientIo(url, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      extraHeaders: { Origin: "http://localhost:3100" },
    });
    await new Promise<void>((resolve, reject) => {
      host.on("connect", () => resolve());
      host.on("connect_error", (err) => reject(err));
    });
    const created = await hello(host, { intent: "create", name: "Lucho" });
    expect(created.ok).toBe(true);
    expect(created.code).toMatch(/^[A-Z0-9]{4}$/);

    const guest = clientIo(url, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      extraHeaders: { Origin: "http://192.168.0.12:8080" },
    });
    await new Promise<void>((resolve, reject) => {
      guest.on("connect", () => resolve());
      guest.on("connect_error", (err) => reject(err));
    });
    const joined = await hello(guest, { intent: "join", name: "Meli", code: created.code });
    expect(joined.ok).toBe(true);
    expect(joined.code).toBe(created.code);

    host.close();
    guest.close();
  });
});
