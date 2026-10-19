import Link from "next/link";
import { groupedCatalog } from "@/shared/games/browse";
import { gameSticker } from "@/shared/ui/stickers";

export function GameCatalog() {
  return (
    <div className="stack">
      {groupedCatalog().map((group) => (
        <section key={group.id} className="category-section" data-testid={`group-${group.id}`}>
          <div className="category-section-head">
            <p className="kicker">{group.name}</p>
          </div>
          <div className="grid-2 game-grid">
            {group.games.map((game) => {
              const sticker = gameSticker(game.id);
              return (
                <Link
                  key={game.id}
                  className="tile game-tile"
                  href={`/juego/${game.id}`}
                  style={{ background: sticker.fill, color: sticker.ink }}
                >
                  <span className="game-tile-emoji" aria-hidden>
                    {game.emoji}
                  </span>
                  <b>{game.name}</b>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
