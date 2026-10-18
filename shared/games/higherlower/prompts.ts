export interface HigherLowerPrompt {
  id: string;
  prompt: string;
  answer: number;
  min: number;
  max: number;
  blurb?: string;
}

export const HIGHER_LOWER_PROMPTS: HigherLowerPrompt[] = [
  {
    id: "mundiales",
    prompt: "¿Cuántos Mundiales ganó Argentina?",
    answer: 3,
    min: 0,
    max: 20,
    blurb: "Tres. El resto es debate de Zoom.",
  },
  {
    id: "provincias",
    prompt: "¿Cuántas provincias tiene el país?",
    answer: 23,
    min: 1,
    max: 40,
    blurb: "23. CABA no es provincia, por más que se la crea.",
  },
  {
    id: "comunas",
    prompt: "¿Cuántas comunas tiene CABA?",
    answer: 15,
    min: 1,
    max: 30,
  },
  {
    id: "obelisco",
    prompt: "¿Cuántos metros tiene el Obelisco?",
    answer: 68,
    min: 10,
    max: 200,
    blurb: "67,5 y pico. Redondeamos para no llorar.",
  },
  {
    id: "afa",
    prompt: "¿En qué año se fundó la AFA?",
    answer: 1893,
    min: 1800,
    max: 1950,
  },
  {
    id: "mayo",
    prompt: "¿En qué año fue la Revolución de Mayo?",
    answer: 1810,
    min: 1700,
    max: 1900,
  },
  {
    id: "independencia",
    prompt: "¿En qué año se declaró la Independencia?",
    answer: 1816,
    min: 1700,
    max: 1900,
  },
  {
    id: "subte-lineas",
    prompt: "¿Cuántas líneas de subte hay en Buenos Aires?",
    answer: 6,
    min: 1,
    max: 15,
  },
  {
    id: "empanadas",
    prompt: "¿Cuántas empanadas por persona es lo diplomático en una previa?",
    answer: 4,
    min: 1,
    max: 20,
  },
  {
    id: "fernet-coca",
    prompt: "¿Cuántas partes de Coca van por 1 de fernet, en la receta clásica?",
    answer: 3,
    min: 1,
    max: 10,
  },
];
