import { PLAYER_COLORS } from "@/shared/ui/colors";
import type { PlayerPublic } from "@/shared/types";

export function playerColor(player: { id: string; color?: string }, index = 0): string {
  return player.color || PLAYER_COLORS[index % PLAYER_COLORS.length]!;
}

export function PlayerList({
  players,
  youId,
}: {
  players: { id: string; name: string; score: number; connected?: boolean; isHost?: boolean; color?: string }[];
  youId?: string;
}) {
  return (
    <div className="players">
      {[...players]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => (
        <div className="player" key={p.id}>
          <span className="swatch" style={{ background: playerColor(p, i) }} />
          <div className="meta" style={{ flex: 1 }}>
            <strong>
              {p.name}
              {p.id === youId ? " · vos" : ""}
            </strong>
            <small>
              {p.isHost ? "anfitrión" : "jugador"}
              {p.connected === false ? " · se fue a picar" : ""}
            </small>
          </div>
          <div className="score">{p.score}</div>
        </div>
      ))}
    </div>
  );
}

export function asPublic(players: PlayerPublic[]) {
  return players;
}
