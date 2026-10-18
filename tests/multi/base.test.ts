import { createServer } from "node:http";
import { io as clientIo, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import { createRealtimeServer } from "@/server/realtime";

type Hello = { ok: boolean; error?: string; code?: string; playerId?: string; token?: string; closed?: boolean };

async function listen(opts: { emptyRoomTtlMs?: number; sweepIntervalMs?: number; now?: () => number } = {}) {
  const httpServer = createServer();
  const { io, rooms } = createRealtimeServer(httpServer, {
    hostGraceMs: 80,
    allowTestSeeds: true,
    emptyRoomTtlMs: opts.emptyRoomTtlMs,
    sweepIntervalMs: opts.sweepIntervalMs ?? 0,
    now: opts.now,
  });
  await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const address = httpServer.address();
  if (!address || typeof address === "string") throw new Error("sin puerto");
  return { httpServer, io, rooms, url: `http://127.0.0.1:${address.port}` };
}

function connect(url: string) {
  const socket = clientIo(url, { transports: ["websocket"], forceNew: true, reconnection: false });
  const box: { last?: Record<string, unknown>; closed?: { text?: string } } = {};
  socket.on("state", (state: Record<string, unknown>) => {
    box.last = state;
  });
  socket.on("roomClosed", (payload: { text?: string }) => {
    box.closed = payload;
  });
  return { socket, box };
}

function hello(socket: Socket, payload: unknown) {
  return new Promise<Hello>((resolve) => socket.emit("hello", payload, resolve));
}

function ack(socket: Socket, event: string, payload?: unknown) {
  return new Promise<Hello>((resolve) => {
    if (payload === undefined) socket.emit(event, resolve);
    else socket.emit(event, payload, resolve);
  });
}

function waitConnected(socket: Socket) {
  return socket.connected ? Promise.resolve() : new Promise<void>((r) => socket.on("connect", () => r()));
}

function waitFor(box: { last?: Record<string, unknown> }, pred: (s: Record<string, unknown>) => boolean, ms = 4000) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    if (box.last && pred(box.last)) {
      resolve(box.last);
      return;
    }
    const t = setTimeout(() => reject(new Error("timeout waitFor")), ms);
    const onTick = setInterval(() => {
      if (box.last && pred(box.last)) {
        clearTimeout(t);
        clearInterval(onTick);
        resolve(box.last);
      }
    }, 20);
  });
}

describe("base de red", () => {
  const cleanups: Array<() => Promise<void> | void> = [];

  afterEach(async () => {
    while (cleanups.length) await cleanups.pop()?.();
  });

  it("si sale el admin se cierra la sala para todos", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });
    const host = connect(srv.url);
    const guest = connect(srv.url);
    cleanups.push(() => {
      host.socket.disconnect();
      guest.socket.disconnect();
    });
    await Promise.all([waitConnected(host.socket), waitConnected(guest.socket)]);
    const created = await hello(host.socket, { intent: "create", name: "Lucho" });
    const joined = await hello(guest.socket, { intent: "join", name: "Meli", code: created.code });
    expect(created.ok && joined.ok).toBe(true);
    await waitFor(guest.box, (s) => (s.players as unknown[]).length === 2);

    const left = await ack(host.socket, "leaveRoom");
    expect(left.ok).toBe(true);
    expect(left.closed).toBe(true);
    await new Promise((r) => setTimeout(r, 40));
    expect(guest.box.closed?.text).toMatch(/cayó|fue/i);
    expect(srv.rooms.rooms.has(created.code!)).toBe(false);
  });

  it("si sale un jugador no afecta a los demás", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });
    const host = connect(srv.url);
    const guest = connect(srv.url);
    const other = connect(srv.url);
    cleanups.push(() => {
      host.socket.disconnect();
      guest.socket.disconnect();
      other.socket.disconnect();
    });
    await Promise.all([waitConnected(host.socket), waitConnected(guest.socket), waitConnected(other.socket)]);
    const created = await hello(host.socket, { intent: "create", name: "Lucho" });
    await hello(guest.socket, { intent: "join", name: "Meli", code: created.code });
    await hello(other.socket, { intent: "join", name: "Coco", code: created.code });
    await waitFor(host.box, (s) => (s.players as unknown[]).length === 3);

    const left = await ack(guest.socket, "leaveRoom");
    expect(left.ok).toBe(true);
    expect(left.closed).toBe(false);
    await waitFor(host.box, (s) => (s.players as { name: string }[]).every((p) => p.name !== "Meli"));
    expect(srv.rooms.rooms.has(created.code!)).toBe(true);
    expect((host.box.last?.players as { name: string }[]).map((p) => p.name).sort()).toEqual(["Coco", "Lucho"]);
    expect(other.box.closed).toBeUndefined();
  });

  it("reconecta al mismo asiento y aísla salas", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });
    const host = connect(srv.url);
    const guest = connect(srv.url);
    const other = connect(srv.url);
    cleanups.push(() => {
      host.socket.disconnect();
      guest.socket.disconnect();
      other.socket.disconnect();
    });
    await Promise.all([waitConnected(host.socket), waitConnected(guest.socket), waitConnected(other.socket)]);
    const a = await hello(host.socket, { intent: "create", name: "Lucho" });
    const joined = await hello(guest.socket, { intent: "join", name: "Meli", code: a.code });
    const b = await hello(other.socket, { intent: "create", name: "Otra" });
    expect(a.code).not.toBe(b.code);
    await waitFor(host.box, (s) => (s.players as unknown[]).length === 2);

    guest.socket.disconnect();
    const back = connect(srv.url);
    cleanups.push(() => {
      back.socket.disconnect();
    });
    await waitConnected(back.socket);
    const again = await hello(back.socket, { intent: "join", name: "Meli", code: a.code, token: joined.token });
    expect(again.ok).toBe(true);
    expect(again.playerId).toBe(joined.playerId);
    await waitFor(host.box, (s) => (s.players as { connected: boolean }[]).filter((p) => p.connected).length === 2);
    expect(JSON.stringify(host.box.last)).not.toContain(b.code);
  });

  it("la sala vacía se limpia", async () => {
    let now = 1_000;
    const srv = await listen({ emptyRoomTtlMs: 200, sweepIntervalMs: 0, now: () => now });
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });
    const host = connect(srv.url);
    cleanups.push(() => {
      host.socket.disconnect();
    });
    await waitConnected(host.socket);
    const created = await hello(host.socket, { intent: "create", name: "Lucho" });
    expect(created.ok).toBe(true);

    const closed = await ack(host.socket, "leaveRoom");
    expect(closed.closed).toBe(true);
    expect(srv.rooms.rooms.has(created.code!)).toBe(false);

    const ghost = connect(srv.url);
    cleanups.push(() => {
      ghost.socket.disconnect();
    });
    await waitConnected(ghost.socket);
    const empty = await hello(ghost.socket, { intent: "create", name: "Huérfana" });
    ghost.socket.disconnect();
    await new Promise((r) => setTimeout(r, 20));
    now += 250;
    srv.rooms.sweepRooms();
    expect(srv.rooms.rooms.has(empty.code!)).toBe(false);
  });
});
