import { createServer } from "node:http";
import { io as clientIo, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import { createRealtimeServer } from "@/server/realtime";

type Hello = { ok: boolean; error?: string; code?: string; playerId?: string; token?: string };
type Client = ReturnType<typeof connect>;

async function listen() {
  const httpServer = createServer();
  const { io, rooms } = createRealtimeServer(httpServer, { hostGraceMs: 80, allowTestSeeds: true });
  await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const address = httpServer.address();
  if (!address || typeof address === "string") throw new Error("sin puerto");
  return { httpServer, io, rooms, url: `http://127.0.0.1:${address.port}` };
}

function connect(url: string) {
  const socket = clientIo(url, { transports: ["websocket"], forceNew: true, reconnection: false });
  const events: unknown[] = [];
  const box: { last?: Record<string, unknown> } = {};
  socket.onAny((_ev, payload) => events.push(payload));
  socket.on("state", (state: Record<string, unknown>) => {
    box.last = state;
  });
  return { socket, events, box };
}

function hello(socket: Socket, payload: Record<string, unknown>) {
  return new Promise<Hello>((resolve) => socket.emit("hello", payload, resolve));
}

function assertNoBallotMap(events: unknown[]) {
  const walk = (node: unknown, path: string) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
      return;
    }
    const rec = node as Record<string, unknown>;
    if ("votes" in rec && rec.votes && typeof rec.votes === "object" && !Array.isArray(rec.votes)) {
      throw new Error(`mapa de votos filtrado en ${path}`);
    }
    for (const [key, value] of Object.entries(rec)) {
      walk(value, `${path}.${key}`);
    }
  };
  events.forEach((ev, i) => walk(ev, `event${i}`));
}

function waitFor(
  client: Client,
  pred: (state: Record<string, unknown>) => boolean,
  label = "state",
  ms = 4000,
) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    if (client.box.last && pred(client.box.last)) {
      resolve(client.box.last);
      return;
    }
    const t = setTimeout(() => reject(new Error(`timeout waitFor: ${label}`)), ms);
    const onState = (state: Record<string, unknown>) => {
      if (pred(state)) {
        clearTimeout(t);
        client.socket.off("state", onState);
        resolve(state);
      }
    };
    client.socket.on("state", onState);
  });
}

