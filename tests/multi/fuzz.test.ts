import { createServer } from "node:http";
import { io as clientIo, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import { createRealtimeServer } from "@/server/realtime";
import { BAD_PAYLOAD_ERROR } from "@/shared/protocol";

type Hello = { ok: boolean; error?: string; code?: string; playerId?: string; token?: string };

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
  const box: { last?: Record<string, unknown> } = {};
  socket.on("state", (state: Record<string, unknown>) => {
    box.last = state;
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

function waitFor(box: { last?: Record<string, unknown> }, socket: Socket, pred: (s: Record<string, unknown>) => boolean, ms = 4000) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    if (box.last && pred(box.last)) {
      resolve(box.last);
      return;
    }
    const t = setTimeout(() => reject(new Error("timeout waitFor")), ms);
    const onState = (state: Record<string, unknown>) => {
      if (pred(state)) {
        clearTimeout(t);
        socket.off("state", onState);
        resolve(state);
      }
    };
    socket.on("state", onState);
  });
}

describe("payloads malformados y limpieza", () => {
  const cleanups: Array<() => Promise<void> | void> = [];

  afterEach(async () => {
    while (cleanups.length) await cleanups.pop()?.();
  });

  it("hello/action podridos no tiran el server ni tocan otras salas", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });

    const host = connect(srv.url);
    const guest = connect(srv.url);
    const evil = connect(srv.url);
    cleanups.push(() => {
      host.socket.disconnect();
      guest.socket.disconnect();
      evil.socket.disconnect();
    });
    await Promise.all([waitConnected(host.socket), waitConnected(guest.socket), waitConnected(evil.socket)]);

    const created = await hello(host.socket, { intent: "create", name: "Lucho" });
    expect(created.ok).toBe(true);
    const joined = await hello(guest.socket, { intent: "join", name: "Meli", code: created.code });
    expect(joined.ok).toBe(true);
    await waitFor(host.box, host.socket, (s) => (s.players as unknown[]).length === 2);

    const started = await ack(host.socket, "startGame", {
      gameId: "closest",
      seed: { prompt: "¿2+2?", trueAnswer: 4, questionId: "math" },
    });
    expect(started.ok).toBe(true);
    await waitFor(host.box, host.socket, (s) => s.gameId === "closest");

    const junk: Array<{ event: string; data?: unknown }> = [
      { event: "hello", data: { intent: "create", name: 123 } },
      { event: "hello", data: { intent: "create", name: null } },
      { event: "hello", data: { intent: "join", name: "X", code: 123 } },
      { event: "hello", data: { intent: "join", name: "X", code: { trim: "NO" } } },
      { event: "hello", data: { intent: "join", name: "X", code: ["AAAA"] } },
      { event: "hello", data: { intent: "create" } },
      { event: "hello", data: null },
      { event: "hello", data: "create" },
      { event: "startGame", data: { gameId: 1 } },
      { event: "startGame", data: { gameId: "closest", categories: Array.from({ length: 40 }, () => "animales") } },
      { event: "startGame", data: { gameId: "closest", picante: "yes" } },
      { event: "action", data: null },
      { event: "action", data: { type: 1 } },
      { event: "action", data: { type: "guess", payload: { value: { nope: true } } } },
      { event: "action", data: { type: "x".repeat(80) } },
      { event: "action", data: { type: "stroke", payload: { stroke: { color: "red", points: [null] } } } },
      { event: "nextRound", data: { sneaky: true } },
    ];

    for (const item of junk) {
      const res = await ack(evil.socket, item.event, item.data);
      expect(res.ok).toBe(false);
      expect(res.error).toBeTruthy();
    }

    const namedBad = await hello(evil.socket, { intent: "create", name: 123 });
    expect(namedBad.ok).toBe(false);
    expect(namedBad.error).toBe(BAD_PAYLOAD_ERROR);

    const healthyGuess = await ack(host.socket, "action", { type: "guess", payload: { value: 4 } });
    expect(healthyGuess.ok).toBe(true);
    await waitFor(guest.box, guest.socket, (s) => {
      const pub = s.public as { submittedIds?: string[] } | null;
      return Boolean(pub?.submittedIds?.length);
    });

    expect(srv.rooms.rooms.has(created.code!)).toBe(true);
    expect(srv.rooms.rooms.get(created.code!)!.status).toBe("playing");

    const extra = await hello(evil.socket, { intent: "create", name: "Nuevo" });
    expect(extra.ok).toBe(true);
    expect(extra.code).not.toBe(created.code);
    expect(srv.rooms.rooms.has(created.code!)).toBe(true);
    expect(srv.rooms.rooms.has(extra.code!)).toBe(true);
  });

  it("un socket no queda en dos salas si manda hello dos veces", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });
    const a = connect(srv.url);
    cleanups.push(() => {
      a.socket.disconnect();
    });
    await waitConnected(a.socket);

    const first = await hello(a.socket, { intent: "create", name: "Uno" });
    const second = await hello(a.socket, { intent: "create", name: "Dos" });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    const room1 = srv.rooms.rooms.get(first.code!);
    const room2 = srv.rooms.rooms.get(second.code!);
    expect(room1).toBeTruthy();
    expect(room2).toBeTruthy();
    expect(room1!.seats[0]!.connected).toBe(false);
    expect(room2!.seats[0]!.connected).toBe(true);
    expect(a.socket.id).toBeTruthy();
    expect(room2!.seats[0]!.socketIds.has(a.socket.id!)).toBe(true);
    expect(room1!.seats[0]!.socketIds.size).toBe(0);
  });

  it("limpia una sala vacía por TTL sin tocar la sala activa", async () => {
    let now = 10_000;
    const srv = await listen({ emptyRoomTtlMs: 200, sweepIntervalMs: 0, now: () => now });
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });

    const alive = connect(srv.url);
    const ghost = connect(srv.url);
    cleanups.push(() => {
      alive.socket.disconnect();
      ghost.socket.disconnect();
    });
    await Promise.all([waitConnected(alive.socket), waitConnected(ghost.socket)]);

    const keep = await hello(alive.socket, { intent: "create", name: "Viva" });
    const drop = await hello(ghost.socket, { intent: "create", name: "Fantasma" });
    expect(keep.ok && drop.ok).toBe(true);
    if (!keep.ok || !drop.ok) return;

    ghost.socket.disconnect();
    await new Promise((r) => setTimeout(r, 30));
    now += 250;
    srv.rooms.sweepRooms();

    expect(srv.rooms.rooms.has(drop.code!)).toBe(false);
    expect(srv.rooms.rooms.has(keep.code!)).toBe(true);
  });

  it("un trazo de Dibujo con points:[null] no tumba el server ni la otra sala", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });
    const host = connect(srv.url);
    const guest = connect(srv.url);
    const third = connect(srv.url);
    const other = connect(srv.url);
    cleanups.push(() => {
      host.socket.disconnect();
      guest.socket.disconnect();
      third.socket.disconnect();
      other.socket.disconnect();
    });
    await Promise.all([
      waitConnected(host.socket),
      waitConnected(guest.socket),
      waitConnected(third.socket),
      waitConnected(other.socket),
    ]);

    const created = await hello(host.socket, { intent: "create", name: "Lucho" });
    const joined = await hello(guest.socket, { intent: "join", name: "Meli", code: created.code });
    const joined3 = await hello(third.socket, { intent: "join", name: "Coco", code: created.code });
    expect(created.ok && joined.ok && joined3.ok).toBe(true);
    await waitFor(host.box, host.socket, (s) => (s.players as unknown[]).length === 3);
    const otherRoom = await hello(other.socket, { intent: "create", name: "Otra" });
    expect(otherRoom.ok).toBe(true);

    const started = await ack(host.socket, "startGame", {
      gameId: "dibuja",
      seed: { word: "mate", targetId: created.playerId },
    });
    expect(started.ok).toBe(true);
    await waitFor(host.box, host.socket, (s) => s.gameId === "dibuja");

    const stroke = await ack(host.socket, "action", {
      type: "stroke",
      payload: { stroke: { color: "not-a-color", points: [null, { x: 1, y: 2 }] } },
    });
    expect(stroke.ok).toBe(true);
    expect(srv.rooms.rooms.has(created.code!)).toBe(true);
    expect(srv.rooms.rooms.has(otherRoom.code!)).toBe(true);

    const still = await hello(other.socket, { intent: "create", name: "Sigo" });
    expect(still.ok).toBe(true);
  });
});
