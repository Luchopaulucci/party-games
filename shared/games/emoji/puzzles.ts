import type { ContentPack } from "../packs";

export interface EmojiPuzzle {
  id: string;
  pack: ContentPack;
  puzzle: string;
  answer: string;
  hint: string;
}

export const EMOJI_PUZZLES: EmojiPuzzle[] = [
  { id: "e1", pack: "clasico", puzzle: "🦁👑🌅", answer: "el rey león", hint: "Disney + pasto" },
  { id: "e2", pack: "clasico", puzzle: "🧊❄️👸", answer: "frozen", hint: "soltó" },
  { id: "e3", pack: "clasico", puzzle: "🧉🔥💚", answer: "mate", hint: "amargo o dulce, no se discute" },
  { id: "e4", pack: "clasico", puzzle: "⚽🔟🇦🇷", answer: "maradona", hint: "la mano de..." },
  { id: "e5", pack: "clasico", puzzle: "🌉🌁💃", answer: "tango", hint: "2x4" },
  { id: "e6", pack: "fiesta", puzzle: "🍺🍋🖤", answer: "fernet", hint: "70/30 o 50/50" },
  { id: "e7", pack: "fiesta", puzzle: "🎤🚌🌙", answer: "after", hint: "cuando 'ya me voy'" },
  { id: "e8", pack: "fiesta", puzzle: "🚗📍🥴", answer: "uber", hint: "compartí la ubicación" },
  { id: "e9", pack: "fiesta", puzzle: "🎧📼🏫", answer: "playlist de la secundaria", hint: "el DJ del cumple" },
  { id: "e10", pack: "fiesta", puzzle: "🥩🔥👨‍🍳", answer: "asado", hint: "no toques la parrilla" },
  { id: "e11", pack: "picante", puzzle: "👀📱🔥", answer: "stalkear", hint: "stories a las 3" },
  { id: "e12", pack: "picante", puzzle: "🍷🛋️🌙", answer: "quedate", hint: "ya no hay bondi" },
  { id: "e13", pack: "clasico", puzzle: "🌙⭐🌊", answer: "mar", hint: "o la costa" },
  { id: "e14", pack: "clasico", puzzle: "🚂🏔️❄️", answer: "bariloche", hint: "egresados y chocolate" },
  { id: "e15", pack: "fiesta", puzzle: "🎂🎈🥴", answer: "cumple", hint: "el de 30 duele" },
  { id: "e16", pack: "clasico", puzzle: "📺🍩💛", answer: "los simpson", hint: "d'oh" },
];
