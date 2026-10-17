import { randomBytes, randomInt } from "node:crypto";
import {
  HOST_GRACE_DEFAULT_MS,
  MAX_PLAYERS,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  ROOM_CODE_ALPHABET,
  type GameId,
  type PlayerPublic,
  type RoomNotice,
  type RoomStatus,
  type TestSeed,
} from "../shared/types";
import { getEngine, getGameMeta } from "../shared/games/registry";
import { mulberry32 } from "../shared/rng";

export interface Seat {
  id: string;
  token: string;
  name: string;
  score: number;
  connected: boolean;
  lastSeenAt: number;
  socketIds: Set<string>;
}

export interface Room {
  code: string;
  seats: Seat[];
  hostId: string;
  originalHostId: string;
  hostLeftAt: number | null;
  status: RoomStatus;
  gameId: GameId | null;
  gameState: unknown;
  scoredRound: boolean;
  usedContentIds: string[];
  notice: RoomNotice | null;
  createdAt: number;
}

export interface HelloResult {
  ok: true;
  code: string;
  playerId: string;
  token: string;
}

export interface HelloError {
  ok: false;
  error: string;
}

export interface RoomManagerOptions {
  hostGraceMs?: number;
  now?: () => number;
  allowTestSeeds?: boolean;
}

function makeCode(): string {
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

function cleanName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) return null;
  return name;
}

function newId(): string {
  return randomBytes(8).toString("hex");
}

function newToken(): string {
  return randomBytes(16).toString("hex");
}

export class RoomManager {
  readonly rooms = new Map<string, Room>();
  readonly hostGraceMs: number;
  private readonly now: () => number;
  private readonly allowTestSeeds: boolean;
  private readonly hostTimers = new Map<string, NodeJS.Timeout>();
  onChange: ((room: Room) => void) | null = null;

  constructor(opts: RoomManagerOptions = {}) {
    this.hostGraceMs = opts.hostGraceMs ?? HOST_GRACE_DEFAULT_MS;
    this.now = opts.now ?? Date.now;
    this.allowTestSeeds = opts.allowTestSeeds ?? process.env.ALLOW_TEST_SEEDS === "1";
  }

  createRoom(name: string): HelloResult | HelloError {
    const clean = cleanName(name);
    if (!clean) return { ok: false, error: "Poné un nombre decente, entre 2 y 18 letras." };
    let code = makeCode();
    while (this.rooms.has(code)) code = makeCode();
    const seat: Seat = {
      id: newId(),
      token: newToken(),
      name: clean,
      score: 0,
      connected: true,
      lastSeenAt: this.now(),
      socketIds: new Set(),
    };
    const room: Room = {
      code,
      seats: [seat],
      hostId: seat.id,
      originalHostId: seat.id,
      hostLeftAt: null,
      status: "lobby",
      gameId: null,
      gameState: null,
      scoredRound: false,
      usedContentIds: [],
      notice: null,
      createdAt: this.now(),
    };
    this.rooms.set(code, room);
    return { ok: true, code, playerId: seat.id, token: seat.token };
  }

  joinRoom(code: string, name: string, token?: string): HelloResult | HelloError {
    const room = this.rooms.get(code.trim().toUpperCase());
    if (!room) return { ok: false, error: "Esa sala no existe. Revisá el código, crack." };

    if (token) {
      const existing = room.seats.find((s) => s.token === token);
      if (existing) {
        existing.connected = true;
        existing.lastSeenAt = this.now();
        if (existing.id === room.originalHostId && room.hostId !== existing.id) {
          room.hostId = existing.id;
          room.hostLeftAt = null;
          room.notice = {
            kind: "host-reclaimed",
            text: `Volvió ${existing.name}, el dueño de casa. Se termina el interinato.`,
          };
        } else if (existing.id === room.hostId) {
          room.hostLeftAt = null;
        }
        this.clearHostTimer(room.code);
        this.emit(room);
        return { ok: true, code: room.code, playerId: existing.id, token: existing.token };
      }
    }

    const clean = cleanName(name);
    if (!clean) return { ok: false, error: "Poné un nombre decente, entre 2 y 18 letras." };
    if (room.seats.length >= MAX_PLAYERS) {
      return { ok: false, error: "La sala está más llena que el 60 un viernes." };
    }
    if (room.seats.some((s) => s.name.toLowerCase() === clean.toLowerCase())) {
      return { ok: false, error: "Ese nombre ya está. Ponete un apodo, no seas básico." };
    }

    const seat: Seat = {
      id: newId(),
      token: newToken(),
      name: clean,
      score: 0,
      connected: true,
      lastSeenAt: this.now(),
      socketIds: new Set(),
    };
    room.seats.push(seat);
    this.emit(room);
    return { ok: true, code: room.code, playerId: seat.id, token: seat.token };
  }

