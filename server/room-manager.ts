import { randomBytes, randomInt } from "node:crypto";
import {
  EMPTY_ROOM_TTL_MS,
  HOST_GRACE_DEFAULT_MS,
  INACTIVE_ROOM_TTL_MS,
  MAX_PLAYERS,
  ROOM_CODE_ALPHABET,
  ROOM_SWEEP_INTERVAL_MS,
  isPlayableGameId,
  type GameId,
  type PlayerPublic,
  type GameOptions,
  type RoomNotice,
  type RoomReaction,
  type RoomStatus,
  type TestSeed,
} from "../shared/types";
import {
  cleanName,
  normalizeRoomCode,
  sanitizeCategories,
  sanitizeGameOptions,
  sanitizeTestSeed,
  sanitizeToken,
  UNKNOWN_GAME_ERROR,
  REACTION_EMOJIS,
} from "../shared/protocol";
import { getEngine, getGameMeta } from "../shared/games/registry";
import { orderNightQueue } from "../shared/games/night";
import { mulberry32 } from "../shared/rng";
import { nextPlayerColor } from "../shared/ui/colors";

export interface Seat {
  id: string;
  token: string;
  name: string;
  score: number;
  color: string;
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
  lastActivityAt: number;
  categories: string[];
  picante: boolean;
  options: GameOptions;
  nightQueue: GameId[];
  nightIndex: number;
  reactions: RoomReaction[];
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
  emptyRoomTtlMs?: number;
  inactiveRoomTtlMs?: number;
  sweepIntervalMs?: number;
}

