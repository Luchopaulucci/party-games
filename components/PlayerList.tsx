import type { PlayerPublic } from "@/shared/types";

export function PlayerList({
  players,
  youId,
}: {
  players: { id: string; name: string; score: number; connected?: boolean; isHost?: boolean }[];
  youId?: string;
}) {
  return (
    <div className="players">
      {players.map((p) => (
        <div className="player" key={p.id}>
          <div className="meta">
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