  attachSocket(code: string, token: string, socketId: string): Seat | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    const seat = room.seats.find((s) => s.token === token);
    if (!seat) return null;
    seat.socketIds.add(socketId);
    seat.connected = true;
    seat.lastSeenAt = this.now();
    if (seat.id === room.hostId) room.hostLeftAt = null;
    this.clearHostTimer(room.code);
    this.emit(room);
    return seat;
  }

  detachSocket(socketId: string): Room | null {
    for (const room of this.rooms.values()) {
      const seat = room.seats.find((s) => s.socketIds.has(socketId));
      if (!seat) continue;
      seat.socketIds.delete(socketId);
      if (seat.socketIds.size === 0) {
        seat.connected = false;
        seat.lastSeenAt = this.now();
        if (seat.id === room.hostId) {
          room.hostLeftAt = this.now();
          this.scheduleHostMigration(room.code);
        }
      }
      this.emit(room);
      return room;
    }
    return null;
  }

  private scheduleHostMigration(code: string) {
    this.clearHostTimer(code);
    const timer = setTimeout(() => {
      const room = this.rooms.get(code);
      if (!room || room.hostLeftAt === null) return;
      const host = room.seats.find((s) => s.id === room.hostId);
      if (host?.connected) return;
      const next = room.seats.find((s) => s.connected && s.id !== room.hostId);
      if (!next) return;
      room.hostId = next.id;
      room.notice = {
        kind: "host-migrated",
        text: `${host?.name ?? "El anfitrión"} se fue a comprar birra. Ahora hostea ${next.name}.`,
      };
      this.emit(room);
    }, this.hostGraceMs);
    this.hostTimers.set(code, timer);
  }

  private clearHostTimer(code: string) {
    const t = this.hostTimers.get(code);
    if (t) clearTimeout(t);
    this.hostTimers.delete(code);
  }

  startGame(code: string, hostId: string, gameId: GameId, seed?: TestSeed): string | null {
    const room = this.rooms.get(code);
    if (!room) return "Sala introvable.";
    if (room.hostId !== hostId) return "Solo el anfitrión arranca la joda.";
    const meta = getGameMeta(gameId);
    const engine = getEngine(gameId);
    if (!meta?.implemented || !engine) return "Ese juego todavía es humo. Elegí uno que exista.";
    const connected = room.seats.filter((s) => s.connected);
    if (connected.length < meta.minPlayers) {
      return `Hacen falta ${meta.minPlayers} conectados. Invita a alguien, no seas lobo estepario.`;
    }
    const ctx = this.context(room, seed);
    room.gameId = gameId;
    room.gameState = engine.createState(ctx);
    room.status = "playing";
    room.scoredRound = false;
    room.notice = null;
    this.emit(room);
    return null;
  }

  applyAction(code: string, playerId: string, action: { type: string; payload?: unknown }): string | null {
    const room = this.rooms.get(code);
    if (!room || !room.gameId || room.gameState == null) return "No hay ronda en curso.";
    const engine = getEngine(room.gameId);
    if (!engine) return "Juego desconocido.";
    if (action.type === "reveal" || action.type === "open-vote") {
      if (room.hostId !== playerId) return "Eso lo aprieta el anfitrión.";
    }
    const ctx = this.context(room);
    room.gameState = engine.reduce(room.gameState, action, playerId, ctx);
    if (engine.isFinished(room.gameState) && !room.scoredRound) {
      const gained = engine.scores(room.gameState);
      for (const seat of room.seats) {
        seat.score += gained[seat.id] ?? 0;
      }
      room.scoredRound = true;
      room.status = "finished";
      const used = engine.usedContentId?.(room.gameState);
      if (used) room.usedContentIds.push(used);
    }
    this.emit(room);
    return null;
  }

  nextRound(code: string, hostId: string): string | null {
    const room = this.rooms.get(code);
    if (!room) return "Sala introvable.";
    if (room.hostId !== hostId) return "Solo el anfitrión sigue la ronda.";
    if (!room.gameId) return "Elegí un juego primero.";
    return this.startGame(code, hostId, room.gameId);
  }

  toLobby(code: string, hostId: string): string | null {
    const room = this.rooms.get(code);
    if (!room) return "Sala introvable.";
    if (room.hostId !== hostId) return "Solo el anfitrión vuelve al living.";
    room.status = "lobby";
    room.gameId = null;
    room.gameState = null;
    room.scoredRound = false;
    room.notice = null;
    this.emit(room);
    return null;
  }

  project(room: Room, playerId: string) {
    const you = room.seats.find((s) => s.id === playerId);
    if (!you) return null;
    const engine = room.gameId ? getEngine(room.gameId) : undefined;
    return {
      code: room.code,
      you: this.publicSeat(room, you),
      players: room.seats.map((s) => this.publicSeat(room, s)),
      status: room.status,
      gameId: room.gameId,
      public: engine && room.gameState != null ? engine.publicView(room.gameState) : null,
      private: engine && room.gameState != null ? engine.privateView(room.gameState, playerId) : null,
      notice: room.notice,
      canHost: room.hostId === playerId,
    };
  }

  dispose() {
    for (const t of this.hostTimers.values()) clearTimeout(t);
    this.hostTimers.clear();
    this.rooms.clear();
  }

  private publicSeat(room: Room, seat: Seat): PlayerPublic {
    return {
      id: seat.id,
      name: seat.name,
      score: seat.score,
      connected: seat.connected,
      isHost: seat.id === room.hostId,
    };
  }

  private context(room: Room, seed?: TestSeed) {
    const seedNum = randomInt(1, 2 ** 31);
    return {
      playerIds: room.seats.map((s) => s.id),
      rng: mulberry32(seedNum),
      usedContentIds: room.usedContentIds,
      seed: this.allowTestSeeds ? seed : undefined,
    };
  }

  private emit(room: Room) {
    this.onChange?.(room);
  }
}
