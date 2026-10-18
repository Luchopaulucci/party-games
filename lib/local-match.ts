import { getEngine } from "@/shared/games/registry";
import { mulberry32 } from "@/shared/rng";
import type { GameId, RoomStatus } from "@/shared/types";
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
  };
}

export function hydrateMatch(raw: LocalMatch): LocalMatch {
  const used: string[] = [];
  return {
    ...raw,
    categories: raw.categories ?? [],
    picante: Boolean(raw.picante),
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
  };
}

export function startLocalGame(
  match: LocalMatch,
  gameId: GameId,
  pack?: { categories?: string[]; picante?: boolean },
): LocalMatch | string {
  const engine = getEngine(gameId);
  if (!engine) return "Ese juego todavía es vaporware.";
  const next: LocalMatch = {
    ...match,
    categories: pack?.categories ?? match.categories ?? [],
    picante: pack?.picante ?? match.picante ?? false,
  };
  const gameState = engine.createState(ctx(next));
  return {
    ...next,
    gameId,
    gameState,
    status: "playing",
    scoredRound: false,
    passIndex: 0,
    revealQueue: next.players.map((p) => p.id),
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
