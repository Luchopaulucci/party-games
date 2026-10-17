import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { GameId, TestSeed } from "../shared/types";
import { RoomManager, type Room } from "./room-manager";

export interface HelloPayload {
  intent: "create" | "join";
  name: string;
  code?: string;
  token?: string;
}

export interface CreateRealtimeOptions {
  hostGraceMs?: number;
  allowTestSeeds?: boolean;
}

interface SocketData {
  code?: string;
  token?: string;
  playerId?: string;
}

export function createRealtimeServer(httpServer: HttpServer, opts: CreateRealtimeOptions = {}) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });
  const rooms = new RoomManager({
    hostGraceMs: opts.hostGraceMs ?? Number(process.env.HOST_GRACE_MS || 12_000),
    allowTestSeeds: opts.allowTestSeeds ?? process.env.ALLOW_TEST_SEEDS === "1",
  });

  rooms.onChange = (room) => emitRoom(io, rooms, room);

  io.on("connection", (socket: Socket) => {
    socket.on("hello", (payload: HelloPayload, cb?: (res: unknown) => void) => {
      const result =
        payload.intent === "create"
          ? rooms.createRoom(payload.name)
          : rooms.joinRoom(payload.code ?? "", payload.name, payload.token);

      if (!result.ok) {
        cb?.(result);
        return;
      }

      const data = socket.data as SocketData;
      data.code = result.code;
      data.token = result.token;
      data.playerId = result.playerId;
      socket.join(result.code);
      rooms.attachSocket(result.code, result.token, socket.id);
      cb?.(result);
    });

    socket.on("startGame", (payload: { gameId: GameId; seed?: TestSeed }, cb?: (res: unknown) => void) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Primero entra a una sala." });
      const error = rooms.startGame(data.code, data.playerId, payload.gameId, payload.seed);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    socket.on("action", (payload: { type: string; payload?: unknown }, cb?: (res: unknown) => void) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.applyAction(data.code, data.playerId, payload);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    socket.on("nextRound", (cb?: (res: unknown) => void) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.nextRound(data.code, data.playerId);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    socket.on("toLobby", (cb?: (res: unknown) => void) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.toLobby(data.code, data.playerId);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    socket.on("disconnect", () => {
      rooms.detachSocket(socket.id);
    });
  });

  return { io, rooms };
}

function emitRoom(io: Server, rooms: RoomManager, room: Room) {
  for (const seat of room.seats) {
    const view = rooms.project(room, seat.id);
    if (!view) continue;
    for (const sid of seat.socketIds) {
      io.to(sid).emit("state", view);
    }
  }
}
