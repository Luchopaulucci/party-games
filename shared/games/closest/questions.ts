export interface ClosestQuestion {
  id: string;
  prompt: string;
  answer: number;
  unit?: string;
  blurb?: string;
}

/**
 * Banco de "¿Quién está más cerca?" / "cuánto es".
 * El repo público https://github.com/Luchopaulucci/cuanto-es estaba vacío
 * al armar el MVP, así que copiamos la premisa (pregunta numérica, palos
 * tapados, gana el más cercano) y armamos un mazo argentino con respuestas
 * verificables. Evitamos precios y cotizaciones porque se vencen al toque.
 */
export const CLOSEST_QUESTIONS: ClosestQuestion[] = [
  {
    id: "mundiales-arg",
    prompt: "¿Cuántos Mundiales ganó la Selección argentina?",
    answer: 3,
    blurb: "78, 86 y el de Messi. El resto es chamuyo de cuñado.",
  },
  {
    id: "boca-fundacion",
    prompt: "¿En qué año se fundó Boca Juniors?",
    answer: 1905,
    blurb: "1905, en Dársena Sur. El xeneize es más viejo que tu abuelo bardeando.",
  },
  {
    id: "river-fundacion",
    prompt: "¿En qué año se fundó River Plate?",
    answer: 1901,
    blurb: "1901. Sí, el Millonario es más antiguo. Guardate el canto.",
  },
  {
    id: "maradona-inglaterra",
    prompt: "¿En qué año Maradona le hizo el 2-1 a Inglaterra en el Mundial?",
    answer: 1986,
    blurb: "México 86. La mano de Dios y el gol del siglo, mismo partido. Exagerado.",
  },
  {
    id: "messi-nacimiento",
    prompt: "¿En qué año nació Lionel Messi?",
    answer: 1987,
    blurb: "24 de junio de 1987, Rosario. El resto de la fecha es al pedo para este juego.",
  },
  {
    id: "afa-fundacion",
    prompt: "¿En qué año se fundó la AFA?",
    answer: 1893,
    blurb: "1893. Hace más de un siglo que discutimos alineaciones.",
  },
  {
    id: "obelisco-altura",
    prompt: "¿Cuántos metros de alto tiene el Obelisco?",
    answer: 67.5,
    unit: "m",
    blurb: "67,5 m. Alcancía porteña con pretensiones de faro.",
  },
  {
    id: "caba-comunas",
    prompt: "¿Cuántas comunas tiene la Ciudad de Buenos Aires?",
    answer: 15,
    blurb: "15 comunas. Como los jugadores de campo, pero con baches.",
  },
  {
    id: "caba-barrios",
    prompt: "¿Cuántos barrios oficiales tiene CABA?",
    answer: 48,
    blurb: "48. Si nombraste Palermo Soho como barrio, restamos puntos morales.",
  },
  {
    id: "km-caba-rosario",
    prompt: "¿Cuántos kilómetros hay, más o menos, de CABA a Rosario por ruta?",
    answer: 300,
    unit: "km",
    blurb: "Alrededor de 300 km. Tres horas si no hay un camión volcado en San Nicolás.",
  },
  {
    id: "km-caba-mardel",
    prompt: "¿Cuántos kilómetros hay de CABA a Mar del Plata por la 2?",
    answer: 400,
    unit: "km",
    blurb: "Casi 400 km. El último tramo siempre es 'ya falta poco' mentiroso.",
  },
  {
    id: "iguazu-cataratas",
    prompt: "¿Cuántas cataratas tiene, aprox., el sistema de Iguazú?",
    answer: 275,
    blurb: "Unas 275. La Garganta del Diablo se reserva el drama.",
  },
  {
    id: "aconcagua",
    prompt: "¿Cuántos metros tiene el Aconcagua?",
    answer: 6961,
    unit: "m",
    blurb: "6.961 m. El techo de América, y de varios egos de trekking.",
  },
  {
    id: "provincias",
    prompt: "¿Cuántas provincias tiene la Argentina?",
    answer: 23,
    blurb: "23 provincias + CABA. Si dijiste 24 te perdonamos, está bien el espíritu.",
  },
  {
    id: "copa-america-arg",
    prompt: "¿Cuántas Copas América ganó Argentina hasta 2024 inclusive?",
    answer: 16,
    blurb: "16. El récord compartido con Uruguay, para que no se la crean del todo.",
  },
  {
    id: "bombonera-capacidad",
    prompt: "¿Cuál es la capacidad oficial aproximada de la Bombonera?",
    answer: 54000,
    unit: "personas",
    blurb: "Alrededor de 54.000. En la tribuna entran más si no preguntás.",
  },
  {
    id: "monumental-capacidad",
    prompt: "¿Cuál es la capacidad aproximada del Monumental remodelado?",
    answer: 85000,
    unit: "personas",
    blurb: "Cerca de 85.000. Un pueblo entero bardeando al mismo tiempo.",
  },
  {
    id: "eva-nacimiento",
    prompt: "¿En qué año nació Eva Perón?",
    answer: 1919,
    blurb: "1919, Los Toldos. Después vino el resto de la mitología.",
  },
  {
    id: "casa-rosada-casa",
    prompt: "¿En qué año se inauguró el actual edificio de la Casa Rosada?",
    answer: 1898,
    blurb: "1898. El color rosa es más viejo que cualquier tweet.",
  },
  {
    id: "tango-unesco",
    prompt: "¿En qué año la UNESCO declaró al tango Patrimonio de la Humanidad?",
    answer: 2009,
    blurb: "2009. Gardel no se enteró, estaba en otra frecuencia.",
  },
  {
    id: "alfajores-havanna",
    prompt: "¿En qué año se fundó Havanna?",
    answer: 1947,
    blurb: "1947, Mar del Plata. El alfajor de la ruta, no el de la dietética.",
  },
  {
    id: "ferneteros",
    prompt: "¿En qué año se lanzó Fernet Branca en Italia? (el original, no el de tu tío)",
    answer: 1845,
    blurb: "1845. El fernet es más antiguo que la Argentina moderna. Respetá la botella.",
  },
  {
    id: "mate-guarani",
    prompt: "¿Cuántos mililitros tiene, más o menos, un mate cebado 'normal'?",
    answer: 50,
    unit: "ml",
    blurb: "Tipo 30–70 ml. Si llenás como termo, no es mate, es sopa.",
  },
  {
    id: "subte-lineas",
    prompt: "¿Cuántas líneas de subte tiene Buenos Aires?",
    answer: 6,
    blurb: "6: A, B, C, D, E y H. La F es el cuento que le contamos a los turistas.",
  },
  {
    id: "subte-a-madera",
    prompt: "¿En qué año se inauguró la línea A del subte, la de los vagones de madera?",
    answer: 1913,
    blurb: "1913. Primer subte de Latinoamérica. Tus bisabuelos ya llegaban tarde.",
  },
  {
    id: "malvinas-anio",
    prompt: "¿En qué año fue la guerra de Malvinas?",
    answer: 1982,
    blurb: "1982. Pregunta seria en un juego boludo. Merece el número exacto.",
  },
  {
    id: "gol-maradona-inglaterra-minuto",
    prompt: "¿En qué minuto, aprox., fue el segundo gol de Maradona a Inglaterra (el bueno)?",
    answer: 55,
    unit: "min",
    blurb: "Minuto 55. Diez segundos de genialidad y 40 años de replay.",
  },
  {
    id: "diego-goles-seleccion",
    prompt: "¿Cuántos goles hizo Maradona en la Selección mayor?",
    answer: 34,
    blurb: "34 goles en 91 partidos. Los números no pelean con la leyenda.",
  },
  {
    id: "messi-goles-seleccion-2022",
    prompt: "¿Cuántos goles llevaba Messi en la Selección al terminar el Mundial 2022?",
    answer: 98,
    blurb: "98 en ese corte. Después siguió sumando, pero la pregunta es esa foto.",
  },
  {
    id: "quilmes-fundacion",
    prompt: "¿En qué año se fundó la cervecería Quilmes?",
    answer: 1888,
    blurb: "1888. 'El sabor del encuentro' viene con más de un siglo de almanaque.",
  },
  {
    id: "teatro-colon",
    prompt: "¿En qué año se inauguró el Teatro Colón actual?",
    answer: 1908,
    blurb: "1908. Si nunca fuiste, mentí con dignidad.",
  },
  {
    id: "caminito",
    prompt: "¿En qué año se pintó y armó el Paseo de Caminito como lo conocemos?",
    answer: 1959,
    blurb: "1959, idea de Quinquela Martín. Antes era un pasillo con más barro que postcard.",
  },
  {
    id: "dni-digitos",
    prompt: "¿Cuántos dígitos tiene un DNI argentino actual (el numerito, sin puntos)?",
    answer: 8,
    blurb: "8. Si pusiste 7 sos de la generación que extraña la libreta cívica.",
  },
  {
    id: "feriado-25-mayo",
    prompt: "¿En qué año fue la Revolución de Mayo?",
    answer: 1810,
    blurb: "1810. El acto escolar más largo de tu infancia.",
  },
  {
    id: "independencia",
    prompt: "¿En qué año se declaró la Independencia argentina?",
    answer: 1816,
    blurb: "1816, Tucumán. Nueve de julio, empanadas y un discurso del director.",
  },
  {
    id: "puente-mujer",
    prompt: "¿En qué año se inauguró el Puente de la Mujer en Puerto Madero?",
    answer: 2001,
    blurb: "2001. Calatrava, acero y la crisis haciendo de extra.",
  },
  {
    id: "estrictamente-<1>",
    prompt: "¿Cuántos jugadores hay en cancha por equipo en un partido de fútbol 11?",
    answer: 11,
    blurb: "11. Si fallaste esta, devolvé el celular y andá a picar cebolla.",
  },
  {
    id: "penalty-metros",
    prompt: "¿A cuántos metros del arco se patea un penal?",
    answer: 11,
    unit: "m",
    blurb: "11 metros. Casualidad con los jugadores, no con tu fe.",
  },
  {
    id: "empanada-hora",
    prompt: "¿Cuántas empanadas por persona calcula un argentino razonable para una previa?",
    answer: 4,
    blurb: "4 es el número diplomático. 6 si el asado tarda. 12 si eres vos.",
  },
  {
    id: "ferneteros-proporcion",
    prompt: "¿Cuántas partes de Coca lleva un fernet 'bien puesto' clásico (por 1 de fernet)?",
    answer: 3,
    blurb: "1 de fernet, 3 de Coca. Si ponés 1 y 1, estás haciendo un trago de venganza.",
  },
  {
    id: "patoruzu-anio",
    prompt: "¿En qué año nació el personaje Patoruzú (primera aparición)?",
    answer: 1928,
    blurb: "1928, Dante Quinterno. Antes de que 'viral' fuera una palabra.",
  },
  {
    id: "mafalda-anio",
    prompt: "¿En qué año apareció Mafalda por primera vez?",
    answer: 1964,
    blurb: "1964. Quino nos adelantó el carácter de media Argentina.",
  },
  {
    id: "mundial-78-final-goles",
    prompt: "¿Cuántos goles le hizo Argentina a Holanda en la final del 78?",
    answer: 3,
    blurb: "3-1. Kempes y Bertoni. El resto, debate de sobremesa.",
  },
  {
    id: "boca-libertadores-1",
    prompt: "¿En qué año Boca ganó su primera Copa Libertadores?",
    answer: 1977,
    blurb: "1977. Primera Libertadores xeneize. Pregunta corta, grito largo.",
  },
];
