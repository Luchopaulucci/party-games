import { getEngine } from "@/shared/games/registry";
import { mulberry32 } from "@/shared/rng";
import type { GameId, RoomStatus } from "@/shared/types";

export interface LocalPlayer {
  id: string;
  name: string;
  score: number;
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
}

export function newLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `p${Math.random().toString(36).slice(2, 10)}`;
}

export function createLocalMatch(names: string[]): LocalMatch {
  const players = names.map((name) => ({
    id: newLocalId(),
    name,
    score: 0,
  }));
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
  };
}

function ctx(match: LocalMatch) {
  return {
    playerIds: match.players.map((p) => p.id),
    rng: mulberry32(Math.floor(Math.random() * 1e9)),
    usedContentIds: match.usedContentIds,
  };
}

export function startLocalGame(match: LocalMatch, gameId: GameId): LocalMatch | string {
  const engine = getEngine(gameId);
  if (!engine) return "Ese juego todavía es vaporware.";
  const gameState = engine.createState(ctx(match));
  return {
    ...match,
    gameId,
    gameState,
    status: "playing",
    scoredRound: false,
    passIndex: 0,
    revealQueue: match.players.map((p) => p.id),
  };
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
