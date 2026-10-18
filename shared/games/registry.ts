import type { GameEngine, GameId, GameMeta } from "../types";
import { closestEngine } from "./closest/logic";
import { whoamiEngine } from "./whoami/logic";
import { impostorEngine } from "./impostor/logic";
import { higherLowerEngine } from "./higherlower/logic";
import { spyEngine } from "./spy/logic";
import { voteEngine } from "./vote/logic";
import { phraseEngine } from "./phrase/logic";
import { lieEngine } from "./lie/logic";
import { reflexEngine } from "./reflex/logic";
import { neverEngine } from "./never/logic";
import { stopEngine } from "./stop/logic";
import { triviaEngine } from "./trivia/logic";
import { chainEngine } from "./chain/logic";
import { emojiEngine } from "./emoji/logic";
import { wouldEngine } from "./would/logic";

const IMPLEMENTED: GameMeta[] = [
  {
    id: "closest",
    name: "¿Quién está más cerca?",
    emoji: "🎯",
    tagline: "Un número. Palos tapados. Gana el que no se fue al pasto.",
    description: "Pregunta numérica, palos secretos, count-up al revelar. Packs de ¿Cuánto es?.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Cada uno tira un número en secreto. Gana el más cerca. Si empatan, se parten los puntos.",
  },
  {
    id: "whoami",
    name: "¿Quién soy?",
    emoji: "🎭",
    tagline: "Todos saben quién sos. Menos vos.",
    description: "Personaje en la frente digital. Preguntas sí/no. Heads Up / Guess Who.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
    howTo: "Filtros: futbolistas, famosos argentinos y políticos. Preguntá sí/no. El resto contesta. Cuando te late, tirá el nombre.",
  },
  {
    id: "impostor",
    name: "El impostor",
    emoji: "🐺",
    tagline: "Uno de ustedes es un chamuyero profesional.",
    description: "Misma palabra menos el impostor. Impostor count configurable.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
    howTo: "Cada uno mira si es impostor o no. Cuando todos dan OK arranca el reloj. Local: señalan y la app revela. Red: votan y se revela.",
  },
  {
    id: "mas-o-menos",
    name: "¿Más o menos?",
    emoji: "📊",
    tagline: "Más alto, más bajo, más chamuyo.",
    description: "Número secreto. Por turno un palo; te dicen más o menos.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
    howTo: "De a uno tiran un número. El server dice más o menos. Quien clava, suma.",
  },
  {
    id: "espia",
    name: "Espía",
    emoji: "🕵️",
    tagline: "Uno mira, otro miente, todos desconfían.",
    description: "Spyfall: lugar + oficio. Cantidad de espías configurable.",
    minPlayers: 4,
    maxPlayers: 12,
    implemented: true,
    howTo: "Hay un escenario y un rol. El rol se actúa con mímica. El espía no ve el lugar. Pregunten y voten.",
  },
  {
    id: "votacion",
    name: "¿Quién es más probable?",
    emoji: "🗳️",
    tagline: "¿Quién de este grupo…? Sin filtro, con consecuencias.",
    description: "Votos secretos. Solo totales.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
    howTo: "Local: se pasa el celu y cada uno vota. Red: una persona lee y los demás votan. Solo totales.",
  },
  {
    id: "completa-frase",
    name: "Completá la frase",
    emoji: "✍️",
    tagline: "Arranca inocente y termina en terapia.",
    description: "Quiplash: todos escriben, se vota el más gracioso. JINX si copian.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
    howTo: "Local: cada uno completa y pasa el celu. Al final las respuestas salen de a una y eligen la mejor. Red: alguien al azar las lee y votan.",
  },
  {
    id: "mentira",
    name: "Mentira creíble",
    emoji: "🤥",
    tagline: "Dos verdades y una mentira, pero con más maldad.",
    description: "Un narrador, tres datos, el resto vota la mentira. Totales nomás.",
    minPlayers: 3,
    maxPlayers: 10,
    implemented: true,
    howTo: "Una persona escribe 3 frases y marca la mentira. Se pasa el celu, votan, y el último voto revela.",
  },
  {
    id: "reflejos",
    name: "Reflejos",
    emoji: "⚡",
    tagline: "El más lento paga el fernet.",
    description: "Objetivo aleatorio entre 2 y 6 s. Arrancás y frenás lo más cerca posible.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Sale un objetivo entre 2 y 6 segundos. Apretá para arrancar y otra vez para frenar lo más cerca posible.",
  },
  {
    id: "yo-nunca",
    name: "Yo nunca",
    emoji: "🖐️",
    tagline: "Levantá la mano… en secreto.",
    description: "Mazo de cartas en un solo teléfono. Solo local.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
    howTo: "Un solo celu, un mazo de cartas. Leen, levantan si aplica, siguiente carta.",
  },
  {
    id: "tutti",
    name: "Tutti frutti",
    emoji: "✏️",
    tagline: "Una letra. Cinco categorías. Pánico colectivo.",
    description: "Stop online. Corta el tiempo o un lleno. Después votan ortografía y recién ahí hay puntos.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Corta el tiempo o cuando alguien completa todo. Después votan si cada respuesta vale (ortografía) y ahí se dan los puntos.",
  },
  {
    id: "trivia",
    name: "Preguntados rápido",
    emoji: "🧠",
    tagline: "Cultura general con acento rioplatense.",
    description: "4 opciones. La correcta no viaja hasta que todos contestan.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Leé, tocá una de las 4. Cuando todos mandan (o el host cierra), se ve la buena.",
  },
  {
    id: "cadena",
    name: "Cadena de palabras",
    emoji: "🔗",
    tagline: "Asociá. No copies. No pienses demasiado.",
    description: "Cada uno tira una palabra que pegue con la anterior.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Una o dos palabras por persona, una vuelta. Al final se ve la frase. En red le llega a cada uno por turno.",
  },
  {
    id: "emoji",
    name: "Adiviná el emoji",
    emoji: "😎",
    tagline: "Tres emojis. Un título. Un orgullo herido.",
    description: "Canción, peli o cosa argentina en emojis.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Mirá los emojis, adivinen en voz alta y pasá el teléfono. La respuesta se revela al final de la ronda.",
  },
  {
    id: "preferis",
    name: "¿Qué preferís?",
    emoji: "🤷",
    tagline: "A o B. Sin término medio. Como en la vida.",
    description: "This or that. Solo online, sin puntaje. Una persona lee.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Solo online y sin puntaje. Una persona lee las dos opciones. El resto vota. Solo totales.",
  },
];

export const GAME_CATALOG: GameMeta[] = IMPLEMENTED;

const ENGINES: Record<GameId, GameEngine> = {
  closest: closestEngine as GameEngine,
  whoami: whoamiEngine as GameEngine,
  impostor: impostorEngine as GameEngine,
  "mas-o-menos": higherLowerEngine as GameEngine,
  espia: spyEngine as GameEngine,
  votacion: voteEngine as GameEngine,
  "completa-frase": phraseEngine as GameEngine,
  mentira: lieEngine as GameEngine,
  reflejos: reflexEngine as GameEngine,
  "yo-nunca": neverEngine as GameEngine,
  tutti: stopEngine as GameEngine,
  trivia: triviaEngine as GameEngine,
  cadena: chainEngine as GameEngine,
  emoji: emojiEngine as GameEngine,
  preferis: wouldEngine as GameEngine,
};

export function getGameMeta(id: GameId): GameMeta | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}

export function getEngine(id: GameId): GameEngine | undefined {
  return ENGINES[id];
}

export function implementedGames(): GameMeta[] {
  return GAME_CATALOG.filter((g) => g.implemented);
}
