import { z } from "zod";
import { CATEGORIES } from "./games/closest/premise-types";
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  ROOM_CODE_ALPHABET,
  type GameOptions,
  type TestSeed,
} from "./types";

export const BAD_PAYLOAD_ERROR = "Ese mensaje no tiene forma. Mandá de nuevo, no improvises.";
export const SERVER_SAFE_ERROR = "Algo se rompió del lado de la sala, pero seguimos en pie.";

const ALLOWED_CATEGORIES = new Set<string>(CATEGORIES);

export const gameOptionsSchema = z
  .object({
    timerSec: z.union([z.literal(0), z.literal(30), z.literal(45), z.literal(60), z.literal(90)]).optional(),
    rounds: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(8)]).optional(),
    packs: z.array(z.string().min(1).max(32)).max(8).optional(),
    mode: z.string().min(1).max(32).optional(),
    impostorCount: z.number().int().min(1).max(4).optional(),
    spyCount: z.number().int().min(1).max(4).optional(),
    maxGuesses: z.number().int().min(1).max(20).optional(),
  })
  .strict();

export const testSeedSchema = z
  .object({
    questionId: z.string().max(64).optional(),
    trueAnswer: z.number().finite().optional(),
    prompt: z.string().max(240).optional(),
    unit: z.string().max(40).optional(),
    character: z.string().max(80).optional(),
    hint: z.string().max(160).optional(),
    targetId: z.string().max(40).optional(),
    word: z.string().max(80).optional(),
    category: z.string().max(40).optional(),
    impostorIds: z.array(z.string().max(40)).max(12).optional(),
    location: z.string().max(80).optional(),
    spyIds: z.array(z.string().max(40)).max(12).optional(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    answer: z.string().max(80).optional(),
    answers: z.array(z.string().max(80)).max(8).optional(),
    lieIndex: z.number().int().min(0).max(4).optional(),
    target: z.number().finite().optional(),
    letter: z.string().max(2).optional(),
    poles: z.tuple([z.string().max(40), z.string().max(40)]).optional(),
    forbidden: z.array(z.string().max(40)).max(12).optional(),
    options: z.array(z.string().max(80)).max(8).optional(),
    correct: z.number().int().min(0).max(8).optional(),
  })
  .strict();

export const helloPayloadSchema = z
  .object({
    intent: z.enum(["create", "join"]),
    name: z.string().max(64),
    code: z.string().max(16).optional(),
    token: z.string().max(80).optional(),
  })
  .strict();

export const startGamePayloadSchema = z
  .object({
    gameId: z.string().min(1).max(32),
    seed: z.unknown().optional(),
    categories: z.array(z.string().min(1).max(40)).max(16).optional(),
    picante: z.boolean().optional(),
    options: z.unknown().optional(),
  })
  .strict();

export const actionPayloadSchema = z
  .object({
    type: z.string().min(1).max(40),
    payload: z.unknown().optional(),
  })
  .strict();

export type HelloPayload = z.infer<typeof helloPayloadSchema>;
export type StartGamePayload = z.infer<typeof startGamePayloadSchema>;
export type ActionPayload = z.infer<typeof actionPayloadSchema>;

export function cleanName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) return null;
  return name;
}

export function normalizeRoomCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  if (code.length !== 4) return null;
  for (const ch of code) {
    if (!ROOM_CODE_ALPHABET.includes(ch)) return null;
  }
  return code;
}

export function sanitizeToken(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  if (raw.length < 8 || raw.length > 80) return undefined;
  return raw;
}

export function sanitizeCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw.slice(0, CATEGORIES.length)) {
    if (typeof item === "string" && ALLOWED_CATEGORIES.has(item) && !out.includes(item)) {
      out.push(item);
    }
  }
  return out;
}

export function sanitizeGameOptions(raw: unknown): GameOptions {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const rec = raw as Record<string, unknown>;
  const out: GameOptions = {};
  const timer = gameOptionsSchema.shape.timerSec.safeParse(rec.timerSec);
  const rounds = gameOptionsSchema.shape.rounds.safeParse(rec.rounds);
  const packs = gameOptionsSchema.shape.packs.safeParse(rec.packs);
  const mode = gameOptionsSchema.shape.mode.safeParse(rec.mode);
  const impostorCount = gameOptionsSchema.shape.impostorCount.safeParse(rec.impostorCount);
  const spyCount = gameOptionsSchema.shape.spyCount.safeParse(rec.spyCount);
  const maxGuesses = gameOptionsSchema.shape.maxGuesses.safeParse(rec.maxGuesses);
  if (timer.success && timer.data !== undefined) out.timerSec = timer.data;
  if (rounds.success && rounds.data !== undefined) out.rounds = rounds.data;
  if (packs.success && packs.data !== undefined) out.packs = packs.data;
  if (mode.success && mode.data !== undefined) out.mode = mode.data;
  if (impostorCount.success && impostorCount.data !== undefined) out.impostorCount = impostorCount.data;
  if (spyCount.success && spyCount.data !== undefined) out.spyCount = spyCount.data;
  if (maxGuesses.success && maxGuesses.data !== undefined) out.maxGuesses = maxGuesses.data;
  return out;
}

export function sanitizeTestSeed(raw: unknown, allow: boolean): TestSeed | undefined {
  if (!allow || raw == null) return undefined;
  const parsed = testSeedSchema.safeParse(raw);
  return parsed.success ? (parsed.data as TestSeed) : undefined;
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{6})$/;

export function sanitizeStrokeColor(raw: unknown, fallback = "#1e1446"): string {
  if (typeof raw !== "string") return fallback;
  if (HEX_COLOR.test(raw)) return raw.toLowerCase();
  return fallback;
}
