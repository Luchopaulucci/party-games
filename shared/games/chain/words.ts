import type { ContentPack } from "../packs";

export interface ChainSeed {
  id: string;
  pack: ContentPack;
  word: string;
}

export const CHAIN_SEEDS: ChainSeed[] = [
  { id: "c1", pack: "clasico", word: "mate" },
  { id: "c2", pack: "clasico", word: "bondi" },
  { id: "c3", pack: "clasico", word: "asador" },
  { id: "c4", pack: "clasico", word: "río" },
  { id: "c5", pack: "clasico", word: "cancha" },
  { id: "c6", pack: "fiesta", word: "after" },
  { id: "c7", pack: "fiesta", word: "fernet" },
  { id: "c8", pack: "fiesta", word: "playlist" },
  { id: "c9", pack: "fiesta", word: "taxi" },
  { id: "c10", pack: "picante", word: "chamuyo" },
  { id: "c11", pack: "picante", word: "sofá" },
  { id: "c12", pack: "clasico", word: "lluvia" },
  { id: "c13", pack: "fiesta", word: "karaoke" },
  { id: "c14", pack: "clasico", word: "subte" },
];
