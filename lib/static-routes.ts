import { GAME_IDS } from "@/shared/types";

export function juegoStaticParams() {
  return GAME_IDS.map((id) => ({ id }));
}
