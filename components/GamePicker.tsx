import { GAME_CATALOG } from "@/shared/games/registry";
import type { GameId } from "@/shared/types";

export function GamePicker({
  onPick,
  disabled,
  playerCount,
  implementedOnly = false,
}: {
  onPick?: (id: GameId) => void;
  disabled?: boolean;
  playerCount?: number;
  implementedOnly?: boolean;
}) {
  const games = implementedOnly ? GAME_CATALOG.filter((g) => g.implemented) : GAME_CATALOG;

  return (
    <div className="stack">
      {games.map((game) => {
        const enough = playerCount === undefined || playerCount >= game.minPlayers;
        const clickable = game.implemented && onPick && !disabled && enough;
        const inner = (
          <>
            <span>{game.emoji}</span>
            <b>{game.name}</b>
            <p>{game.tagline}</p>
            {!game.implemented ? (
              <small>Próximamente. No jodas.</small>
            ) : (
              <small>
                {game.minPlayers}+ jugadores
                {playerCount !== undefined && playerCount < game.minPlayers ? " · faltan pibes" : ""}
              </small>
            )}
          </>
        );
        if (!clickable) {
          return (
            <div key={game.id} className={`tile ${game.implemented ? "" : "soon"}`}>
              {inner}
            </div>
          );
        }
        return (
          <button key={game.id} type="button" className="tile" onClick={() => onPick(game.id)}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