describe("multi-client rooms", () => {
  const cleanups: Array<() => Promise<void> | void> = [];

  afterEach(async () => {
    while (cleanups.length) await cleanups.pop()?.();
  });

  it("6 jugadores, reconexión, host, aislamiento y cero fugas de secretos", async () => {
    const srv = await listen();
    cleanups.push(() => {
      srv.rooms.dispose();
      srv.io.close();
      srv.httpServer.close();
    });

    const names = ["Lucho", "Meli", "Coco", "Wanda", "Dibu", "Moria"];
    const clients = names.map((name) => ({ name, ...connect(srv.url) }));
    cleanups.push(() => {
      for (const c of clients) c.socket.disconnect();
    });

    await Promise.all(
      clients.map((c) =>
        c.socket.connected ? Promise.resolve() : new Promise<void>((r) => c.socket.on("connect", () => r())),
      ),
    );

    const created = await hello(clients[0]!.socket, { intent: "create", name: names[0] });
    expect(created.ok).toBe(true);
    const code = created.code!;
    const seats = [
      { name: names[0]!, playerId: created.playerId!, token: created.token!, client: clients[0]! },
    ];

    for (let i = 1; i < 6; i += 1) {
      const res = await hello(clients[i]!.socket, { intent: "join", name: names[i], code });
      expect(res.ok).toBe(true);
      seats.push({ name: names[i]!, playerId: res.playerId!, token: res.token!, client: clients[i]! });
    }

    await waitFor(clients[0]!, (s) => (s.players as unknown[]).length === 6, "6 players");

    clients[0]!.socket.emit("startGame", {
      gameId: "closest",
      seed: { prompt: "¿2+2?", trueAnswer: 4, questionId: "math" },
    });
    await waitFor(clients[0]!, (s) => s.gameId === "closest", "closest started");

    clients[2]!.socket.emit("action", { type: "guess", payload: { value: 5 } });
    await waitFor(clients[2]!, (s) => Boolean((s.private as { guess?: number })?.guess), "coco guessed");

    const coco = seats[2]!;
    const cocoEventsBefore = coco.client.events.length;
    coco.client.socket.disconnect();

    const coco2 = connect(srv.url);
    cleanups.push(() => coco2.socket.disconnect());
    await new Promise<void>((r) => coco2.socket.on("connect", () => r()));
    const reclaimed = await hello(coco2.socket, {
      intent: "join",
      name: "CocoFake",
      code,
      token: coco.token,
    });
    expect(reclaimed.playerId).toBe(coco.playerId);
    const cocoState = await waitFor(
      coco2,
      (s) => Boolean(s.you && (s.you as { id: string }).id === coco.playerId),
      "coco reclaimed",
    );
    expect((cocoState.you as { score: number }).score).toBe(0);
    expect((cocoState.private as { guess: number }).guess).toBe(5);
    expect(coco2.events.length + cocoEventsBefore).toBeGreaterThan(0);

    for (const [i, seat] of seats.entries()) {
      const sock = i === 2 ? coco2.socket : seat.client.socket;
      if (i !== 2) sock.emit("action", { type: "guess", payload: { value: 10 + i } });
    }
    const finishedClosest = await waitFor(coco2, (s) => s.status === "finished", "closest finished");
    const cocoScore = (finishedClosest.players as { id: string; score: number }[]).find((p) => p.id === coco.playerId)?.score;
    expect(cocoScore).toBeGreaterThan(0);

    clients[0]!.socket.emit("toLobby");
    await waitFor(clients[0]!, (s) => s.status === "lobby", "back to lobby");

    const secretWord = "supercalifragilistico";
    const impostorId = seats[3]!.playerId;
    const watch = [clients[0]!, clients[1]!, coco2, clients[3]!, clients[4]!, clients[5]!];
    const startAt = watch.map((c) => c.events.length);
    clients[0]!.socket.emit("startGame", {
      gameId: "impostor",
      seed: { word: secretWord, category: "testlab", impostorIds: [impostorId] },
    });
    await waitFor(clients[0]!, (s) => s.gameId === "impostor", "impostor started");
    await new Promise((r) => setTimeout(r, 80));

    const playerIds = [
      seats[0]!.playerId,
      seats[1]!.playerId,
      coco.playerId,
      impostorId,
      seats[4]!.playerId,
      seats[5]!.playerId,
    ];

    for (let i = 0; i < watch.length; i += 1) {
      const dumped = JSON.stringify(watch[i]!.events.slice(startAt[i]));
      if (playerIds[i] === impostorId) {
        expect(dumped).not.toContain(secretWord);
      }
      for (const seat of seats) {
        expect(dumped).not.toContain(seat.token);
      }
    }

    const character = "Zlatan Testosterone";
    clients[0]!.socket.emit("toLobby");
    await waitFor(clients[0]!, (s) => s.status === "lobby", "lobby before whoami");
    const whoStart = watch.map((c) => c.events.length);
    clients[0]!.socket.emit("startGame", {
      gameId: "whoami",
      seed: { character, hint: "ego", targetId: seats[0]!.playerId },
    });
    await waitFor(clients[1]!, (s) => s.gameId === "whoami", "whoami started");
    await new Promise((r) => setTimeout(r, 80));
    const hostDump = JSON.stringify(watch[0]!.events.slice(whoStart[0]));
    expect(hostDump).not.toContain(character);

    clients[0]!.socket.emit("toLobby");
    await waitFor(clients[0]!, (s) => s.status === "lobby", "lobby before higher-lower");
    clients[0]!.socket.emit("startGame", {
      gameId: "mas-o-menos",
      seed: { prompt: "¿Cuánto es el secreto?", trueAnswer: 42, min: 1, max: 100 },
    });
    await waitFor(clients[0]!, (s) => s.gameId === "mas-o-menos", "higher-lower started");
    expect((clients[0]!.box.last?.public as { secret?: number } | undefined)?.secret).toBeUndefined();
    clients[0]!.socket.emit("action", { type: "guess", payload: { value: 42 } });
    await waitFor(clients[0]!, (s) => s.status === "finished", "higher-lower finished");

    clients[0]!.socket.emit("toLobby");
    await waitFor(clients[0]!, (s) => s.status === "lobby", "lobby before spy");
    const secretLocation = "Hangar Secreto de Ezeiza 77";
    const spyId = seats[4]!.playerId;
    const spyStart = watch.map((c) => c.events.length);
    clients[0]!.socket.emit("startGame", {
      gameId: "espia",
      seed: { location: secretLocation, spyIds: [spyId] },
    });
    await waitFor(clients[4]!, (s) => s.gameId === "espia", "spy started");
    await new Promise((r) => setTimeout(r, 80));
    for (let i = 0; i < watch.length; i += 1) {
      const dumped = JSON.stringify(watch[i]!.events.slice(spyStart[i]));
      if (playerIds[i] === spyId) {
        expect(dumped, "espía no debe recibir el lugar").not.toContain(secretLocation);
        expect(dumped).toContain("espia");
      } else {
        expect(dumped, "civil no debe recibir rol de espía").not.toContain('"role":"espia"');
        expect(dumped).toContain(secretLocation);
        expect(dumped).not.toContain(`"spyIds":["${spyId}"]`);
      }
    }

    clients[0]!.socket.emit("toLobby");
    await waitFor(clients[0]!, (s) => s.status === "lobby", "lobby before vote");
    const voteStart = watch.map((c) => c.events.length);
    clients[0]!.socket.emit("startGame", {
      gameId: "votacion",
      seed: { prompt: "¿Quién se come la última empanada de prueba?" },
    });
    await waitFor(clients[0]!, (s) => s.gameId === "votacion", "vote started");
    const voteClients = [clients[0]!, clients[1]!, coco2, clients[3]!, clients[4]!, clients[5]!];
    for (let i = 0; i < voteClients.length; i += 1) {
      const target = seats[(i + 1) % seats.length]!.playerId;
      voteClients[i]!.socket.emit("action", { type: "vote", payload: { targetId: target } });
    }
    await waitFor(clients[0]!, (s) => (s.public as { votedIds?: string[] })?.votedIds?.length === 6, "all voted");
    clients[0]!.socket.emit("action", { type: "reveal" });
    await waitFor(clients[0]!, (s) => s.status === "finished", "vote revealed");
    await new Promise((r) => setTimeout(r, 60));
    for (let i = 0; i < voteClients.length; i += 1) {
      const slice = voteClients[i]!.events.slice(voteStart[i]);
      assertNoBallotMap(slice);
      const mine = playerIds[i]!;
      const others = seats.filter((s) => s.playerId !== mine);
      const dumped = JSON.stringify(slice);
      for (const other of others) {
        const foreignVote = `"myVote":"${other.playerId}"`;
        const iVotedForThem = seats[(i + 1) % seats.length]!.playerId === other.playerId;
        if (!iVotedForThem) {
          expect(dumped).not.toContain(foreignVote);
        }
      }
    }

    clients[0]!.socket.emit("toLobby");
    const lobbyAfterVote = await waitFor(clients[0]!, (s) => s.status === "lobby", "lobby after vote");
    const hostScoreThen = (lobbyAfterVote.you as { score: number }).score;

    clients[0]!.socket.disconnect();
    await new Promise((r) => setTimeout(r, 140));
    const migrated = await waitFor(
      clients[1]!,
      (s) =>
        (s.you as { isHost?: boolean }).isHost === true ||
        (s.players as { isHost: boolean; id: string }[]).some((p) => p.isHost && p.id === seats[1]!.playerId),
      "host migrated",
    );
    expect((migrated.players as { id: string; isHost: boolean }[]).find((p) => p.id === seats[1]!.playerId)?.isHost).toBe(true);

    const host2 = connect(srv.url);
    cleanups.push(() => host2.socket.disconnect());
    await new Promise<void>((r) => host2.socket.on("connect", () => r()));
    const back = await hello(host2.socket, { intent: "join", name: "Lucho", code, token: seats[0]!.token });
    expect(back.playerId).toBe(seats[0]!.playerId);
    const reclaimedHost = await waitFor(host2, (s) => (s.you as { isHost: boolean }).isHost, "host reclaimed");
    expect((reclaimedHost.you as { isHost: boolean }).isHost).toBe(true);
    expect((reclaimedHost.you as { score: number }).score).toBe(hostScoreThen);

    const other = connect(srv.url);
    cleanups.push(() => other.socket.disconnect());
    await new Promise<void>((r) => other.socket.on("connect", () => r()));
    const roomB = await hello(other.socket, { intent: "create", name: "OtraSala" });
    expect(roomB.code).not.toBe(code);
    const buddy = connect(srv.url);
    cleanups.push(() => buddy.socket.disconnect());
    await new Promise<void>((r) => buddy.socket.on("connect", () => r()));
    await hello(buddy.socket, { intent: "join", name: "BuddyB", code: roomB.code });
    other.socket.emit("startGame", { gameId: "closest", seed: { prompt: "solo B", trueAnswer: 99 } });
    await waitFor(other, (s) => s.code === roomB.code && s.gameId === "closest", "room B isolated");
    await new Promise((r) => setTimeout(r, 60));
    const leak = JSON.stringify(host2.events);
    expect(leak).not.toContain(roomB.code);
    expect(leak).not.toContain("solo B");
  });
});
