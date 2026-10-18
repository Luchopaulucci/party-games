export type WhoAmIPack = "futbolistas" | "famosos" | "politicos";

export const WHOAMI_PACKS: { id: WhoAmIPack; label: string }[] = [
  { id: "futbolistas", label: "Futbolistas" },
  { id: "famosos", label: "Famosos argentinos" },
  { id: "politicos", label: "Políticos" },
];

export interface WhoAmICharacter {
  id: string;
  name: string;
  hint: string;
  pack: WhoAmIPack;
}

export const WHOAMI_CHARACTERS: WhoAmICharacter[] = [
  { id: "messi", pack: "futbolistas", name: "Lionel Messi", hint: "Rosario, la Pulga, siete Balones de Oro." },
  { id: "diego", pack: "futbolistas", name: "Diego Maradona", hint: "El 10. México 86 y una mano que todavía se discute." },
  { id: "dibu", pack: "futbolistas", name: "Emiliano Martínez", hint: "Ataja penales y después te baila en el área." },
  { id: "kun", pack: "futbolistas", name: "Sergio Agüero", hint: "El 9 de Independiente que después comentaba con esa risa." },
  { id: "riquelme", pack: "futbolistas", name: "Juan Román Riquelme", hint: "Pausa, perfil bajo y la última pelota parada de Boca." },
  { id: "gallardo", pack: "futbolistas", name: "Marcelo Gallardo", hint: "El Muñeco. River y cara de pocos amigos en el banco." },
  { id: "dimaria", pack: "futbolistas", name: "Ángel Di María", hint: "Fideo. La final de Lusail y un gol que paró un país." },
  { id: "scaloni", pack: "futbolistas", name: "Lionel Scaloni", hint: "El técnico que armó Qatar 2022 sin levantar la voz." },
  { id: "batistuta", pack: "futbolistas", name: "Gabriel Batistuta", hint: "Batigol. Definición de zurda y un tiro libre que volaba." },
  { id: "kempes", pack: "futbolistas", name: "Mario Kempes", hint: "El Matador. Mundial 78 y bigote de poster." },
  { id: "tevez", pack: "futbolistas", name: "Carlos Tevez", hint: "Apache. Fuerte, de cancha y de barrio." },
  { id: "zanetti", pack: "futbolistas", name: "Javier Zanetti", hint: "Pupi. El capitán eterno del Inter." },
  { id: "aimar", pack: "futbolistas", name: "Pablo Aimar", hint: "Payaso. River, Valencia y un toque que parecía lento." },
  { id: "veron", pack: "futbolistas", name: "Juan Sebastián Verón", hint: "La Brujita. Mediocampo, Estudiantes y Europa." },
  { id: "simeone", pack: "futbolistas", name: "Diego Simeone", hint: "El Cholo. Atlético de Madrid y un grito en la bandita." },
  { id: "julian", pack: "futbolistas", name: "Julián Álvarez", hint: "La Araña. City, Atlético y un Mundial de pibe." },
  { id: "enzo", pack: "futbolistas", name: "Enzo Fernández", hint: "Volante de Chelsea que salió campeón del mundo en Qatar." },
  { id: "depaul", pack: "futbolistas", name: "Rodrigo De Paul", hint: "El motor de la selección. Corre hasta el almacén." },

  { id: "mirtha", pack: "famosos", name: "Mirtha Legrand", hint: "Almuerza en televisión desde que el mundo es mundo." },
  { id: "moria", pack: "famosos", name: "Moria Casán", hint: "La one. Si no la cachás, no viste televisión argentina." },
  { id: "susana", pack: "famosos", name: "Susana Giménez", hint: "¿Qué hacés, chiquita? Rubia, living blanco, rating." },
  { id: "wanda", pack: "famosos", name: "Wanda Nara", hint: "Empresaria, media y una cantidad industrial de tapas." },
  { id: "lali", pack: "famosos", name: "Lali Espósito", hint: "De Cris Morena al Madison. Pop nacional con glitter." },
  { id: "tini", pack: "famosos", name: "Tini Stoessel", hint: "Violeta creció y se hizo festival." },
  { id: "charly", pack: "famosos", name: "Charly García", hint: "Lentes, piano y un país entero de canciones." },
  { id: "spinetta", pack: "famosos", name: "Luis Alberto Spinetta", hint: "El Flaco. Poesía y un jardín de gente." },
  { id: "mercedes", pack: "famosos", name: "Mercedes Sosa", hint: "La Negra. Voz que te para un acto escolar y una plaza." },
  { id: "gardel", pack: "famosos", name: "Carlos Gardel", hint: "Cada día canta mejor. Sombrero y sonrisa." },
  { id: "capusotto", pack: "famosos", name: "Diego Capusotto", hint: "Peter Capusotto, bombos y una tele que se ríe de sí misma." },
  { id: "marley", pack: "famosos", name: "Marley", hint: "Viajes, cámaras escondidas y «esto es increíble»." },
  { id: "guido", pack: "famosos", name: "Guido Kaczka", hint: "Preguntados, un living y un chiste cada quince segundos." },
  { id: "dolina", pack: "famosos", name: "Alejandro Dolina", hint: "La venganza será terrible. Noche, tangos y mitología barrial." },
  { id: "fontanarrosa", pack: "famosos", name: "Roberto Fontanarrosa", hint: "El Negro. Inodoro Pereyra y un café en Rosario." },
  { id: "darin", pack: "famosos", name: "Ricardo Darín", hint: "El secreto de sus ojos y cara de «yo ya lo sabía»." },
  { id: "francella", pack: "famosos", name: "Guillermo Francella", hint: "Casados con hijos y un país que lo cita de memoria." },
  { id: "bizarrap", pack: "famosos", name: "Bizarrap", hint: "BZRP. Sessiones, lentes y un beat que parte una previa." },
  { id: "duki", pack: "famosos", name: "Duki", hint: "Trap argentino, River Plate y un estadio cantando." },
  { id: "nicki", pack: "famosos", name: "Nicki Nicole", hint: "Rosario, rap y una voz que no pide permiso." },
  { id: "china", pack: "famosos", name: "La China Suárez", hint: "Actriz, tapas y un feed que es un culebrón." },
  { id: "coscu", pack: "famosos", name: "Coscu", hint: "Streamer cordobés, Coscu Army, casquito." },
  { id: "tato", pack: "famosos", name: "Tato Bores", hint: "El hombre de negro, monólogos de domingo y la política como sketch." },
  { id: "lesluthiers", pack: "famosos", name: "Les Luthiers", hint: "Humor erudito, instrumentos imposibles y un señor que explica de más." },

  { id: "peron", pack: "politicos", name: "Juan Domingo Perón", hint: "Tres veces presidente y una cantidad infinita de remeras." },
  { id: "evita", pack: "politicos", name: "Eva Perón", hint: "Balcón, moño y un país entero discutiendo su foto." },
  { id: "cfk", pack: "politicos", name: "Cristina Fernández de Kirchner", hint: "Patria, pulsera y un discurso de 40 minutos." },
  { id: "nestor", pack: "politicos", name: "Néstor Kirchner", hint: "Santa Cruz, 2003 y un «vamos por todo» que todavía suena." },
  { id: "milei", pack: "politicos", name: "Javier Milei", hint: "Pelos, motosierra y un perro en el lore." },
  { id: "alfonsin", pack: "politicos", name: "Raúl Alfonsín", hint: "1983, la plaza y «felices Pascuas»." },
  { id: "menem", pack: "politicos", name: "Carlos Menem", hint: "Riojano, Ferrari y un país conversor." },
  { id: "macri", pack: "politicos", name: "Mauricio Macri", hint: "PRO, Boca y un gobierno que se discutió en asado." },
  { id: "yrigoyen", pack: "politicos", name: "Hipólito Yrigoyen", hint: "El peludo. Sufragio secreto y un radicalismo de leyenda." },
  { id: "sarmiento", pack: "politicos", name: "Domingo Faustino Sarmiento", hint: "Escuelas, Facundo y una cara en el billete viejo." },
  { id: "mitre", pack: "politicos", name: "Bartolomé Mitre", hint: "Presidente, historiador y el diario La Nación." },
  { id: "illia", pack: "politicos", name: "Arturo Illia", hint: "El médico de Cruz del Eje. Austero, derrocado, recordado." },
];

export function filterWhoAmI(packs?: string[]): WhoAmICharacter[] {
  const allowed = new Set(
    packs?.length ? packs.filter((p): p is WhoAmIPack => WHOAMI_PACKS.some((x) => x.id === p)) : WHOAMI_PACKS.map((p) => p.id),
  );
  if (allowed.size === 0) return WHOAMI_CHARACTERS;
  return WHOAMI_CHARACTERS.filter((c) => allowed.has(c.pack));
}
