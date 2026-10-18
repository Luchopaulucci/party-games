export const GAME_IDS = [
  "closest",
  "whoami",
  "impostor",
  "mas-o-menos",
  "espia",
  "votacion",
  "completa-frase",
  "mentira",
  "reflejos",
  "yo-nunca",
  "tutti",
  "trivia",
  "cadena",
  "emoji",
  "preferis",
] as const;

export type GameId = (typeof GAME_IDS)[number];

export function isPlayableGameId(id: unknown): id is GameId {
  return typeof id === "string" && (GAME_IDS as readonly string[]).includes(id);
}

export interface GameOptions {
  timerSec?: number;
  rounds?: number;
  packs?: string[];
  mode?: string;
  impostorCount?: number;
  spyCount?: number;
  maxGuesses?: number;
  night?: boolean;
}

export type RoomStatus = "lobby" | "playing" | "finished";

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  color: string;
}

export interface GameMeta {
  id: GameId;
  name: string;
  tagline: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  implemented: boolean;
  emoji: string;
  howTo: string;
}

export interface GameContext {
  playerIds: string[];
  rng: () => number;
  usedContentIds?: string[];
  seed?: TestSeed;
  categories?: string[];
  picante?: boolean;
  options?: GameOptions;
  now?: () => number;
}

/** Only honored when ALLOW_TEST_SEEDS=1. Never enable that in production. */
export interface TestSeed {
  questionId?: string;
  trueAnswer?: number;
  prompt?: string;
  unit?: string;
  character?: string;
  hint?: string;
  targetId?: string;
  word?: string;
  category?: string;
  impostorIds?: string[];
  location?: string;
  spyIds?: string[];
  min?: number;
  max?: number;
  answer?: string;
  answers?: string[];
  lieIndex?: number;
  target?: number;
  letter?: string;
  poles?: [string, string];
  forbidden?: string[];
  options?: string[];
  correct?: number;
}

export interface GameAction {
  type: string;
  payload?: unknown;
}

export interface ScoreMap {
  [playerId: string]: number;
}

export interface GameEngine<S = unknown> {
  id: GameId;
  createState(ctx: GameContext): S;
  reduce(state: S, action: GameAction, playerId: string, ctx: GameContext): S;
  publicView(state: S): unknown;
  privateView(state: S, playerId: string): unknown;
  isFinished(state: S): boolean;
  scores(state: S): ScoreMap;
  usedContentId?(state: S): string | undefined;
}

export interface RoomNotice {
  kind: "host-migrated" | "host-reclaimed" | "info";
  text: string;
}

export interface RoomReaction {
  id: string;
  emoji: string;
  playerId: string;
  at: number;
}

export interface NightState {
  queue: GameId[];
  index: number;
}

export interface ClientRoomState {
  code: string;
  you: PlayerPublic;
  players: PlayerPublic[];
  status: RoomStatus;
  gameId: GameId | null;
  public: unknown;
  private: unknown;
  notice: RoomNotice | null;
  canHost: boolean;
  reactions: RoomReaction[];
  night: NightState | null;
  options: GameOptions;
}

export const HOST_GRACE_DEFAULT_MS = 12_000;
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const MAX_PLAYERS = 12;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 18;
export const EMPTY_ROOM_TTL_MS = 2 * 60 * 1000;
export const INACTIVE_ROOM_TTL_MS = 3 * 60 * 60 * 1000;
export const ROOM_SWEEP_INTERVAL_MS = 20_000;
export const MAX_HTTP_BUFFER_SIZE = 100 * 1024;
