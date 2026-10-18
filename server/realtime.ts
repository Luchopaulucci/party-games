import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { ZodType } from "zod";
import {
  BAD_PAYLOAD_ERROR,
  SERVER_SAFE_ERROR,
  actionPayloadSchema,
  helloPayloadSchema,
  reactPayloadSchema,
  startGamePayloadSchema,
  type ActionPayload,
  type HelloPayload,
  type StartGamePayload,
} from "../shared/protocol";
import { MAX_HTTP_BUFFER_SIZE } from "../shared/types";
import { RoomManager, type Room, type RoomManagerOptions } from "./room-manager";

export type CreateRealtimeOptions = RoomManagerOptions;

interface SocketData {
  code?: string;
  token?: string;
  playerId?: string;
}

export function createRealtimeServer(httpServer: HttpServer, opts: CreateRealtimeOptions = {}) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
  });
  const rooms = new RoomManager({
    hostGraceMs: opts.hostGraceMs ?? Number(process.env.HOST_GRACE_MS || 12_000),
    allowTestSeeds: opts.allowTestSeeds ?? process.env.ALLOW_TEST_SEEDS === "1",
    emptyRoomTtlMs: opts.emptyRoomTtlMs,
    inactiveRoomTtlMs: opts.inactiveRoomTtlMs,
    sweepIntervalMs: opts.sweepIntervalMs,
    now: opts.now,
  });

  rooms.onChange = (room) => emitRoom(io, rooms, room);
  rooms.onClosed = ({ text, seats }) => {
    for (const seat of seats) {
      for (const sid of seat.socketIds) {
        io.to(sid).emit("roomClosed", { text, reason: "host-left" });
      }
    }
  };

  io.on("connection", (socket: Socket) => {
    onValidated(socket, "hello", helloPayloadSchema, (payload: HelloPayload, cb) => {
      const result =
        payload.intent === "create"
          ? rooms.createRoom(payload.name)
          : rooms.joinRoom(payload.code, payload.name, payload.token);

      if (!result.ok) {
        cb?.(result);
        return;
      }

      releaseSeat(socket, rooms);
      const data = socket.data as SocketData;
      data.code = result.code;
      data.token = result.token;
      data.playerId = result.playerId;
      socket.join(result.code);
      rooms.attachSocket(result.code, result.token, socket.id);
      cb?.(result);
    });

    onValidated(socket, "startGame", startGamePayloadSchema, (payload: StartGamePayload, cb) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Primero entra a una sala." });
      const error = rooms.startGame(data.code, data.playerId, payload.gameId, payload.seed, {
        categories: payload.categories,
        picante: payload.picante,
        options: payload.options,
      });
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    onValidated(socket, "action", actionPayloadSchema, (payload: ActionPayload, cb) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.applyAction(data.code, data.playerId, payload);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    onValidated(socket, "nextRound", null, (_payload, cb) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.nextRound(data.code, data.playerId);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    onValidated(socket, "toLobby", null, (_payload, cb) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.toLobby(data.code, data.playerId);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    onValidated(socket, "react", reactPayloadSchema, (payload, cb) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const error = rooms.react(data.code, data.playerId, payload.emoji);
      cb?.(error ? { ok: false, error } : { ok: true });
    });

    onValidated(socket, "leaveRoom", null, (_payload, cb) => {
      const data = socket.data as SocketData;
      if (!data.code || !data.playerId) return cb?.({ ok: false, error: "Sin asiento." });
      const result = rooms.leaveRoom(data.code, data.playerId);
      if (typeof result === "string") return cb?.({ ok: false, error: result });
      socket.leave(data.code);
      data.code = undefined;
      data.token = undefined;
      data.playerId = undefined;
      cb?.({ ok: true, closed: result.closed, text: result.text });
    });

    socket.on("disconnect", () => {
      try {
        rooms.detachSocket(socket.id);
      } catch (err) {
        console.error("[socket:disconnect]", err);
      }
    });
  });

  return { io, rooms };
}

function releaseSeat(socket: Socket, rooms: RoomManager) {
  const data = socket.data as SocketData;
  if (!data.code) return;
  socket.leave(data.code);
  rooms.detachSocket(socket.id);
  data.code = undefined;
  data.token = undefined;
  data.playerId = undefined;
}

function onValidated<T>(
  socket: Socket,
  event: string,
  schema: ZodType<T> | null,
  handler: (payload: T, cb?: (res: unknown) => void) => void,
) {
  socket.on(event, (...args: unknown[]) => {
    const cb = typeof args[args.length - 1] === "function" ? (args.pop() as (res: unknown) => void) : undefined;
    try {
      const raw = args[0];
      if (!schema) {
        handler(undefined as T, cb);
        return;
      }
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        cb?.({ ok: false, error: BAD_PAYLOAD_ERROR });
        return;
      }
      handler(parsed.data, cb);
    } catch (err) {
      console.error(`[socket:${event}]`, err);
      cb?.({ ok: false, error: SERVER_SAFE_ERROR });
    }
  });
}

function emitRoom(io: Server, rooms: RoomManager, room: Room) {
  try {
    for (const seat of room.seats) {
      const view = rooms.project(room, seat.id);
      if (!view) continue;
      for (const sid of seat.socketIds) {
        io.to(sid).emit("state", view);
      }
    }
  } catch (err) {
    console.error("[emitRoom]", err);
  }
}
