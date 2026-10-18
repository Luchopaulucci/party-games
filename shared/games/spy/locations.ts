export interface SpyLocation {
  id: string;
  name: string;
  roles: string[];
}

export const SPY_LOCATIONS: SpyLocation[] = [
  {
    id: "asado",
    name: "un asado en el quincho",
    roles: ["el que atiza", "el de la ensalada", "el que corta el vacío", "el de las birras", "el que pone cumbia", "el que llega tarde con el hielo"],
  },
  {
    id: "subte",
    name: "el subte línea B",
    roles: ["guardia", "pibe del acordeón", "oficina en hora pico", "la que viaja sentada leyendo", "el de los caramelos", "motorman"],
  },
  {
    id: "kiosco",
    name: "un kiosco de barrio",
    roles: ["kiosquero", "el de los puchos", "la de las figuritas", "el que compra un alfajor y se queda", "repositor", "el de la recarga"],
  },
  {
    id: "cancha",
    name: "la cancha un domingo",
    roles: ["hincha de media", "el del bombito", "el que vende choripán", "seguridad", "el que llega al segundo tiempo", "el del trapo"],
  },
  {
    id: "previa",
    name: "una previa en un depto",
    roles: ["el del parlante", "el que no baila", "el del fernet", "el que se queda dormido", "la que llega con una bolsa de hielo", "el que pone 'una más'"],
  },
  {
    id: "peluqueria",
    name: "una peluquería",
    roles: ["peluquero", "el de la palmera", "la que espera hace una hora", "el aprendiz", "el de la revista vieja", "el que pide 'un poquito nada más'"],
  },
  {
    id: "hospital",
    name: "una guardia de hospital",
    roles: ["médica", "el de admisión", "el que está desde las 3 AM", "enfermero", "el familiar con mate", "el que vino por un resfrío"],
  },
  {
    id: "aeroparque",
    name: "Aeroparque",
    roles: ["piloto", "el del café caro", "seguridad", "el que perdió la valija", "el de la demora", "el que viaja por trabajo y lo odia"],
  },
  {
    id: "colegio",
    name: "un acto escolar",
    roles: ["directora", "el chico del poema", "el padre que filma mal", "la maestra", "el que se desmaya con el himno", "el de la bandera"],
  },
  {
    id: "bondi",
    name: "un 60 repleto",
    roles: ["chofer", "el que no paga", "la que pide permiso llorando", "el de la mochila en la cara", "el inspector", "el que viaja en el estribo"],
  },
];
