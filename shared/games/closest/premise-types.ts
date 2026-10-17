export const CATEGORIES = [
  "animales",
  "cuerpo",
  "geografia",
  "argentina",
  "espacio",
  "historia",
  "comida",
  "tecnologia",
  "cuerpo-asco",
  "cosas-raras",
  "argentinidad",
  "animales-bizarros",
  "en-que-anio",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Scale = "linear" | "log";
export type PremiseKind = "measure" | "year";

export type Premise = {
  id: string;
  category: Category;
  question: string;
  value: number;
  unit: string;
  unitLabel: string;
  min: number;
  max: number;
  step: number;
  scale: Scale;
  source: { name: string; url: string };
  kind?: PremiseKind;
  disputed?: boolean;
  picante?: boolean;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  animales: "Animales",
  cuerpo: "Cuerpo humano",
  geografia: "Geografía",
  argentina: "Argentina",
  espacio: "Espacio",
  historia: "Historia",
  comida: "Comida",
  tecnologia: "Tecnología",
  "cuerpo-asco": "Cuerpo y asquerosidades",
  "cosas-raras": "Cosas raras",
  argentinidad: "Argentinidad",
  "animales-bizarros": "Animales bizarros",
  "en-que-anio": "¿En qué año?",
};

export const CLASSIC_CATEGORIES: Category[] = [
  "animales",
  "cuerpo",
  "geografia",
  "argentina",
  "espacio",
  "historia",
  "comida",
  "tecnologia",
];

export const FIESTA_CATEGORIES: Category[] = [
  "cuerpo-asco",
  "cosas-raras",
  "argentinidad",
  "animales-bizarros",
  "en-que-anio",
];