function makeCode(): string {
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  }
  return code;
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
  readonly emptyRoomTtlMs: number;
  readonly inactiveRoomTtlMs: number;
  private readonly now: () => number;
  private readonly allowTestSeeds: boolean;
  private readonly hostTimers = new Map<string, NodeJS.Timeout>();
  private readonly sweepTimer: NodeJS.Timeout | null;
  onChange: ((room: Room) => void) | null = null;

  constructor(opts: RoomManagerOptions = {}) {
    this.hostGraceMs = opts.hostGraceMs ?? HOST_GRACE_DEFAULT_MS;
    this.emptyRoomTtlMs = opts.emptyRoomTtlMs ?? EMPTY_ROOM_TTL_MS;
    this.inactiveRoomTtlMs = opts.inactiveRoomTtlMs ?? INACTIVE_ROOM_TTL_MS;
    this.now = opts.now ?? Date.now;
    this.allowTestSeeds = opts.allowTestSeeds ?? process.env.ALLOW_TEST_SEEDS === "1";
    const sweepEvery = opts.sweepIntervalMs ?? ROOM_SWEEP_INTERVAL_MS;
    if (sweepEvery > 0) {
      this.sweepTimer = setInterval(() => this.sweepRooms(), sweepEvery);
      this.sweepTimer.unref();
    } else {
      this.sweepTimer = null;
    }
  }

  createRoom(name: unknown): HelloResult | HelloError {
    const clean = cleanName(name);
    if (!clean) return { ok: false, error: "Poné un nombre decente, entre 2 y 18 letras." };
    let code = makeCode();
    while (this.rooms.has(code)) code = makeCode();
    const seat: Seat = {
      id: newId(),
      token: newToken(),
      name: clean,
      score: 0,
      color: nextPlayerColor([]),
      connected: true,
      lastSeenAt: this.now(),
      socketIds: new Set(),
    };
    const createdAt = this.now();
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
      categories: [],
      picante: false,
      options: {},
      nightQueue: [],
      nightIndex: 0,
      reactions: [],
      usedContentIds: [],
      notice: null,
      createdAt,
      lastActivityAt: createdAt,
    };
    this.rooms.set(code, room);
    return { ok: true, code, playerId: seat.id, token: seat.token };
  }

  joinRoom(code: unknown, name: unknown, token?: unknown): HelloResult | HelloError {
    const normalized = normalizeRoomCode(code);
    if (!normalized) return { ok: false, error: "Esa sala no existe. Revisá el código, crack." };
    const room = this.rooms.get(normalized);
    if (!room) return { ok: false, error: "Esa sala no existe. Revisá el código, crack." };

    const safeToken = sanitizeToken(token);
    if (safeToken) {
      const existing = room.seats.find((s) => s.token === safeToken);
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
      color: nextPlayerColor(room.seats.map((s) => s.color)),
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

  hasHostTimer(code: string) {
    return this.hostTimers.has(code);
  }

  deleteRoom(code: string) {
    this.clearHostTimer(code);
    this.rooms.delete(code);
  }

  sweepRooms() {
    const t = this.now();
    for (const room of [...this.rooms.values()]) {
      const idle = t - room.lastActivityAt;
      const empty = room.seats.length === 0 || room.seats.every((s) => !s.connected);
      if ((empty && idle >= this.emptyRoomTtlMs) || idle >= this.inactiveRoomTtlMs) {
        this.deleteRoom(room.code);
      }
    }
  }

  startGame(
    code: string,
    hostId: string,
    gameId: unknown,
    seed?: unknown,
    pack?: { categories?: unknown; picante?: unknown; options?: unknown },
  ): string | null {
    const room = this.rooms.get(code);
    if (!room) return "Sala introvable.";
    if (room.hostId !== hostId) return "Solo el anfitrión arranca la joda.";
    if (!isPlayableGameId(gameId)) return UNKNOWN_GAME_ERROR;
    const meta = getGameMeta(gameId);
    const engine = getEngine(gameId);
    if (!meta?.implemented || !engine) return UNKNOWN_GAME_ERROR;
    const connected = room.seats.filter((s) => s.connected);
    if (connected.length < meta.minPlayers) {
      return `Hacen falta ${meta.minPlayers} conectados. Invita a alguien, no seas lobo estepario.`;
    }
    if (pack?.categories !== undefined) room.categories = sanitizeCategories(pack.categories);
    if (typeof pack?.picante === "boolean") room.picante = pack.picante;
    if (pack?.options !== undefined) room.options = sanitizeGameOptions(pack.options);
    if (room.options.night) {
      if (room.status === "lobby" || room.nightQueue.length === 0) {
        const connectedCount = connected.length;
        room.nightQueue = orderNightQueue(gameId).filter((id) => {
          const m = getGameMeta(id);
          return Boolean(m?.implemented && connectedCount >= m.minPlayers);
        });
        room.nightIndex = Math.max(0, room.nightQueue.indexOf(gameId));
      }
    } else {
      room.nightQueue = [];
      room.nightIndex = 0;
    }
    const ctx = this.context(room, sanitizeTestSeed(seed, this.allowTestSeeds));
    try {
      room.gameState = engine.createState(ctx);
    } catch (err) {
      console.error("[createState]", err);
      return "No se pudo armar la ronda. Probá de nuevo.";
    }
    room.gameId = gameId;
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
    if (typeof action?.type !== "string" || action.type.length < 1 || action.type.length > 40) {
      return "Jugada inválida.";
    }
    if (action.type === "reveal" || action.type === "open-vote") {
      if (room.hostId !== playerId) return "Eso lo aprieta el anfitrión.";
    }
    const ctx = this.context(room);
    try {
      room.gameState = engine.reduce(room.gameState, action, playerId, ctx);
    } catch (err) {
      console.error("[reduce]", err);
      return "Esa jugada no cierra. Probá de nuevo.";
    }
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
    if (room.options.night && room.nightQueue.length) {
      const nextIndex = room.nightIndex + 1;
      if (nextIndex < room.nightQueue.length) {
        room.nightIndex = nextIndex;
        return this.startGame(code, hostId, room.nightQueue[nextIndex]!);
      }
    }
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
    room.nightQueue = [];
    room.nightIndex = 0;
    this.emit(room);
    return null;
  }

  react(code: string, playerId: string, emoji: string): string | null {
    const room = this.rooms.get(code);
    if (!room) return "Sala introvable.";
    if (!room.seats.some((s) => s.id === playerId)) return "Sin asiento.";
    if (!(REACTION_EMOJIS as readonly string[]).includes(emoji)) return "Ese emoji no entra.";
    const reaction: RoomReaction = {
      id: `${this.now()}-${playerId.slice(0, 6)}`,
      emoji,
      playerId,
      at: this.now(),
    };
    room.reactions = [...room.reactions, reaction].slice(-20);
    this.emit(room);
    return null;
  }

  project(room: Room, playerId: string) {
    try {
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
        reactions: room.reactions,
        night: room.options.night && room.nightQueue.length
          ? { queue: room.nightQueue, index: room.nightIndex }
          : null,
        options: room.options,
      };
    } catch (err) {
      console.error("[project]", err);
      return null;
    }
  }

  dispose() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
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
      color: seat.color,
    };
  }

  private context(room: Room, seed?: TestSeed) {
    const seedNum = randomInt(1, 2 ** 31);
    return {
      playerIds: room.seats.map((s) => s.id),
      rng: mulberry32(seedNum),
      usedContentIds: room.usedContentIds,
      seed: this.allowTestSeeds ? seed : undefined,
      categories: room.categories,
      picante: room.picante,
      options: room.options,
      now: this.now,
    };
  }

  private emit(room: Room) {
    room.lastActivityAt = this.now();
    this.onChange?.(room);
  }
}
