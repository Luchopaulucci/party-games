import { localGameError, supportsMode } from "@/shared/games/browse";
import { orderNightQueue } from "@/shared/games/night";
import { getEngine, getGameMeta } from "@/shared/games/registry";
import { mulberry32 } from "@/shared/rng";
import type { GameId, GameOptions, RoomStatus } from "@/shared/types";
import { nextPlayerColor } from "@/shared/ui/colors";

export interface LocalPlayer {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface LocalMatch {
  players: LocalPlayer[];
  hostId: string;
  status: RoomStatus;
  gameId: GameId | null;
  gameState: unknown;
  scoredRound: boolean;
  usedContentIds: string[];
  passIndex: number;
  revealQueue: string[];
  categories: string[];
  picante: boolean;
  options: GameOptions;
  nightQueue: GameId[];
  nightIndex: number;
}

export function localStorageKey(gameId: GameId): string {
  return `previa:local:v1:${gameId}`;
}

export function resetLocalToLobby(players: { name: string; color?: string }[]): LocalMatch {
  return createLocalMatch(players);
}

export function newLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `p${Math.random().toString(36).slice(2, 10)}`;
}

export function createLocalMatch(input: { name: string; color?: string }[] | string[]): LocalMatch {
  const used: string[] = [];
  const players = input.map((item) => {
    const name = typeof item === "string" ? item : item.name;
    const color = (typeof item === "string" ? undefined : item.color) || nextPlayerColor(used);
    used.push(color);
    return { id: newLocalId(), name, score: 0, color };
  });
  return {
    players,
    hostId: players[0]!.id,
    status: "lobby",
    gameId: null,
    gameState: null,
    scoredRound: false,
    usedContentIds: [],
    passIndex: 0,
    revealQueue: [],
    categories: [],
    picante: false,
    options: {},
    nightQueue: [],
    nightIndex: 0,
  };
}

export function hydrateMatch(raw: LocalMatch): LocalMatch {
  const used: string[] = [];
  return {
    ...raw,
    categories: raw.categories ?? [],
    picante: Boolean(raw.picante),
    options: raw.options ?? {},
    nightQueue: raw.nightQueue ?? [],
    nightIndex: raw.nightIndex ?? 0,
    players: raw.players.map((p) => {
      const color = p.color || nextPlayerColor(used);
      used.push(color);
      return { ...p, color };
    }),
  };
}

function ctx(match: LocalMatch) {
  return {
    playerIds: match.players.map((p) => p.id),
    rng: mulberry32(Math.floor(Math.random() * 1e9)),
    usedContentIds: match.usedContentIds,
    categories: match.categories,
    picante: match.picante,
    options: match.options,
    now: Date.now,
  };
}

export function startLocalGame(
  match: LocalMatch,
  gameId: GameId,
  pack?: { categories?: string[]; picante?: boolean; options?: GameOptions },
): LocalMatch | string {
  const modeError = localGameError(gameId);
  if (modeError) return modeError;
  const engine = getEngine(gameId);
  if (!engine) return "Ese juego todavía es vaporware.";
  const next: LocalMatch = {
    ...match,
    categories: pack?.categories ?? match.categories ?? [],
    picante: pack?.picante ?? match.picante ?? false,
    options: pack?.options ?? match.options ?? {},
  };
  const gameState = engine.createState(ctx(next));
  let nightQueue = next.nightQueue ?? [];
  let nightIndex = next.nightIndex ?? 0;
  if (next.options.night) {
    if (next.status === "lobby" || nightQueue.length === 0) {
      nightQueue = orderNightQueue(gameId).filter((id) => {
        const meta = getGameMeta(id);
        return Boolean(meta?.implemented && next.players.length >= meta.minPlayers && supportsMode(id, "local"));
      });
      nightIndex = Math.max(0, nightQueue.indexOf(gameId));
    }
  } else {
    nightQueue = [];
    nightIndex = 0;
  }
  return {
    ...next,
    gameId,
    gameState,
    status: "playing",
    scoredRound: false,
    passIndex: 0,
    revealQueue: revealQueueFor(gameId, gameState, next.players.map((p) => p.id)),
    nightQueue,
    nightIndex,
  };
}

export function nextLocalRound(match: LocalMatch): LocalMatch | string {
  if (match.options.night && match.nightQueue.length) {
    const nextIndex = match.nightIndex + 1;
    if (nextIndex < match.nightQueue.length) {
      return startLocalGame({ ...match, nightIndex: nextIndex }, match.nightQueue[nextIndex]!);
    }
  }
  if (!match.gameId) return "Elegí un juego primero.";
  return startLocalGame(match, match.gameId);
}

function revealQueueFor(_gameId: GameId, state: unknown, ids: string[]): string[] {
  if (!state || typeof state !== "object") return ids;
  const rec = state as Record<string, unknown>;
  const keys = ["storytellerId", "chooserId", "currentId"];
  const first = keys.map((k) => rec[k]).find((v): v is string => typeof v === "string" && ids.includes(v));
  if (!first) return ids;
  return [first, ...ids.filter((id) => id !== first)];
}

const PASS_AFTER: Partial<Record<GameId, string[]>> = {
  closest: ["guess"],
  impostor: ["ready"],
  emoji: ["pass"],
  mentira: ["write", "vote"],
  "completa-frase": ["write", "vote"],
  cadena: ["word"],
  votacion: ["vote"],
  reflejos: ["stop"],
};

export function currentPassId(match: LocalMatch): string | undefined {
  const pub = localView(match, match.players[0]?.id ?? "").public as Record<string, unknown> | null;
  return [pub?.currentId, pub?.currentPlayerId, pub?.currentWriterId].find(
    (v): v is string => typeof v === "string",
  );
}

export function gameProgressed(before: LocalMatch, after: LocalMatch): boolean {
  return before.gameState !== after.gameState || before.status !== after.status;
}

export function advancePass(match: LocalMatch, applied: LocalMatch, type: string): LocalMatch {
  if (applied.status !== "playing" || !applied.gameId) return applied;
  if (!gameProgressed(match, applied)) return applied;
  const current = currentPassId(applied);
  if (current) {
    const idx = applied.revealQueue.indexOf(current);
    if (idx >= 0 && idx !== match.passIndex) return { ...applied, passIndex: idx };
  }
  if (!PASS_AFTER[applied.gameId]?.includes(type)) return applied;
  const nextIndex = match.passIndex + 1;
  if (nextIndex < applied.revealQueue.length) return { ...applied, passIndex: nextIndex };
  return applied;
}

export function localAction(
  match: LocalMatch,
  playerId: string,
  action: { type: string; payload?: unknown },
): LocalMatch {
  if (!match.gameId || match.gameState == null) return match;
  const engine = getEngine(match.gameId);
  if (!engine) return match;
  const gameState = engine.reduce(match.gameState, action, playerId, ctx(match));
  const next: LocalMatch = { ...match, gameState };
  if (engine.isFinished(gameState) && !match.scoredRound) {
    const gained = engine.scores(gameState);
    next.players = match.players.map((p) => ({ ...p, score: p.score + (gained[p.id] ?? 0) }));
    next.scoredRound = true;
    next.status = "finished";
    const used = engine.usedContentId?.(gameState);
    if (used) next.usedContentIds = [...match.usedContentIds, used];
  }
  return next;
}

export function localView(match: LocalMatch, playerId: string) {
  const engine = match.gameId ? getEngine(match.gameId) : undefined;
  return {
    public: engine && match.gameState != null ? engine.publicView(match.gameState) : null,
    private: engine && match.gameState != null ? engine.privateView(match.gameState, playerId) : null,
  };
}
